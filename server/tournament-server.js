const express = require('express');
const cors = require('cors');
const axios = require('axios');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Store active tournaments in memory (in production, use Redis or database)
const tournaments = new Map();
const connections = new Map();

// WebSocket connection handling
wss.on('connection', (ws) => {
  let tournamentId = null;
  let playerId = null;

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    switch (data.type) {
      case 'join-tournament':
        tournamentId = data.tournamentId;
        playerId = data.playerId;
        
        if (!connections.has(tournamentId)) {
          connections.set(tournamentId, new Map());
        }
        connections.get(tournamentId).set(playerId, ws);
        
        // Send current tournament state
        if (tournaments.has(tournamentId)) {
          ws.send(JSON.stringify({
            type: 'tournament-update',
            tournament: tournaments.get(tournamentId)
          }));
        }
        break;
        
      case 'update-tournament':
        if (tournaments.has(tournamentId)) {
          tournaments.set(tournamentId, data.tournament);
          // Broadcast to all participants
          broadcastToTournament(tournamentId, {
            type: 'tournament-update',
            tournament: data.tournament
          });
        }
        break;
    }
  });

  ws.on('close', () => {
    if (tournamentId && playerId && connections.has(tournamentId)) {
      connections.get(tournamentId).delete(playerId);
    }
  });
});

// Broadcast to all tournament participants
function broadcastToTournament(tournamentId, data) {
  if (connections.has(tournamentId)) {
    connections.get(tournamentId).forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  }
}

// API Routes

// Create tournament
app.post('/api/tournament/create', (req, res) => {
  const tournamentId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const tournament = {
    id: tournamentId,
    players: [],
    bracket: null,
    createdAt: Date.now(),
    status: 'waiting'
  };
  
  tournaments.set(tournamentId, tournament);
  
  res.json({ tournamentId, tournament });
});

// Join tournament
app.post('/api/tournament/join', async (req, res) => {
  const { tournamentId, playerName, cfHandle } = req.body;
  
  if (!tournaments.has(tournamentId)) {
    return res.status(404).json({ error: 'Tournament not found' });
  }
  
  const tournament = tournaments.get(tournamentId);
  
  if (tournament.players.length >= 4) {
    return res.status(400).json({ error: 'Tournament is full' });
  }
  
  try {
    // Fetch CF user data
    const cfResponse = await axios.get(
      `https://codeforces.com/api/user.info?handles=${cfHandle}`
    );
    
    if (cfResponse.data.status !== 'OK') {
      return res.status(400).json({ error: 'Invalid Codeforces handle' });
    }
    
    const cfData = cfResponse.data.result[0];
    const player = {
      id: tournament.players.length + 1,
      name: playerName,
      cfHandle: cfHandle,
      avatar: ['🥷', '🧙‍♂️', '⚔️', '🐉'][tournament.players.length],
      rating: cfData.rating || 0,
      maxRating: cfData.maxRating || 0,
      rank: cfData.rank || 'unrated'
    };
    
    tournament.players.push(player);
    
    // If 4 players joined, create bracket
    if (tournament.players.length === 4) {
      tournament.bracket = createBracket(tournament.players);
      tournament.status = 'ready';
    }
    
    tournaments.set(tournamentId, tournament);
    
    // Broadcast update to all participants
    broadcastToTournament(tournamentId, {
      type: 'tournament-update',
      tournament
    });
    
    res.json({ success: true, tournament });
  } catch (error) {
    console.error('Error joining tournament:', error);
    res.status(500).json({ error: 'Failed to join tournament' });
  }
});

// Get tournament status
app.get('/api/tournament/:id', (req, res) => {
  const { id } = req.params;
  
  if (!tournaments.has(id)) {
    return res.status(404).json({ error: 'Tournament not found' });
  }
  
  res.json({ tournament: tournaments.get(id) });
});

// Check submissions for a match
app.post('/api/tournament/check-submissions', async (req, res) => {
  const { tournamentId, matchId, matchStartTime } = req.body;
  
  if (!tournaments.has(tournamentId)) {
    return res.status(404).json({ error: 'Tournament not found' });
  }
  
  const tournament = tournaments.get(tournamentId);
  const match = findMatch(tournament.bracket, matchId);
  
  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }
  
  const results = {};
  
  for (const player of [match.player1, match.player2]) {
    try {
      const response = await axios.get(
        `https://codeforces.com/api/user.status?handle=${player.cfHandle}&from=1&count=20`
      );
      
      if (response.data.status === 'OK') {
        // Check recent submissions for the match problem
        const submission = response.data.result.find(sub => 
          sub.problem.contestId === match.cfProblem.contest &&
          sub.problem.index === match.cfProblem.index &&
          sub.creationTimeSeconds * 1000 > matchStartTime
        );
        
        if (submission) {
          results[player.id] = {
            verdict: submission.verdict,
            time: submission.creationTimeSeconds * 1000,
            language: submission.programmingLanguage,
            submissionId: submission.id
          };
          
          // If accepted, update match winner
          if (submission.verdict === 'OK' && !match.winner) {
            match.winner = player;
            updateBracket(tournament.bracket, matchId, player);
            tournaments.set(tournamentId, tournament);
            
            // Broadcast winner to all participants
            broadcastToTournament(tournamentId, {
              type: 'match-winner',
              matchId,
              winner: player,
              tournament
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error checking submissions for ${player.cfHandle}:`, error);
    }
  }
  
  res.json({ results, match });
});

// Helper functions
function createBracket(players) {
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  
  return {
    semifinals: [
      {
        id: 1,
        player1: shuffled[0],
        player2: shuffled[1],
        winner: null,
        cfProblem: generateCFProblem()
      },
      {
        id: 2,
        player1: shuffled[2],
        player2: shuffled[3],
        winner: null,
        cfProblem: generateCFProblem()
      }
    ],
    consolation: [
      { id: 3, player1: null, player2: null, winner: null, cfProblem: null },
      { id: 4, player1: null, player2: null, winner: null, cfProblem: null }
    ],
    finals: { id: 5, player1: null, player2: null, winner: null, cfProblem: null }
  };
}

function generateCFProblem() {
  const problems = [
    { contest: 1850, index: 'A', name: 'To My Critics', rating: 800 },
    { contest: 1849, index: 'B', name: 'Comparison String', rating: 900 },
    { contest: 1847, index: 'C', name: 'Vampiric Powers', rating: 1000 },
    { contest: 1846, index: 'D', name: 'Rudolph and Christmas Tree', rating: 1200 },
    { contest: 1845, index: 'A', name: 'Forbidden Integer', rating: 800 },
    { contest: 1844, index: 'B', name: 'Permutations & Primes', rating: 1000 },
    { contest: 1843, index: 'A', name: 'Sasha and Array Coloring', rating: 800 },
    { contest: 1842, index: 'B', name: 'Tenzin and Books', rating: 900 }
  ];
  return problems[Math.floor(Math.random() * problems.length)];
}

function findMatch(bracket, matchId) {
  // Check semifinals
  const semifinal = bracket.semifinals.find(m => m.id === matchId);
  if (semifinal) return semifinal;
  
  // Check consolation
  const consolation = bracket.consolation.find(m => m.id === matchId);
  if (consolation) return consolation;
  
  // Check finals
  if (bracket.finals.id === matchId) return bracket.finals;
  
  return null;
}

function updateBracket(bracket, matchId, winner) {
  const match = findMatch(bracket, matchId);
  if (!match) return;
  
  match.winner = winner;
  
  // Handle bracket progression
  if (matchId <= 2) {
    // Semifinal match
    const loser = match.player1.id === winner.id ? match.player2 : match.player1;
    
    if (matchId === 1) {
      bracket.consolation[0].player1 = loser;
    } else {
      bracket.consolation[1].player1 = loser;
    }
    
    // Check if both semifinals are done
    if (bracket.semifinals[0].winner && bracket.semifinals[1].winner) {
      bracket.finals.player1 = bracket.semifinals[0].winner;
      bracket.finals.player2 = bracket.semifinals[1].winner;
      bracket.finals.cfProblem = generateCFProblem();
      
      // Set up consolation match
      bracket.consolation[0].player2 = bracket.consolation[1].player1;
      bracket.consolation[0].cfProblem = generateCFProblem();
      bracket.consolation[1].player2 = bracket.consolation[0].player1;
      bracket.consolation[1].cfProblem = generateCFProblem();
    }
  }
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Tournament server running on port ${PORT}`);
});
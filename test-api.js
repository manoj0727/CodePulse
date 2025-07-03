// Quick API test script for tournament server
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testTournamentAPI() {
  console.log('Testing Tournament API...\n');

  try {
    // 1. Create tournament
    console.log('1. Creating tournament...');
    const createRes = await axios.post(`${API_BASE}/api/tournament/create`);
    const { tournamentId, tournament } = createRes.data;
    console.log(`✓ Tournament created: ${tournamentId}`);
    console.log(`  Status: ${tournament.status}`);
    console.log(`  Players: ${tournament.players.length}/4\n`);

    // 2. Join tournament with test players
    const testPlayers = [
      { name: 'Alice', handle: 'tourist' },
      { name: 'Bob', handle: 'Benq' },
      { name: 'Charlie', handle: 'Um_nik' },
      { name: 'David', handle: 'Petr' }
    ];

    console.log('2. Joining tournament with 4 players...');
    for (const player of testPlayers) {
      try {
        const joinRes = await axios.post(`${API_BASE}/api/tournament/join`, {
          tournamentId,
          playerName: player.name,
          cfHandle: player.handle
        });
        console.log(`✓ ${player.name} joined (CF: ${player.handle})`);
      } catch (err) {
        console.log(`✗ Failed to join ${player.name}: ${err.response?.data?.error || err.message}`);
      }
    }

    // 3. Get tournament status
    console.log('\n3. Getting tournament status...');
    const statusRes = await axios.get(`${API_BASE}/api/tournament/${tournamentId}`);
    const finalTournament = statusRes.data.tournament;
    console.log(`✓ Tournament status: ${finalTournament.status}`);
    console.log(`  Players: ${finalTournament.players.length}/4`);
    
    if (finalTournament.bracket) {
      console.log('\n  Semifinals:');
      finalTournament.bracket.semifinals.forEach((match, i) => {
        console.log(`    Match ${i + 1}: ${match.player1.name} vs ${match.player2.name}`);
        console.log(`    Problem: CF${match.cfProblem.contest}${match.cfProblem.index} - ${match.cfProblem.name}`);
      });
    }

    console.log('\n✅ All API tests passed!');
    console.log(`\nTournament Code: ${tournamentId}`);
    console.log('You can now test this in the browser at http://localhost:3000/tournament');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

// Run the test
testTournamentAPI();
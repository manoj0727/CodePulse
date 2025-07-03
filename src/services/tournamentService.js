// Tournament Service for real-time CF tournaments
const API_BASE = process.env.REACT_APP_TOURNAMENT_API || 'http://localhost:3001';
const WS_BASE = process.env.REACT_APP_TOURNAMENT_WS || 'ws://localhost:3001';

class TournamentService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.tournamentId = null;
    this.playerId = null;
  }

  // Connect to WebSocket for real-time updates
  connect(tournamentId, playerId) {
    this.tournamentId = tournamentId;
    this.playerId = playerId;

    this.ws = new WebSocket(WS_BASE);

    this.ws.onopen = () => {
      console.log('Connected to tournament server');
      this.ws.send(JSON.stringify({
        type: 'join-tournament',
        tournamentId,
        playerId
      }));
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from tournament server');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (this.tournamentId && this.playerId) {
          this.connect(this.tournamentId, this.playerId);
        }
      }, 3000);
    };
  }

  // Handle incoming WebSocket messages
  handleMessage(data) {
    switch (data.type) {
      case 'tournament-update':
        this.emit('tournament-update', data.tournament);
        break;
      case 'match-winner':
        this.emit('match-winner', data);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  // Send tournament update
  updateTournament(tournament) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'update-tournament',
        tournament
      }));
    }
  }

  // API methods
  async createTournament() {
    try {
      const response = await fetch(`${API_BASE}/api/tournament/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw error;
    }
  }

  async joinTournament(tournamentId, playerName, cfHandle) {
    try {
      const response = await fetch(`${API_BASE}/api/tournament/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, playerName, cfHandle })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join tournament');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error joining tournament:', error);
      throw error;
    }
  }

  async getTournament(tournamentId) {
    try {
      const response = await fetch(`${API_BASE}/api/tournament/${tournamentId}`);
      if (!response.ok) {
        throw new Error('Tournament not found');
      }
      const data = await response.json();
      return data.tournament;
    } catch (error) {
      console.error('Error fetching tournament:', error);
      throw error;
    }
  }

  async checkSubmissions(tournamentId, matchId, matchStartTime) {
    try {
      const response = await fetch(`${API_BASE}/api/tournament/check-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, matchId, matchStartTime })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking submissions:', error);
      throw error;
    }
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.tournamentId = null;
    this.playerId = null;
    this.listeners.clear();
  }
}

// Export singleton instance
const tournamentService = new TournamentService();
export default tournamentService;
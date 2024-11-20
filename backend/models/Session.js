class Session {
  constructor(id, players = [], gameState = {}) {
    this.id = id;
    this.players = players;
    this.gameState = gameState;
    this.createdAt = new Date();
    this.status = 'waiting'; // waiting, active, completed
  }
}

// In-memory storage for sessions (replace with database in production)
const sessions = new Map();

module.exports = {
  Session,
  sessions
}; 
// An enum for the game state
enum GameState {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed'
};

// A strongly-typed session object
class Session {
  id: string;
  players: never[];
  gameState: {};
  status: GameState;
  createdAt: Date;
  constructor(id: string, players = [], gameState: {}, status = GameState.WAITING, createdAt = new Date()) {
    this.id = id;
    this.players = players;
    this.gameState = gameState;
    this.status = status;
    this.createdAt = createdAt;
  }
}

// In-memory storage for sessions (replace with database in production)
const sessions = new Map();

module.exports = {
  Session,
  sessions
};


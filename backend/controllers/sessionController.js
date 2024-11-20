const { v4: uuidv4 } = require('uuid');
const { Session, sessions } = require('../models/Session');

const sessionController = {
  createSession: (req, res) => {
    const sessionId = uuidv4();
    const newSession = new Session(sessionId);
    sessions.set(sessionId, newSession);
    res.status(201).json(newSession);
  },

  getSession: (req, res) => {
    const session = sessions.get(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  },

  joinSession: (req, res) => {
    const session = sessions.get(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { playerId, playerName } = req.body;
    if (session.players.find(p => p.id === playerId)) {
      return res.status(400).json({ error: 'Player already in session' });
    }

    session.players.push({ id: playerId, name: playerName });
    res.json(session);
  },

  updateGameState: (req, res) => {
    const session = sessions.get(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.gameState = { ...session.gameState, ...req.body };
    res.json(session);
  }
};

module.exports = sessionController; 
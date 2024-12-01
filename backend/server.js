const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3001;

console.log('Initializing server...');

app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
    console.log('Test endpoint hit');
    res.json({ status: 'Server is running' });
});

// Store active games and their participants
const games = new Map();
// Keep track of all connected clients
const clients = new Map();

// REST endpoint for creating a new game
app.post('/api/games', (req, res) => {
    try {
        const { playerId } = req.body;
        if (!playerId) {
            return res.status(400).json({ error: 'Player ID is required' });
        }

        const gameCode = generateGameCode();
        const game = {
            host: playerId,
            players: new Set([playerId]),
            state: {
                status: 'waiting',
                currentRound: 0,
                currentTurn: null
            }
        };
        games.set(gameCode, game);
        
        console.log(`Game created: ${gameCode} by player: ${playerId}`);
        res.json({ 
            gameCode,
            players: Array.from(game.players)
        });
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({ error: 'Failed to create game' });
    }
});

// REST endpoint for checking if a game exists
app.get('/api/games/:code', (req, res) => {
    try {
        const { code } = req.params;
        if (!games.has(code)) {
            return res.status(404).json({ error: 'Game not found' });
        }

        const game = games.get(code);
        res.json({
            exists: true,
            players: Array.from(game.players),
            status: game.state.status
        });
    } catch (error) {
        console.error('Error checking game:', error);
        res.status(500).json({ error: 'Failed to check game' });
    }
});

// WebSocket connection handling
wss.on('connection', (ws) => {
    const clientId = generateClientId();
    clients.set(ws, { id: clientId });
    
    // Send the client their ID
    ws.send(JSON.stringify({
        type: 'connection',
        data: { id: clientId }
    }));

    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            handleMessage(ws, parsedMessage);
        } catch (error) {
            console.error('Failed to parse message:', error);
        }
    });

    ws.on('close', () => {
        const clientData = clients.get(ws);
        if (clientData) {
            handlePlayerDisconnect(ws, clientData);
            clients.delete(ws);
        }
    });
});

// Handle different message types
function handleMessage(ws, message) {
    switch (message.type) {
        case 'create_game':
            handleCreateGame(ws, message.data);
            break;

        case 'join_game':
            handleJoinGame(ws, message.data);
            break;

        case 'signal':
            handleSignaling(ws, message.data);
            break;

        case 'game_state_update':
            handleGameStateUpdate(ws, message.data);
            break;

        default:
            console.log('Unknown message type:', message.type);
    }
}

// Handle game creation
function handleCreateGame(ws, data) {
    const { gameCode } = data;
    const clientData = clients.get(ws);
    
    if (games.has(gameCode)) {
        const game = games.get(gameCode);
        game.host = clientData.id;
        game.players.add(clientData.id);
        clients.get(ws).gameCode = gameCode;
        
        ws.send(JSON.stringify({
            type: 'game_created',
            data: {
                gameCode,
                playerId: clientData.id,
                isHost: true
            }
        }));
    }
}

// Handle player joining
function handleJoinGame(ws, data) {
    const { gameCode } = data;
    const clientData = clients.get(ws);
    
    if (games.has(gameCode)) {
        const game = games.get(gameCode);
        game.players.add(clientData.id);
        clients.get(ws).gameCode = gameCode;

        // Notify the new player
        ws.send(JSON.stringify({
            type: 'game_joined',
            data: {
                gameCode,
                playerId: clientData.id,
                isHost: false,
                state: game.state
            }
        }));

        // Notify other players in the game
        broadcastToGame(gameCode, {
            type: 'player_joined',
            data: {
                playerId: clientData.id,
                playerCount: game.players.size
            }
        }, ws);
    }
}

// Handle signaling between peers
function handleSignaling(ws, data) {
    const { target, signal } = data;
    const senderData = clients.get(ws);
    
    // Find the target client's WebSocket
    const targetWs = [...clients.entries()]
        .find(([_, data]) => data.id === target)?.[0];
    
    if (targetWs) {
        targetWs.send(JSON.stringify({
            type: 'signal',
            data: {
                signal,
                from: senderData.id
            }
        }));
    }
}

// Handle game state updates
function handleGameStateUpdate(ws, data) {
    const clientData = clients.get(ws);
    const { gameCode } = clientData;
    
    if (games.has(gameCode)) {
        const game = games.get(gameCode);
        game.state = { ...game.state, ...data };
        
        // Broadcast state update to all players
        broadcastToGame(gameCode, {
            type: 'game_state_updated',
            data: game.state
        });
    }
}

// Handle player disconnection
function handlePlayerDisconnect(ws, clientData) {
    const { gameCode } = clientData;
    
    if (gameCode && games.has(gameCode)) {
        const game = games.get(gameCode);
        game.players.delete(clientData.id);
        
        if (game.players.size === 0) {
            games.delete(gameCode);
        } else {
            // If host disconnected, assign new host
            if (game.host === clientData.id) {
                game.host = Array.from(game.players)[0];
            }
            
            // Notify remaining players
            broadcastToGame(gameCode, {
                type: 'player_disconnected',
                data: {
                    playerId: clientData.id,
                    newHost: game.host,
                    playerCount: game.players.size
                }
            });
        }
    }
}

// Utility function to broadcast to all players in a game
function broadcastToGame(gameCode, message, excludeWs = null) {
    const game = games.get(gameCode);
    if (!game) return;

    clients.forEach((clientData, ws) => {
        if (ws !== excludeWs && 
            clientData.gameCode === gameCode && 
            ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    });
}

// Utility function to generate a unique client ID
function generateClientId() {
    return Math.random().toString(36).substr(2, 9);
}

// Utility function to generate a game code
function generateGameCode() {
    return crypto.randomBytes(2).toString('hex').toUpperCase();
}

wss.on('listening', () => {
    console.log('WebSocket server is listening');
});

wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
});

server.on('error', (error) => {
    console.error('HTTP server error:', error);
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Test endpoint available at http://localhost:${PORT}/test`);
    console.log(`WebSocket server available at ws://localhost:${PORT}`);
});
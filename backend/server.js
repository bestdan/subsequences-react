const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3001;

console.log("Initializing server...");

const path = require("path");

app.use(cors());
app.use(express.json());

// Add these lines to serve static files
app.use(express.static(path.join(__dirname, "../frontend/build")));
// Add this route to handle all other requests
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.get("/test", (req, res) => {
    console.log("Test endpoint hit");
    res.json({ status: "Server is running" });
});

// Store active games and their participants
const games = new Map();
// Keep track of all connected clients
const clients = new Map();

// REST endpoint for creating a new game
app.post("/api/games", (req, res) => {
    try {
        const { playerId } = req.body;
        if (!playerId) {
            return res.status(400).json({ error: "Player ID is required" });
        }

        const gameCode = generateGameCode();
        const game = {
            host: playerId,
            players: new Set([playerId]),
            state: {
                status: "waiting",
                currentRound: 0,
                currentTurn: null,
            },
        };
        games.set(gameCode, game);

        console.log(`Game created: ${gameCode} by player: ${playerId}`);
        res.json({
            gameCode,
            players: Array.from(game.players),
        });
    } catch (error) {
        console.error("Error creating game:", error);
        res.status(500).json({ error: "Failed to create game" });
    }
});

// REST endpoint for checking if a game exists
app.get("/api/games/:code", (req, res) => {
    try {
        const { code } = req.params;
        if (!games.has(code)) {
            return res.status(404).json({ error: `Game ${code} not found` });
        }

        const game = games.get(code);

        // Broadcast to all clients that a new player is checking the game
        wss.clients.forEach((client) => {
            if (
                client.readyState === WebSocket.OPEN &&
                client.gameCode === code
            ) {
                client.send(
                    JSON.stringify({
                        type: "players_update",
                        data: {
                            players: Array.from(game.players),
                        },
                    }),
                );
            }
        });

        res.json({
            exists: true,
            players: Array.from(game.players),
            status: game.state.status,
        });
    } catch (error) {
        console.error("Error checking game:", error);
        res.status(500).json({ error: "Failed to check game" });
    }
});

// WebSocket connection handling
wss.on("connection", (ws) => {
    const clientId = generateClientId();
    clients.set(ws, { id: clientId });

    // Send the client their ID
    ws.send(
        JSON.stringify({
            type: "connection",
            data: { id: clientId },
        }),
    );

    ws.on("message", (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            handleMessage(ws, parsedMessage);
        } catch (error) {
            console.error("Failed to parse message:", error);
        }
    });

    ws.on("close", () => {
        handlePlayerDisconnect(ws);
        clients.delete(ws);
    });
});

// Handle different message types
function handleMessage(ws, message) {
    const { type, data } = message;

    switch (type) {
        case "create_game":
            handleCreateGame(ws, data);
            break;
        case "join_game":
            handleJoinGame(ws, data);
            break;
        case "start_game":
            handleStartGame(ws, data);
            break;
        case "submit_text":
            handleSubmitText(ws, data);
            break;
        case "signal":
            handleSignaling(ws, data);
            break;
        case "game_state_update":
            handleGameStateUpdate(ws, data);
            break;
        default:
            console.log("Unknown message type:", type);
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

        ws.send(
            JSON.stringify({
                type: "game_created",
                data: {
                    gameCode,
                    playerId: clientData.id,
                    isHost: true,
                },
            }),
        );
    }
}

// Handle player joining
function handleJoinGame(ws, data) {
    const { gameCode, playerId } = data;

    if (!games.has(gameCode)) {
        ws.send(
            JSON.stringify({
                type: "error",
                data: { message: "Game not found" },
            }),
        );
        return;
    }

    const game = games.get(gameCode);
    game.players.add(playerId);

    // Store game code and player ID in the WebSocket connection
    ws.gameCode = gameCode;
    ws.playerId = playerId;

    // Notify the new player
    ws.send(
        JSON.stringify({
            type: "game_joined",
            data: {
                gameCode,
                playerId,
                isHost: game.host === playerId,
                players: Array.from(game.players),
            },
        }),
    );

    console.log(`Player ${playerId} joined game ${gameCode}`);
    console.log("Current players:", Array.from(game.players));

    // Broadcast to all clients in the game that a new player has joined
    wss.clients.forEach((client) => {
        if (
            client.readyState === WebSocket.OPEN &&
            client.gameCode === gameCode
        ) {
            client.send(
                JSON.stringify({
                    type: "players_update",
                    data: {
                        players: Array.from(game.players),
                    },
                }),
            );
        }
    });
}

// Handle game start
function handleStartGame(ws, data) {
    const { gameCode } = data;
    const game = games.get(gameCode);

    if (!game) {
        ws.send(
            JSON.stringify({
                type: "error",
                data: { message: "Game not found" },
            }),
        );
        return;
    }

    // Convert players Set to Array and randomly select first player
    const playersArray = Array.from(game.players);
    const firstPlayer =
        playersArray[Math.floor(Math.random() * playersArray.length)];

    // Calculate total rounds
    const rounds_per_player = 1; //TODO(change to 3)
    const totalRounds = playersArray.length * rounds_per_player;

    // Update game state
    game.state = {
        status: "playing",
        currentPlayer: firstPlayer,
        phase: "input",
        round: 1,
        totalRounds: totalRounds,
        story: [],
    };

    // Broadcast game start to all players
    wss.clients.forEach((client) => {
        if (
            client.readyState === WebSocket.OPEN &&
            client.gameCode === gameCode
        ) {
            client.send(
                JSON.stringify({
                    type: "game_started",
                    data: {
                        currentPlayer: firstPlayer,
                        players: playersArray,
                        gameCode: gameCode,
                        totalRounds: totalRounds,
                    },
                }),
            );
        }
    });

    console.log(
        `Game ${gameCode} started. First player: ${firstPlayer}, Total Rounds: ${totalRounds}`,
    );
}

// Handle text submission
function handleSubmitText(ws, data) {
    const { gameCode, text } = data;
    const game = games.get(gameCode);

    if (!game) {
        console.error(`Game not found for code: ${gameCode}`);
        return;
    }

    // Initialize game story if not exists
    if (!game.state.story) {
        game.state.story = [];
    }

    // Add current player's text to the story
    game.state.story.push({
        playerId: game.state.currentPlayer,
        text: text,
    });

    // Determine next player
    const playersArray = Array.from(game.players);
    const currentPlayerIndex = playersArray.indexOf(game.state.currentPlayer);
    const nextPlayerIndex = (currentPlayerIndex + 1) % playersArray.length;
    const nextPlayer = playersArray[nextPlayerIndex];

    // Increment round
    game.state.round += 1;

    // Check if game is over
    const isGameOver = game.state.round > game.state.totalRounds;

    // Update game state
    game.state.currentPlayer = nextPlayer;

    // Broadcast to all players
    wss.clients.forEach((client) => {
        if (
            client.readyState === WebSocket.OPEN &&
            client.gameCode === gameCode
        ) {
            const message = {
                type: isGameOver ? "game_over" : "turn_update",
                data: {
                    gameCode: gameCode,
                    currentPlayer: isGameOver ? null : nextPlayer,
                    previousText: text,
                    previousPlayer: game.state.currentPlayer,
                    story: game.state.story,
                    round: game.state.round,
                    totalRounds: game.state.totalRounds,
                    isGameOver: isGameOver,
                },
            };

            console.log(
                `Sending ${isGameOver ? "game over" : "turn update"} to ${client.playerId}:`,
                message,
            );

            client.send(JSON.stringify(message));
        }
    });

    console.log(
        `${isGameOver ? "Game Over" : "Turn update"} in game ${gameCode}. Next player: ${isGameOver ? "N/A" : nextPlayer}`,
    );
}

// Handle signaling between peers
function handleSignaling(ws, data) {
    const { target, signal } = data;
    const senderData = clients.get(ws);

    // Find the target client's WebSocket
    const targetWs = [...clients.entries()].find(
        ([_, data]) => data.id === target,
    )?.[0];

    if (targetWs) {
        targetWs.send(
            JSON.stringify({
                type: "signal",
                data: {
                    signal,
                    from: senderData.id,
                },
            }),
        );
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
            type: "game_state_updated",
            data: game.state,
        });
    }
}

// Handle player disconnection
function handlePlayerDisconnect(ws) {
    const gameCode = ws.gameCode;
    const playerId = ws.playerId;

    if (gameCode && games.has(gameCode)) {
        const game = games.get(gameCode);
        game.players.delete(playerId);

        console.log(`Player ${playerId} disconnected from game ${gameCode}`);
        console.log("Remaining players:", Array.from(game.players));

        // Broadcast to remaining players
        wss.clients.forEach((client) => {
            if (
                client.readyState === WebSocket.OPEN &&
                client.gameCode === gameCode
            ) {
                client.send(
                    JSON.stringify({
                        type: "players_update",
                        data: {
                            players: Array.from(game.players),
                        },
                    }),
                );
            }
        });

        // If no players left, remove the game
        if (game.players.size === 0) {
            console.log(`Removing empty game ${gameCode}`);
            games.delete(gameCode);
        }
    }
}

// Utility function to broadcast to all players in a game
function broadcastToGame(gameCode, message, excludeWs = null) {
    const game = games.get(gameCode);
    if (!game) return;

    clients.forEach((clientData, ws) => {
        if (
            ws !== excludeWs &&
            clientData.gameCode === gameCode &&
            ws.readyState === WebSocket.OPEN
        ) {
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
    return crypto.randomBytes(2).toString("hex").toUpperCase();
}

wss.on("listening", () => {
    console.log("WebSocket server is listening");
});

wss.on("error", (error) => {
    console.error("WebSocket server error:", error);
});

server.on("error", (error) => {
    console.error("HTTP server error:", error);
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Test endpoint available at http://localhost:${PORT}/test`);
    console.log(`WebSocket server available at ws://localhost:${PORT}`);
});

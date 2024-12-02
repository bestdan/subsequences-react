import React, { useState, useEffect, useRef } from 'react';
import {GameStoryFinal} from './game_final.tsx';

const Game = () => {
    const [gameState, setGameState] = useState('initial'); // initial, creating, joining, waiting, playing
    const [gameCode, setGameCode] = useState('');
    const [playerId, setPlayerId] = useState('');
    const [players, setPlayers] = useState(new Set());
    const [error, setError] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [inputText, setInputText] = useState('');
    const [gamePhase, setGamePhase] = useState('waiting'); // waiting, playing
    const [story, setStory] = useState([]);
    const [previousText, setPreviousText] = useState('');
    const [round, setRound] = useState(1);
    const [totalRounds, setTotalRounds] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const wsRef = useRef(null);

    // Generate a random player ID on component mount
    useEffect(() => {
        const id = Math.random().toString(36).substr(2, 9);
        setPlayerId(id);
        console.log('Generated player ID:', id);
    }, []);

    // WebSocket connection setup
    useEffect(() => {
        if (gameState === 'waiting' || gameState === 'playing') {
            const ws = new WebSocket('ws://localhost:3001');
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket connected');
                if (gameCode && playerId) {
                    console.log('Sending join_game message:', { gameCode, playerId });
                    ws.send(JSON.stringify({
                        type: 'join_game',
                        data: { gameCode, playerId }
                    }));
                }
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('Received WebSocket message:', message);

                    switch (message.type) {
                        case 'game_joined':
                            console.log('Game joined:', message.data);
                            setPlayers(new Set(message.data.players));
                            break;
                        case 'players_update':
                            console.log('Players updated:', message.data.players);
                            setPlayers(new Set(message.data.players));
                            break;
                        case 'game_started':
                            console.log('Game started:', message.data);
                            // Only update if the game code matches
                            if (message.data.gameCode === gameCode) {
                                setGameState('playing');
                                setGamePhase('playing');
                                setCurrentPlayer(message.data.currentPlayer);
                                setPlayers(new Set(message.data.players));
                                setTotalRounds(message.data.totalRounds);
                            }
                            break;
                        case 'turn_update':
                            console.log('Turn update received:', message.data);
                            if (message.data.gameCode === gameCode) {
                                console.log('Updating game state:', {
                                    currentPlayer: message.data.currentPlayer,
                                    previousText: message.data.previousText,
                                    story: message.data.story,
                                    round: message.data.round
                                });

                                setCurrentPlayer(message.data.currentPlayer);
                                setPreviousText(message.data.previousText);
                                setStory(message.data.story);
                                setRound(message.data.round);
                                
                                // Clear input text
                                setInputText('');
                            }
                            break;
                        case 'game_over':
                            console.log('Game over received:', message.data);
                            if (message.data.gameCode === gameCode) {
                                setIsGameOver(true);
                                setStory(message.data.story);
                                setRound(message.data.round);
                            }
                            break;
                        case 'text_submitted':
                            console.log('Text submitted:', message.data);
                            setInputText('');
                            break;
                        case 'error':
                            console.error('Received error:', message.data.message);
                            setError(message.data.message);
                            break;
                        default:
                            console.log('Unknown message type:', message.type);
                    }
                } catch (error) {
                    console.error('Error handling WebSocket message:', error);
                }
            };

            ws.onclose = () => {
                console.log('WebSocket disconnected');
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setError('Connection error. Please try again.');
            };

            return () => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
            };
        }
    }, [gameState, gameCode, playerId]);

    const createGame = async () => {
        try {
            console.log('Creating new game...');
            setGameState('creating');
            setError('');

            const response = await fetch('http://localhost:3001/api/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ playerId }),
            });

            if (!response.ok) {
                throw new Error('Failed to create game');
            }

            const data = await response.json();
            console.log('Game created:', data);
            setGameCode(data.gameCode);
            setIsHost(true);
            setGameState('waiting');
            setPlayers(new Set([playerId]));
        } catch (error) {
            console.error('Error creating game:', error);
            setError('Failed to create game. Please try again.');
            setGameState('initial');
        }
    };

    const joinGame = async (event) => {
        event.preventDefault();
        try {
            console.log('Joining game:', gameCode);
            setGameState('joining');
            setError('');

            const response = await fetch(`http://localhost:3001/api/games/${gameCode}`);
            if (!response.ok) {
                throw new Error('Game not found');
            }

            const data = await response.json();
            console.log('Joined game:', data);
            setGameState('waiting');
            setPlayers(new Set([...data.players, playerId]));
        } catch (error) {
            console.error('Error joining game:', error);
            setError('Failed to join game. Please check the game code and try again.');
            setGameState('initial');
        }
    };

    const handleGameCodeInput = (event) => {
        const value = event.target.value.toUpperCase();
        if (value.length <= 4) {
            setGameCode(value);
        }
    };

    const handleStartGame = () => {
        console.log('Start game clicked', {
            gameCode,
            isHost,
            players: Array.from(players)
        });

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'start_game',
                data: { gameCode }
            }));
        } else {
            console.error('WebSocket is not open');
        }
    };

    const handleSubmitText = () => {
        console.log('Submitting text:', {
            gameCode,
            playerId,
            currentPlayer,
            inputText
        });

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'submit_text',
                data: { 
                    gameCode,
                    text: inputText 
                }
            }));
            
            // Clear input text immediately
            setInputText('');
        }
    };

    const renderGameState = () => {
        if (isGameOver) {
            <GameStoryFinal storyEntry={story} playerId={playerId}/>
        }

        switch (gameState) {
            case 'initial':
                return (
                    <div className="game-menu">
                        <h2>Subsequences Game</h2>
                        <div className="menu-options">
                            <button onClick={createGame}>Create New Game</button>
                            <div>- or -</div>
                            <form onSubmit={joinGame} className="join-game">
                                <input
                                    type="text"
                                    value={gameCode}
                                    onChange={handleGameCodeInput}
                                    placeholder="GAME CODE"
                                    maxLength="4"
                                    required
                                />
                                <button type="submit">Join Game</button>
                            </form>
                        </div>
                    </div>
                );

            case 'creating':
            case 'joining':
                return (
                    <div className="game-menu">
                        <h2>{gameState === 'creating' ? 'Creating Game...' : 'Joining Game...'}</h2>
                    </div>
                );

            case 'waiting':
                return (
                    <div className="game-lobby">
                        <h2>Game Lobby</h2>
                        <div className="game-code">
                            Game Code: <span>{gameCode}</span>
                        </div>
                        <div className="players-list">
                            <h3>Players:</h3>
                            <ul>
                                {Array.from(players).map(id => (
                                    <li key={id}>
                                        {id === playerId ? `${id} (You)` : id}
                                        {isHost && id === playerId && ' (Host)'}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {isHost && players.size >= 2 && (
                            <button onClick={handleStartGame}>Start Game</button>
                        )}
                    </div>
                );

            case 'playing':
                return (
                    <div className="game-lobby">
                        <h2>Game in Progress</h2>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            {Array.from(players).map(player => (
                                <div 
                                    key={player} 
                                    style={{ 
                                        padding: '10px', 
                                        border: player === currentPlayer ? '2px solid green' : '1px solid gray',
                                        backgroundColor: player === currentPlayer ? '#e6ffe6' : 'transparent'
                                    }}
                                >
                                    {player === playerId ? 'You' : player}
                                    {player === currentPlayer && ' (Playing)'}
                                </div>
                            ))}
                        </div>

                        <p>Round {round} of {totalRounds}</p>

                        {currentPlayer === playerId ? (
                            <div>
                                <h3>Your Turn! (Round {round})</h3>
                                {previousText && (
                                    <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#e6f2ff' }}>
                                        <p>Previous text by {story[story.length - 1].player === playerId ? 'you' : story[story.length - 1].player}:</p>
                                        <p>{previousText}</p>
                                    </div>
                                )}
                                <p>Continue the story (up to 255 characters):</p>
                                <textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value.slice(0, 255))}
                                    maxLength={255}
                                    rows={4}
                                    style={{ width: '100%', maxWidth: '500px' }}
                                    placeholder="Write the next part of the story..."
                                />
                                <p>{255 - inputText.length} characters remaining</p>
                                <button 
                                    onClick={handleSubmitText}
                                    disabled={inputText.length === 0}
                                >
                                    Submit
                                </button>
                            </div>
                        ) : (
                            <div>
                                <h3>Waiting for {currentPlayer === playerId ? 'you' : currentPlayer} to play... (Round {round})</h3>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="game-container">
            {error && <div className="error-message">{error}</div>}
            {renderGameState()}
        </div>
    );
};

export default Game;

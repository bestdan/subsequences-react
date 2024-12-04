import React, { useState, useEffect, useRef } from 'react';
import { GameStoryFinal } from './game_final.tsx';
import { StoryEntry } from './game_story.tsx';
import { GameLobby } from './game_lobby.tsx';
import { LandingMenu } from './landing_menu.tsx';
import { PlayingScreen } from './playing_screen.tsx';

type GameState = "initial" | "creating" | "joining" | "waiting" | "playing"
type GamePhase = "waiting" | "playing"

const wsAddress = 'ws://localhost:3001';
const httpBaseAddress = 'http://localhost:3001';
const Game = () => {
    console.log('Game component mounted');

    const [gameState, setGameState] = useState<GameState>('initial'); // initial, creating, joining, waiting, playing
    const [gameCode, setGameCode] = useState('');
    const [playerId] = useState(Math.random().toString(36).slice(2, 9));
    const [players, setPlayers] = useState<Set<string>>(new Set());
    const [error, setError] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState<string>('');
    const [inputText, setInputText] = useState('');
    const [gamePhase, setGamePhase] = useState<GamePhase>('waiting'); // waiting, playing
    const [story, setStory] = useState<StoryEntry[]>([]);
    const [previousText, setPreviousText] = useState('');
    const [round, setRound] = useState(1);
    const [totalRounds, setTotalRounds] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const wsRef = useRef<WebSocket>();

    // WebSocket connection setup
    useEffect(() => {
        if (gameState === 'waiting' || gameState === 'playing') {
            const ws = new WebSocket(wsAddress);
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

            ws.onmessage = (event: MessageEvent) => {
                const message = JSON.parse(event.data);
                console.log('Received message:', message);

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
                    case 'playerJoined':
                        // Update players list when a new player joins
                        setPlayers(prevPlayers => new Set([...prevPlayers, message.playerId]));
                        break;
                    case 'playerLeft':
                        // Remove player when they leave
                        setPlayers(prevPlayers => {
                            const newPlayers = new Set(prevPlayers);
                            newPlayers.delete(message.playerId);
                            return newPlayers;
                        });
                        break;
                    default:
                        console.log('Unknown message type:', message.type);
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
    }, [gameState, gamePhase, gameCode, playerId]);

    const createGame = async () => {
        try {
            console.log('Creating new game...');
            setGameState('creating');
            setError('');

            const response = await fetch(`${httpBaseAddress}/api/games`, {
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

    const joinGame = async (code: string) => {
        try {
            setGameCode(code)
            console.log('Joining game:', code);
            setGameState('joining');
            setError('');

            const response = await fetch(`${httpBaseAddress}/api/games/${code}`);
            if (!response.ok) {
                throw new Error('Game not found');
            }

            const data = await response.json();
            console.log('Joined game:', data);
            setPlayers(new Set([...data.players, playerId]));
            setGameState('waiting');
            // Notify WebSocket server about the new player
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'playerJoined',
                    gameCode: code,
                    playerId: playerId
                }));
            }

        } catch (error) {
            console.error('Error joining game:', error);
            setError('Failed to join game. Please check the game code and try again.');
            setGameState('initial');
        }
    };

    const handleStartGame = (gameCode: String) => {
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
            return <GameStoryFinal storyEntries={story} playerId={playerId} />
        }

        switch (gameState) {
            case 'initial':
                return <LandingMenu joinGame={joinGame} createGame={createGame} />
            case 'creating':
            case 'joining':
                return (
                    <div className="game-menu">
                        <h2>{gameState === 'creating' ? 'Creating Game...' : 'Joining Game...'}</h2>
                    </div>
                );

            case 'waiting':
                return <GameLobby handleStartGame={handleStartGame} gameCode={gameCode} players={players} playerId={playerId} isHost={isHost} />

            case 'playing':
                return <PlayingScreen
                    players={players}
                    playerId={playerId}
                    currentPlayer={currentPlayer}
                    previousText={previousText}
                    story={story}
                    round={round}
                    totalRounds={totalRounds}
                    inputText={inputText}
                    setInputText={setInputText}
                    handleSubmitText={handleSubmitText}
                />
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
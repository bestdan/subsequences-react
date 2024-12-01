import React, { useState, useEffect, useCallback } from 'react';
import WebRTCConnection from './WebRTCConnection';

const Game = () => {
    const [gameState, setGameState] = useState('initial'); // initial, creating, joining, waiting, playing
    const [gameCode, setGameCode] = useState('');
    const [playerId, setPlayerId] = useState('');
    const [players, setPlayers] = useState(new Set());
    const [error, setError] = useState('');
    const [isHost, setIsHost] = useState(false);

    // Generate a random player ID on component mount
    useEffect(() => {
        const id = Math.random().toString(36).substr(2, 9);
        setPlayerId(id);
        console.log('Generated player ID:', id);
    }, []);

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

    const renderGameState = () => {
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
            case 'playing':
                return (
                    <div className="game-lobby">
                        <h2>{gameState === 'waiting' ? 'Game Lobby' : 'Playing'}</h2>
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
                        <WebRTCConnection
                            gameCode={gameCode}
                            playerId={playerId}
                            players={players}
                            isHost={isHost}
                        />
                        {isHost && players.size > 1 && gameState === 'waiting' && (
                            <button onClick={() => setGameState('playing')}>Start Game</button>
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

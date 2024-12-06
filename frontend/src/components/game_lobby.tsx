import React, { useContext } from 'react';
import { playerId } from './game_configs.tsx';

export function GameLobby(props: {
    gameCode: string,
    players: Set<string>,
    isHost: boolean,
    handleStartGame: (gameCode: string) => void
}) {
    const { handleStartGame, gameCode, players, isHost
    } = props;
    console.log('GameLobby props:', props);
    let pid = useContext(playerId)

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
                        <li>
                            {id === pid ? `${id} (You)` : id}
                            {isHost && id === pid && ' (Host)'}
                        </li>
                    ))}
                </ul>
            </div>
            {isHost && players.size >= 2 && (
                <button onClick={(event) => handleStartGame(gameCode)}>Start Game</button>
            )}
        </div>
    );
}
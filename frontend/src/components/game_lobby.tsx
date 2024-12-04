import React from 'react';

export function GameLobby(props: {
    gameCode: String,
    players: Set<string>,
    playerId: String,
    isHost: boolean,
    handleStartGame: (gameCode: String) => void
}) {
    const { handleStartGame, gameCode, players, playerId, isHost } = props;
    console.log('GameLobby props:', props);

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
                <button onClick={(event) => handleStartGame(gameCode)}>Start Game</button>
            )}
        </div>
    );
}
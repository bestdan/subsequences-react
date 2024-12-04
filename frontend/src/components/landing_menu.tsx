import React from 'react';

export function LandingMenu(props: {
    joinGame: (gameCode: string) => Promise<void>,
    createGame: () => Promise<void>
}) {
    const { joinGame, createGame } = props;
    return (
        <div className="game-menu">
            <h2>Subsequences Game</h2>
            <div className="menu-options">
                <StartNewGameButton onClick={() => createGame()} />
                <div>- or -</div>
                <JoinGameInput onClick={joinGame} />
            </div>
        </div>
    );
}

function StartNewGameButton({ onClick }: { onClick: () => void }) {
    return (<button onClick={onClick}>Create New Game</button>);
}

function JoinGameInput({ onClick }: { onClick: (gameCode: string) => Promise<void> }) {
    const [localGameCode, setLocalGameCode] = React.useState('');

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onClick(localGameCode);
    };

    return (
        <form onSubmit={handleSubmit} className="join-game">
            <input
                type="text"
                value={localGameCode}
                onChange={(e) => setLocalGameCode(e.target.value)}
                placeholder="GAME CODE"
                maxLength={4}
                required
            />
            <button type="submit">Join Game</button>
        </form>
    );
}

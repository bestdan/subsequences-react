import React from 'react';
import { JoinGameProps } from '../methods/join_game';

export function LandingMenu(props: {
    joinGame: (props: JoinGameProps) => Promise<void>,
    createGame: () => Promise<void>
}) {

    return (
        <div className="game-menu">
            <h2>Subsequences Game</h2>
            <div className="menu-options">
                <StartNewGameButton onClick={props.createGame} />
                <div>- or -</div>
                <JoinGameInput onClick={props.joinGame} />
            </div>
        </div>
    );
}

function StartNewGameButton({ onClick }: { onClick: () => Promise<void> }) {
    return (<button onClick={onClick}>Create New Game</button>);
}

function JoinGameInput({ onClick }: { onClick: (prop: JoinGameProps) => Promise<void> }) {
    const [localGameCode, setLocalGameCode] = React.useState<string>('');

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

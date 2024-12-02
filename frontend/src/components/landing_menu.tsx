

export function LandingMenu(joinGame: Promise<void>, createGame: Promise<void>) {
    return (
        <div className="game-menu">
            <h2>Subsequences Game</h2>
            <div className="menu-options">
                <StartNewGameButton onClick={createGame} />
                <div>- or -</div>
                <JoinGameInput onClick={createGame} />

            </div>
        </div>
    )
};

function StartNewGameButton(onClick: Promise<void>) {
    return (<button onClick={onClick}>Create New Game</button>);
}

function JoinGameInput() {
    return (
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
    );
}
import React, { useContext } from 'react';
import { JoinGameInput } from './join_game_input.tsx';
import { StartNewGameButton } from './start_game_button.tsx'

export function LandingMenu() {
    return (
        <div className="game-menu">
            <h2>Subsequences Game</h2>
            <div className="menu-options">
                <StartNewGameButton />
                <div>- or -</div>
                <JoinGameInput />
            </div>
        </div>
    );
}

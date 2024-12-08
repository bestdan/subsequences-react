import React from 'react';
import { JoinGameInput } from './join_game_input.tsx';
import { StartNewGameButton } from './start_game_button.tsx'

export function LandingMenu() {
    return (
        <div className="game-menu">
            <h2>Subsequences</h2>
            <p>Subequences is a silly writing game where you write a story together... but you only know part of the story. Best with 3 or more people.</p>
            <div><br /></div>
            <div className="menu-options">
                <StartNewGameButton />
                <div>- or -</div>
                <JoinGameInput />
            </div>
        </div>
    );
}

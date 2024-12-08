import React, { useContext, useState } from 'react';
import { PlayerIdContext } from './game_configs.tsx'

import { RenderGameState } from './render_game_state.tsx';
import { GameCodeProvider } from '../models/game_code_state.tsx';
import { PlayersProvider } from '../models/players_state.tsx';
import { ErrorProvider } from '../models/error_state.tsx';
import { WebSocketProvider } from '../models/websocket_state.tsx';
import { CurrentPlayerProvider } from '../models/current_player_state.tsx';
import { GameStateProvider } from '../models/game_state.tsx';
import { PreviousTextProvider } from '../models/previous_text_state.tsx';
import { StoryProvider } from '../models/story_state.tsx';
import { CurrentRoundProvider } from '../models/round_state.tsx';

const MultiProvider = ({ providers, children }: { providers: JSX.Element[], children: React.ReactNode }) => {
    return providers.reduceRight(
        (children, provider) => React.cloneElement(provider, {}, children),
        children
    );
};

const Game: React.FC = () => {
    console.log('Game component mounted');


    return (
        <MultiProvider providers={[
            <GameStateProvider key="gameState" />,
            <GameCodeProvider key="gameCode" />,
            <PlayersProvider key="players" />,
            <ErrorProvider key="error" />,
            <WebSocketProvider key="websocket" />,
            <StoryProvider key="story" />,
            <CurrentPlayerProvider key="currentPlayer" />,
            <PreviousTextProvider key="previousText" />,
            <CurrentRoundProvider key="currentRound" />,
        ]}>
            <div className="game-container">
                <RenderGameState />
            </div>
        </MultiProvider>
    );
};

export default Game;

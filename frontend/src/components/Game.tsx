import { RenderGameState } from './render_game_state.tsx';
import { GameCodeProvider } from '../models/game_code_state.tsx';
import { PlayersProvider } from '../models/players_state.tsx';
import { ErrorProvider } from '../models/error_state.tsx';
import { WebSocketProvider } from '../models/websocket_state.tsx';
import { CurrentPlayerProvider } from '../models/current_player_state.tsx';
import { GameStateProvider } from '../models/game_state.tsx';
import { StoryProvider } from '../models/story_state.tsx';
import { CurrentRoundProvider } from '../models/round_state.tsx';
import React from 'react';

const MultiProvider = ({ providers, children }: { providers: JSX.Element[], children: React.ReactNode }) => {
    const result = providers.reduceRight(
        (accChildren, provider) => React.cloneElement(provider, {}, accChildren),
        children
    );

    return result;
};

export function Game() {
    return (
        <MultiProvider providers={[
            <GameStateProvider key="gameState">{null}</GameStateProvider>,
            <GameCodeProvider key="gameCode">{null}</GameCodeProvider>,
            <PlayersProvider key="players">{null}</PlayersProvider>,
            <ErrorProvider key="error" >{null}</ErrorProvider>,
            <WebSocketProvider>{null}</WebSocketProvider>,
            <StoryProvider key="story" >{null}</StoryProvider>,
            <CurrentPlayerProvider key="currentPlayer" >{null}</CurrentPlayerProvider>,
            <CurrentRoundProvider key="currentRound" >{null}</CurrentRoundProvider>
        ]}>
            <div className="game-container">
                <RenderGameState />
            </div>
        </MultiProvider>
    );
};

export default Game;

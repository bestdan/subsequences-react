import React, { Provider, useReducer, useContext, useState, useEffect, useRef } from 'react';
import { wsAddress, httpBaseAddress, PlayerIdContext } from './game_configs.tsx'
import { GameStateContext, GameStateDispatchContext, gameStateReducer } from '../models/game_state.tsx'
import { ErrorContext, ErrorDispatchContext, errorStateReducer } from '../models/error_state.tsx';
import { GameCodeContext, GameCodeDispatchContext, gameCodeStateReducer } from '../models/game_code_state.tsx';
import { PlayersContext, PlayersDispatchContext, playersStateReducer } from '../models/players_state.tsx';
import { WebSocketContext, WebsocketDispatchContext, websocketStateReducer } from '../models/websocket_state.tsx';
import { renderGameState } from './render_game_state.tsx';
import { StoryContext, StoryDispatchContext, storyStateReducer } from '../models/story_state.tsx';
import { CurrentPlayerContext, CurrentPlayerDispatchContext, currentPlayerStateReducer } from '../models/current_player_state.tsx';
import { RoundStateContext, RoundStateDispatchContext } from '../models/round_state.tsx';
import { PreviousTextStateContext, PreviousTextStateDispatchContext, previousTextStateReducer } from '../models/previous_text_state.tsx';

type GamePhase = "waiting" | "playing"


const MultiProvider = ({ providers, children }: { providers: JSX.Element[], children: React.ReactNode }) => {
    return providers.reduceRight(
        (children, provider) => React.cloneElement(provider, {}, children),
        children
    );
};

const Game = () => {
    console.log('Game component mounted');
    let playerId = useContext(PlayerIdContext);

    const [gameState, setGameState] = useReducer(gameStateReducer, 'initial');
    const [error, setError] = useReducer(errorStateReducer, null);
    const [gameCode, setGameCode] = useReducer(gameCodeStateReducer, null);
    const [players, setPlayers] = useReducer(playersStateReducer, new Set(playerId));
    const [websocket, setWebsocket] = useReducer(websocketStateReducer, null);
    const [story, setStory] = useReducer(storyStateReducer, []);
    const [previousText, setPreviousText] = useReducer(previousTextStateReducer, '');

    const [currentPlayer, setCurrentPlayer] = useReducer(currentPlayerStateReducer, 'none');
    const [gamePhase, setGamePhase] = useState<GamePhase>('waiting'); // waiting, playing

    //const [previousText, setPreviousText] = useState<string>('');
    const [round, setRound] = useState(1);
    const [totalRounds, setTotalRounds] = useState(0);


    // WebSocket connection setup
    useEffect(() => {
        if (gameState === 'waiting' || gameState === 'playing') {
            const ws = new WebSocket(useContext(wsAddress));
            setWebsocket(ws);

            ws.onopen = () => {
                console.log('WebSocket connected');
                if (gameCode && playerId) {
                    console.log('Sending join_game message:', { gameCode, playerId });
                    ws.send(JSON.stringify({
                        type: 'join_game',
                        data: { gameCode, playerId }
                    }));
                }
            };

            ws.onmessage = (event: MessageEvent) => {
                const message = JSON.parse(event.data);
                console.log('Received message:', message);

                switch (message.type) {
                    case 'game_joined':
                        console.log('Game joined:', message.data);
                        setPlayers(new Set(message.data.players));
                        break;
                    case 'players_update':
                        console.log('Players updated:', message.data.players);
                        setPlayers(new Set(message.data.players));
                        break;
                    case 'game_started':
                        console.log('Game started:', message.data);
                        // Only update if the game code matches
                        if (message.data.gameCode === gameCode) {
                            setGameState('playing');
                            setGamePhase('playing');
                            setCurrentPlayer(message.data.currentPlayer);
                            setPlayers(new Set(message.data.players));
                            setTotalRounds(message.data.totalRounds);
                        }
                        break;
                    case 'turn_update':
                        console.log('Turn update received:', message.data);
                        if (message.data.gameCode === gameCode) {
                            console.log('Updating game state:', {
                                currentPlayer: message.data.currentPlayer,
                                previousText: message.data.previousText,
                                story: message.data.story,
                                round: message.data.round
                            });

                            setCurrentPlayer(message.data.currentPlayer);
                            setPreviousText(message.data.previousText);
                            setStory(message.data.story);
                            setRound(message.data.round);

                            // Clear input text
                            //setInputText(''); //TODO(dan): NEED? 
                        }
                        break;
                    case 'game_over':
                        console.log('Game over received:', message.data);
                        if (message.data.gameCode === gameCode) {
                            setGameState('over');
                            setStory(message.data.story);
                            setRound(message.data.round);
                        }
                        break;
                    case 'text_submitted':
                        console.log('Text submitted:', message.data);
                        //setInputText(''); TODO(dan): need? 
                        break;
                    case 'error':
                        console.error('Received error:', message.data.message);
                        setError(message.data.message);
                        break;
                    case 'playerJoined':
                        // Update players list when a new player joins
                        let newPlayers = new Set([...players, message.playerId]);
                        setPlayers(newPlayers);
                        break;
                    case 'playerLeft':
                        // Remove player when they leave
                        let newPlayers2 = new Set(players);
                        newPlayers2.delete(message.playerId);
                        setPlayers(newPlayers2);
                        break;
                    default:
                        console.log('Unknown message type:', message.type);
                }
            };

            ws.onclose = () => {
                console.log('WebSocket disconnected');
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setError('Connection error. Please try again.');
            };

            return () => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
            };
        }
    }, [gameState, gamePhase, gameCode, playerId]);



    return (
        <MultiProvider providers={[
            <GameStateContext.Provider value={gameState}>
                <GameStateDispatchContext.Provider value={setGameState}>
                </GameStateDispatchContext.Provider>
            </GameStateContext.Provider>,

            <GameCodeContext.Provider value={gameCode}>
                <GameCodeDispatchContext.Provider value={setGameCode}>
                </GameCodeDispatchContext.Provider>
            </GameCodeContext.Provider>,

            <GameCodeContext.Provider value={gameCode}>
                <GameCodeDispatchContext.Provider value={setGameCode}>
                </GameCodeDispatchContext.Provider>
            </GameCodeContext.Provider>,

            <PlayersContext.Provider value={players}>
                <PlayersDispatchContext.Provider value={setPlayers}>
                </PlayersDispatchContext.Provider>
            </PlayersContext.Provider>,

            <ErrorContext.Provider value={error}>
                <ErrorDispatchContext.Provider value={setError}>
                </ErrorDispatchContext.Provider>
            </ErrorContext.Provider>,

            <WebSocketContext.Provider value={websocket}>
                <WebsocketDispatchContext.Provider value={setWebsocket}>
                </WebsocketDispatchContext.Provider>
            </WebSocketContext.Provider>,

            <StoryContext.Provider value={story}>
                <StoryDispatchContext.Provider value={setStory}>
                </StoryDispatchContext.Provider>
            </StoryContext.Provider>,

            <CurrentPlayerContext.Provider value={currentPlayer}>
                <CurrentPlayerDispatchContext.Provider value={setCurrentPlayer}>
                </CurrentPlayerDispatchContext.Provider>
            </CurrentPlayerContext.Provider>,

            <RoundStateContext.Provider value={round}>
                <RoundStateDispatchContext.Provider value={setRound}>
                </RoundStateDispatchContext.Provider>
            </RoundStateContext.Provider>,
            <PreviousTextStateContext.Provider value={previousText}>
                <PreviousTextStateDispatchContext.Provider value={setPreviousText}>
                </PreviousTextStateDispatchContext.Provider>
            </PreviousTextStateContext.Provider>
        ]}>

            <div className="game-container">
                {error && <div className="error-message">{error}</div>}
                {renderGameState()}
            </div>
        </MultiProvider >
    );
};

export default Game;

import { useContext, useEffect } from "react";
import { GameStoryFinal } from "./game_final.tsx";
import { LandingMenu } from "./landing_menu.tsx";
import { GameLobby } from "./game_lobby.tsx";

import { PlayingScreen } from "./playing_screen.tsx";
import { GameStateFE, useGameState, useSetGameState } from "../models/game_state.tsx";
import { PlayerIdContext, wsAddress } from "./game_configs.tsx";
import { useGameCode } from "../models/game_code_state.tsx";
import { useError, useSetError } from "../models/error_state.tsx";
import { usePlayers, useSetPlayers } from "../models/players_state.tsx";
import { useSetWebsocket } from "../models/websocket_state.tsx";
import { useSetCurrentPlayer } from "../models/current_player_state.tsx";
import { useSetPreviousText } from "../models/previous_text_state.tsx";
import { GamePhase, useCurrentPhase, useSetCurrentPhase } from "../models/current_phase_state.tsx";
import { useSetStory } from "../models/story_state.tsx";
import { useSetCurrentRound } from "../models/round_state.tsx";
import { useSetTotalRounds } from "../models/total_rounds_state.tsx";

export function RenderGameState() {

  const playerId = useContext(PlayerIdContext);
  const wsAddressValue = useContext(wsAddress);
  const gameState = useGameState();
  const gamePhase = useCurrentPhase();
  const gameCode = useGameCode()
  const error = useError();
  const players = usePlayers()
  const setError = useSetError();
  const setGameState = useSetGameState();
  const setPlayers = useSetPlayers();
  const setWebsocket = useSetWebsocket()
  const setStory = useSetStory();
  const setCurrentPlayer = useSetCurrentPlayer();
  const setPreviousText = useSetPreviousText();
  const setCurrentPhase = useSetCurrentPhase();
  const setTotalRounds = useSetTotalRounds();
  const setCurrentRound = useSetCurrentRound();


  // WebSocket connection setup
  useEffect(() => {
    if (gameState === 'waiting' || gameState === 'playing') {
      const ws = new WebSocket(wsAddressValue);
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
              setGameState(GameStateFE.PLAYING);
              setCurrentPhase(GamePhase.Playing);
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
              setCurrentRound(message.data.round);

              // Clear input text
              //setInputText(''); //TODO(dan): NEED? 
            }
            break;
          case 'game_over':
            console.log('Game over received:', message.data);
            if (message.data.gameCode === gameCode) {
              setGameState(GameStateFE.OVER);
              setStory(message.data.story);
              setCurrentRound(message.data.round);
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
  }, [gameState, gamePhase, gameCode, playerId, wsAddressValue]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  switch (gameState) {
    case 'over':
      return <GameStoryFinal />
    case 'initial':
      return <LandingMenu />
    case 'creating':
    case 'joining':
      return (
        <div className="game-menu">
          <h2>{gameState === 'creating' ? 'Creating Game...' : 'Joining Game...'}</h2>
        </div>
      );
    case 'waiting':
      return <GameLobby />
    case 'playing':
      return <PlayingScreen />
    default:
      return <p>Failure</p>;
  }
}

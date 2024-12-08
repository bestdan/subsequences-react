import { useContext } from "react"
import { GameCodeDispatchContext } from "../models/game_code_state.tsx"
import { GameStateDispatchContext } from "../models/game_state.tsx"
import { ErrorDispatchContext } from "../models/error_state.tsx"
import { PlayersDispatchContext } from "../models/players_state.tsx"
import { WebSocketContext } from "../models/websocket_state.tsx"
import { httpBaseAddress, PlayerIdContext } from "./game_configs.tsx"

export async function joinGame(gameCode: string) {
  const setGameCode = useContext(GameCodeDispatchContext)
  const setGameState = useContext(GameStateDispatchContext)
  const setError = useContext(ErrorDispatchContext)
  const setPlayers = useContext(PlayersDispatchContext)
  const playerId = useContext(PlayerIdContext)
  const ws = useContext(WebSocketContext)

  try {
    setGameCode(gameCode)
    console.log('Joining game:', gameCode);
    setGameState('joining');
    setError('');

    const response = await fetch(`${useContext(httpBaseAddress)}/api/games/${gameCode}`);
    if (!response.ok) {
      throw new Error('Game not found');
    }

    const data = await response.json();
    console.log('Joined game:', data);
    setPlayers(new Set([...data.players, playerId]));
    setGameState('waiting');
    // Notify WebSocket server about the new player
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'playerJoined',
        gameCode: gameCode,
        playerId: playerId
      }));
    }

  } catch (error) {
    console.error('Error joining game:', error);
    setError('Failed to join game. Please check the game code and try again.');
    setGameState('initial');
  }
  return;
};
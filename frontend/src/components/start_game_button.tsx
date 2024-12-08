import { useContext } from 'react';
import { GameStateDispatchContext } from '../models/game_state.tsx';
import { httpBaseAddress, PlayerIdContext } from './game_configs.tsx';
import { ErrorDispatchContext } from '../models/error_state.tsx';
import { PlayersDispatchContext } from '../models/players_state.tsx';
import { WebSocketContext } from '../models/websocket_state.tsx';


export function StartNewGameButton() {
  const gameStateDispatch = useContext(GameStateDispatchContext);
  const setError = useContext(ErrorDispatchContext);
  const setGameCode = useContext(GameStateDispatchContext);
  const setPlayers = useContext(PlayersDispatchContext);
  const playerId = useContext(PlayerIdContext);
  const ws = useContext(WebSocketContext);
  const baseAddress = useContext(httpBaseAddress);

  const createGame = async () => {
    try {
      console.log('Creating new game...');
      gameStateDispatch('creating');
      setError('');

      const response = await fetch(`${baseAddress}/api/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId: playerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create game');
      }

      const data = await response.json();
      console.log('Game created:', data);
      setGameCode(data.gameCode);
      gameStateDispatch('waiting');
      setPlayers(new Set([playerId]));

      // Notify WebSocket server about the new game
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'gameCreated',
          gameCode: data.gameCode,
          playerId: playerId
        }));
      }
    } catch (error) {
      console.error('Error creating game:', error);
      setError('Failed to create game. Please try again.');
      gameStateDispatch('initial');
    }
  };

  return (<button onClick={createGame}>Create New Game</button>);
}



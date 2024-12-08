import { useContext } from 'react';
import { httpBaseAddress, PlayerIdContext } from './game_configs.tsx';
import { useSetGameCode } from '../models/game_code_state.tsx';
import { GameStateFE, useGameState, useSetGameState } from '../models/game_state.tsx';
import { useSetError } from '../models/error_state.tsx';
import { useWebsocket } from '../models/websocket_state.tsx';



export function StartNewGameButton() {
  const playerId = useContext(PlayerIdContext);
  const baseAddress = useContext(httpBaseAddress);
  const gameState = useGameState();
  const ws = useWebsocket();
  const setGameState = useSetGameState();
  const setError = useSetError()
  const setGameCode = useSetGameCode();

  const createGame = async () => {
    try {
      console.log('Creating new game...');
      setGameState(GameStateFE.CREATING);

      setError('');
      console.log('Game state:', gameState);

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
      setGameState(GameStateFE.WAITING);

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
      setGameState(GameStateFE.INITIAL);
    }
  };

  return (<button onClick={createGame}>Create New Game</button>);
}



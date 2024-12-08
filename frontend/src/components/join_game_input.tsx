import React, { useContext } from 'react';
import { httpBaseAddress } from './game_configs.tsx';
import { PlayerIdContext } from './game_configs.tsx';
import { useSetGameCode } from '../models/game_code_state.tsx';
import { useSetGameState } from '../models/game_state.tsx';
import { useSetError } from '../models/error_state.tsx';
import { useSetPlayers } from '../models/players_state.tsx';
import { useWebsocket } from '../models/websocket_state.tsx';


export function JoinGameInput() {
  const setGameCode = useSetGameCode();
  const setGameState = useSetGameState();
  const setError = useSetError()
  const setPlayers = useSetPlayers()
  const playerId = useContext(PlayerIdContext)
  const ws = useWebsocket()

  const [localGameCode, setLocalGameCode] = React.useState<string>('');

  async function joinGame(gameCode: string) {
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    joinGame(localGameCode);
  }

  return (
    <form onSubmit={handleSubmit} className="join-game">
      <input
        type="text"
        value={localGameCode}
        onChange={(e) => setLocalGameCode(e.target.value)}
        placeholder="GAME CODE"
        maxLength={4}
        required
      />
      <button type="submit">Join Game</button>
    </form>
  );
}



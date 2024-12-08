import React, { useContext } from 'react';
import { httpBaseAddress } from './game_configs.tsx';
import { PlayerIdContext } from './game_configs.tsx';
import { useSetGameCode } from '../models/game_code_state.tsx';
import { GameStateFE, useSetGameState } from '../models/game_state.tsx';
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
  const httpAddressBase = useContext(httpBaseAddress)

  const [localGameCode, setLocalGameCode] = React.useState<string>('');

  async function joinGame() {
    try {
      setGameCode(localGameCode)
      console.log('Joining game:', localGameCode);
      setGameState(GameStateFE.JOINING);
      setError('');

      const response = await fetch(`${httpAddressBase}/api/games/${localGameCode}`);
      if (!response.ok) {
        throw new Error('Game not found');
      }

      const data = await response.json();
      console.log('Joined game:', data);
      setPlayers(new Set([...data.players, playerId]));
      setGameState(GameStateFE.WAITING);
      // Notify WebSocket server about the new player
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'playerJoined',
          gameCode: localGameCode,
          playerId: playerId
        }));
      }

    } catch (error) {
      console.error('Error joining game:', error);
      setError('Failed to join game. Please check the game code and try again.');
      setGameState(GameStateFE.INITIAL);
    }
    return;
  };

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    joinGame();
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



import React, { useContext } from 'react';
import { joinGame } from '../components/join_game.tsx';


export function JoinGameInput() {

  const [localGameCode, setLocalGameCode] = React.useState<string>('');

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



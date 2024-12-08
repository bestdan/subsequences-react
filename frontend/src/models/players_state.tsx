import { createContext } from 'react';

export function playersStateReducer(players: Set<string>, newPlayers: Set<string>) {
  return newPlayers;
}

export const PlayersContext = createContext<Set<string>>(new Set<string>())

export const PlayersDispatchContext = createContext<React.Dispatch<Set<string>>>(() => { })

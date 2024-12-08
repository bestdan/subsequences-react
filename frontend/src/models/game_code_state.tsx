import { createContext } from 'react';

export function gameCodeStateReducer(gameCode: string | null, newGameCode: string | null) {
  return newGameCode;
}

export const GameCodeContext = createContext<string | null>(null)

export const GameCodeDispatchContext = createContext<React.Dispatch<string | null>>(() => { })

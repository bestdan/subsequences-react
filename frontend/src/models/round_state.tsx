import { createContext, useReducer } from 'react';


export function roundStateReducer(round: number, newRound: number) {
  return newRound;
}

export const RoundStateContext = createContext<number>(0)

export const RoundStateDispatchContext = createContext<React.Dispatch<number>>(() => { })

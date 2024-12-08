import { createContext, useReducer } from 'react';

export type GameState = "initial" | "creating" | "joining" | "waiting" | "playing" | "over"

export function gameStateReducer(gameState: GameState, newState: GameState) {
  return newState;
}

export const GameStateContext = createContext<GameState>('initial')

export const GameStateDispatchContext = createContext<React.Dispatch<GameState>>(() => { })

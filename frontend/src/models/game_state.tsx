import { createContext, useContext, useReducer } from 'react';

export type GameState = "initial" | "creating" | "joining" | "waiting" | "playing" | "over"

export function gameStateReducer(gameState: GameState, newState: GameState) {
  console.log("new state:" + newState);
  return newState;
}

const GameStateContext = createContext<GameState>('initial')

const GameStateDispatchContext = createContext<React.Dispatch<GameState>>(() => { })

export function useGameState() {
  return useContext(GameStateContext);
}

export function useSetGameState() {
  return useContext(GameStateDispatchContext);
}

export function GameStateProvider() {
  const [gameState, setGameState] = useReducer(gameStateReducer, 'initial');
  return (
    <GameStateContext.Provider value={gameState}>
      <GameStateDispatchContext.Provider value={setGameState}>
      </GameStateDispatchContext.Provider>
    </GameStateContext.Provider>
  );
} 
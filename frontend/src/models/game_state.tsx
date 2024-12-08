import { createContext, useContext, useReducer } from 'react';

export enum GameStateFE {
  INITIAL = "initial",
  CREATING = "creating",
  JOINING = "joining",
  WAITING = "waiting",
  PLAYING = "playing",
  OVER = "over"
}

export function gameStateReducer(gameState: GameStateFE, newState: GameStateFE) {
  console.log("new state:" + newState);
  return newState;
}

const GameStateContext = createContext<GameStateFE>(GameStateFE.INITIAL)

const GameStateDispatchContext = createContext<React.Dispatch<GameStateFE>>(() => { })

export function useGameState() {
  return useContext(GameStateContext);
}

export function useSetGameState() {
  return useContext(GameStateDispatchContext);
}

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useReducer(gameStateReducer, GameStateFE.INITIAL);
  return (
    <GameStateContext.Provider value={gameState}>
      <GameStateDispatchContext.Provider value={setGameState}>
        {children}
      </GameStateDispatchContext.Provider>
    </GameStateContext.Provider>
  );
} 
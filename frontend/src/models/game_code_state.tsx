import { createContext, useContext, useReducer } from 'react';

function gameCodeStateReducer(gameCode: string | null, newGameCode: string) {
  return newGameCode;
}

const GameCodeContext = createContext<string | null>(null)

const GameCodeDispatchContext = createContext<React.Dispatch<string>>(() => { })

export function useGameCode() {
  return useContext(GameCodeContext);
}

export function useSetGameCode() {
  return useContext(GameCodeDispatchContext);
}


export function GameCodeProvider({ children }: { children: React.ReactNode }) {
  const [gameCode, setGameCode] = useReducer(gameCodeStateReducer, 'default');

  return (<GameCodeContext.Provider key="gameCode" value={gameCode}>
    <GameCodeDispatchContext.Provider value={setGameCode} >
      {children}
    </GameCodeDispatchContext.Provider>
  </GameCodeContext.Provider>);

}

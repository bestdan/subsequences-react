import { createContext, useContext, useReducer } from 'react';


export function currentPlayerStateReducer(currentPlayer: string, newPlayer: string) {
  return newPlayer;
}

const CurrentPlayerContext = createContext<string>('none')

const CurrentPlayerDispatchContext = createContext<React.Dispatch<string>>(() => { })

export function useCurrentPlayer() {
  return useContext(CurrentPlayerContext)
}

export function useSetCurrentPlayer() {
  return useContext(CurrentPlayerDispatchContext)
}

export function CurrentPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentPlayer, setCurrentPlayer] = useReducer(currentPlayerStateReducer, 'none');
  return (<CurrentPlayerContext.Provider key="currentPlayer" value={currentPlayer}>
    <CurrentPlayerDispatchContext.Provider value={setCurrentPlayer} >
      {children}
    </CurrentPlayerDispatchContext.Provider>
  </CurrentPlayerContext.Provider>);
}
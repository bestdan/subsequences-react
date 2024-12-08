import { createContext, useContext, useReducer } from 'react';


export function roundStateReducer(round: number, newRound: number) {
  return newRound;
}

const RoundStateContext = createContext<number>(0)

const RoundStateDispatchContext = createContext<React.Dispatch<number>>(() => { })

export function useCurrentRound() {
  return useContext(RoundStateContext)
}

export function useSetCurrentRound() {
  return useContext(RoundStateDispatchContext)
}


export function CurrentRoundProvider({ children }: { children: React.ReactNode }) {
  const [currentRound, setCurrentRound] = useReducer(roundStateReducer, 0);
  return (<RoundStateContext.Provider key="round" value={currentRound}>
    <RoundStateDispatchContext.Provider value={setCurrentRound} />
    {children}
  </RoundStateContext.Provider>);

}

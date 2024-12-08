import { createContext, useContext, useReducer } from 'react';


export function totalRoundsStateReducer(rounds: number, newRounds: number) {
  return newRounds;
}

const TotalRoundsStateContext = createContext<number>(0)

const TotalRoundsStateDispatchContext = createContext<React.Dispatch<number>>(() => { })

export function useTotalRounds() {
  return useContext(TotalRoundsStateContext)
}

export function useSetTotalRounds() {
  return useContext(TotalRoundsStateDispatchContext)
}


export function TotalRoundsProvider() {
  const [totalRounds, setTotalRounds] = useReducer(totalRoundsStateReducer, 0);
  return (<TotalRoundsStateContext.Provider key="round" value={totalRounds}>
    <TotalRoundsStateDispatchContext.Provider value={setTotalRounds} />
  </TotalRoundsStateContext.Provider>);

}

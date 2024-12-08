import { createContext, useContext, useReducer } from 'react';

export enum GamePhase {
  Waiting = 'waiting',
  Playing = 'playing'
}

export function currentPhaseStateReducer(phase: GamePhase, newPhase: GamePhase) {
  return newPhase;
}

const CurrentPhaseStateContext = createContext<GamePhase>(GamePhase.Waiting)

const CurrentPhaseStateDispatchContext = createContext<React.Dispatch<GamePhase>>(() => { })

export function useCurrentPhase() {
  return useContext(CurrentPhaseStateContext);
}

export function useSetCurrentPhase() {
  return useContext(CurrentPhaseStateDispatchContext)
}

export function CurrentPhaseProvider() {
  const [currentPhase, setCurrentPhase] = useReducer(currentPhaseStateReducer, GamePhase.Waiting);
  return (<CurrentPhaseStateContext.Provider key="round" value={currentPhase}>
    <CurrentPhaseStateDispatchContext.Provider value={setCurrentPhase} />
  </CurrentPhaseStateContext.Provider>);

}

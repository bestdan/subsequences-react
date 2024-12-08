import { createContext, useContext, useReducer } from 'react';


export function previousTextStateReducer(text: string | null, newText: string | null) {
  return newText;
}

const PreviousTextStateContext = createContext<string | null>('')

const PreviousTextStateDispatchContext = createContext<React.Dispatch<string | null>>(() => { })

export function usePreviousText() {
  return useContext(PreviousTextStateContext)
}

export function useSetPreviousText() {
  return useContext(PreviousTextStateDispatchContext)
}


export function PreviousTextProvider({ children }: { children: React.ReactNode }) {
  const [previousText, setPreviousText] = useReducer(previousTextStateReducer, null);
  return (<PreviousTextStateContext.Provider key="previousText" value={previousText}>
    <PreviousTextStateDispatchContext.Provider value={setPreviousText} >
      {children}
    </PreviousTextStateDispatchContext.Provider >
  </PreviousTextStateContext.Provider>);


}

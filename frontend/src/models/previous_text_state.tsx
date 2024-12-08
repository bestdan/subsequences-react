import { createContext, useContext, useReducer } from 'react';


export function previousTextStateReducer(text: string, newText: string) {
  return newText;
}

const PreviousTextStateContext = createContext<string>('')

const PreviousTextStateDispatchContext = createContext<React.Dispatch<string>>(() => { })

export function usePreviousText() {
  return useContext(PreviousTextStateContext)
}

export function useSetPreviousText() {
  return useContext(PreviousTextStateDispatchContext)
}


export function PreviousTextProvider({ children }: { children: React.ReactNode }) {
  const [previousText, setPreviousText] = useReducer(previousTextStateReducer, '');
  return (<PreviousTextStateContext.Provider key="previousText" value={previousText}>
    <PreviousTextStateDispatchContext.Provider value={setPreviousText} />
    {children}
  </PreviousTextStateContext.Provider>);


}

import { createContext, useReducer } from 'react';


export function previousTextStateReducer(text: string, newText: string) {
  return newText;
}

export const PreviousTextStateContext = createContext<string>('')

export const PreviousTextStateDispatchContext = createContext<React.Dispatch<string>>(() => { })

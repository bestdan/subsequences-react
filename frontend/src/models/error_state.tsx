import { createContext } from 'react';

export function errorStateReducer(error: string | null, newError: string | null) {
  return newError;
}

export const ErrorContext = createContext<string | null>('')

export const ErrorDispatchContext = createContext<React.Dispatch<string | null>>(() => { })

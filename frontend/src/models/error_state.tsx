import { createContext, useContext, useReducer } from 'react';

function errorStateReducer(error: string | null, newError: string | null) {
  return newError;
}

const ErrorContext = createContext<string | null>('')

const ErrorDispatchContext = createContext<React.Dispatch<string | null>>(() => { })

export function useError() {
  return useContext(ErrorContext);
}

export function useSetError() {
  return useContext(ErrorDispatchContext);
}

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useReducer(errorStateReducer, null);
  return (
    <ErrorContext.Provider key="error" value={error}>
      <ErrorDispatchContext.Provider value={setError} />
      {children}
    </ErrorContext.Provider>);
}
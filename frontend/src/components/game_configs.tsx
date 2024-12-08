import { createContext } from 'react';
export const wsAddress = createContext('ws://localhost:3001');
export const httpBaseAddress = createContext('http://localhost:3001');
export const PlayerIdContext = createContext<string>(Math.random().toString(36).slice(2, 9));
export const TotalRoundsContext = createContext<number>(1);
import React, { createContext } from 'react';
export const wsAddress = createContext('ws://localhost:3001');
export const httpBaseAddress = createContext('http://localhost:3001');
export const playerId = createContext<string>(Math.random().toString(36).slice(2, 9));
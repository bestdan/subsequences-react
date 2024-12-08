import { createContext } from "react";

// Get base URL from environment or fallback to localhost
const BASE_URL = process.env.REACT_APP_BASE_URL || "localhost:3001";
// Determine protocol (ws/wss and http/https) based on environment
const WS_PROTOCOL = process.env.NODE_ENV === "production" ? "wss" : "ws";
const HTTP_PROTOCOL = process.env.NODE_ENV === "production" ? "https" : "http";
export const wsAddress = createContext(`${WS_PROTOCOL}://${BASE_URL}`);
export const httpBaseAddress = createContext(`${HTTP_PROTOCOL}://${BASE_URL}`);
export const PlayerIdContext = createContext<string>(
  Math.random().toString(36).slice(2, 9),
);
export const TotalRoundsContext = createContext<number>(2);

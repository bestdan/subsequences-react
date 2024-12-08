import { createContext } from 'react';

export function websocketStateReducer(ws: WebSocket | null, setWs: WebSocket) {
  return ws;
}

export const WebSocketContext = createContext<WebSocket | null>(null)

export const WebsocketDispatchContext = createContext<React.Dispatch<WebSocket>>(() => { })

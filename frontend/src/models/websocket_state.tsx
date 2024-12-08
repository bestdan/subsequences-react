import { createContext, useContext, useReducer } from 'react';

export function websocketStateReducer(ws: WebSocket | null, setWs: WebSocket) {
  return ws;
}

const WebSocketContext = createContext<WebSocket | null>(null)

const WebsocketDispatchContext = createContext<React.Dispatch<WebSocket>>(() => { })

export function useWebsocket() {
  return useContext(WebSocketContext);
}

export function useSetWebsocket() {
  return useContext(WebsocketDispatchContext);
}

export function WebSocketProvider() {
  const [websocket, setWebsocket] = useReducer(websocketStateReducer, null);
  return (<WebSocketContext.Provider key="websocket" value={websocket}>
    <WebsocketDispatchContext.Provider value={setWebsocket} />
  </WebSocketContext.Provider>);
}
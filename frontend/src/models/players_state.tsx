import { createContext, useContext, useReducer } from 'react';
import { PlayerIdContext } from '../components/game_configs.tsx';

function playersStateReducer(players: Set<string>, newPlayers: Set<string>) {
  return newPlayers;
}

const PlayersContext = createContext<Set<string>>(new Set<string>([]))

const PlayersDispatchContext = createContext<React.Dispatch<Set<string>>>(() => {
})

export function usePlayers() {
  return useContext(PlayersContext);
}

export function useSetPlayers() {
  return useContext(PlayersDispatchContext);
}

export function PlayersProvider({ children }: { children: React.ReactNode }) {
  const playerId = useContext(PlayerIdContext);
  const [players, setPlayers] = useReducer(playersStateReducer, new Set([playerId]));
  return (
    <PlayersContext.Provider key="players" value={players}>
      <PlayersDispatchContext.Provider value={setPlayers} >
        {children}
      </PlayersDispatchContext.Provider>
    </PlayersContext.Provider>);

}
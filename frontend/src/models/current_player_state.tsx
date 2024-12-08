import { createContext } from 'react';
import { StoryEntry } from '../components/game_story';


export function currentPlayerStateReducer(currentPlayer: string, newPlayer: string) {
  return newPlayer;
}

export const CurrentPlayerContext = createContext<string>('none')

export const CurrentPlayerDispatchContext = createContext<React.Dispatch<string>>(() => { })

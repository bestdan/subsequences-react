import { createContext } from 'react';
import { StoryEntry } from '../components/game_story';

export function storyStateReducer(story: StoryEntry[], newStory: StoryEntry[]) {
  return newStory;
}

export const StoryContext = createContext<StoryEntry[]>([])

export const StoryDispatchContext = createContext<React.Dispatch<StoryEntry[]>>(() => { })

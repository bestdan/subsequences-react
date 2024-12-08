import { createContext, useContext, useReducer } from 'react';
import { StoryEntry } from '../components/game_story';

export function storyStateReducer(story: StoryEntry[], newStory: StoryEntry[]) {
  return newStory;
}

export const StoryContext = createContext<StoryEntry[]>([])

export const StoryDispatchContext = createContext<React.Dispatch<StoryEntry[]>>(() => { })

export function useStory() {
  return useContext(StoryContext)
}

export function useSetStory() {
  return useContext(StoryDispatchContext)
}

export function StoryProvider() {
  const [story, setStory] = useReducer(storyStateReducer, []);
  return (<StoryContext.Provider key="story" value={story}>
    <StoryDispatchContext.Provider value={setStory} />
  </StoryContext.Provider>);
}

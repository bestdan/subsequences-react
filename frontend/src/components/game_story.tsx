
export interface StoryEntry {
  playerId: string;
  text: string;
}

export function MakeStoryEntry(text: string, playerId: string): StoryEntry {
  return { text, playerId };
}

export interface GameStoryFinalData {
  storyEntries: StoryEntry[];
  playerId: string;
}
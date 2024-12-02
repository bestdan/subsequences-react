
export interface StoryEntry {
  playerId: string;
  text: string;
}

export interface GameStoryFinalData {
  storyEntries: StoryEntry[];
  playerId: string;
}
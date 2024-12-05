
export interface StoryEntry {
  playerId: String;
  text: String;
}

export interface GameStoryFinalData {
  storyEntries: StoryEntry[];
  playerId: String;
}
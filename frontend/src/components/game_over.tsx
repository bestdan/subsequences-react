import React from 'react';

import { GameStoryFinalData, StoryEntry  } from './game_story';

export function GameStoryFinal({ storyEntries, playerId }: GameStoryFinalData) {
  return (
    <div>
      <h3>Our Collaborative Story:</h3>
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '20px', 
        borderRadius: '10px', 
        whiteSpace: 'pre-wrap' 
      }}>
        if (!storyEntries) return <p>Loading...</p>
        if (storyEntries.length === 0) return <p>No story entries found.</p>
            

       
       storyEntries?.map((entry:StoryEntry, index) => StoryEntryRow({entry, index, playerId}))
        
      </div>
    </div>
  );
}


function StoryEntryRow({ entry }: { entry: StoryEntry }, index: number, playerId: string) {
  return (
    <div key={index} style={{ 
      display: 'flex', 
      marginBottom: '10px' 
    }}>
      <div style={{ 
        fontWeight: 'bold', 
        marginRight: '10px', 
        minWidth: '100px', 
        textAlign: 'left' 
      }}>
        {entry.playerId === playerId ? 'You' : entry.playerId}:
      </div>
      <div style={{ 
        flex: 1, 
        paddingLeft: '10px', 
        borderLeft: '2px solid #ccc' 
      }}>
        {entry.text}
      </div>
    </div>
  ); }
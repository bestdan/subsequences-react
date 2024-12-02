import React from 'react';

import { GameStoryFinalData, StoryEntry } from './game_story';

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

                {StoryBody({ storyEntries, playerId })}

            </div>
        </div>
    );
}

export function StoryBody({ storyEntries, playerId }: GameStoryFinalData) {
    if (!storyEntries) return (<p>Loading...</p>)

    if (storyEntries.length === 0) return (<p>No story entries found.</p>)

    return (storyEntries?.map((entry, index) => (
        StoryEntryRow({ entry, index, playerId })
    )));
}

interface StoryEntryRowProps {
    entry: StoryEntry;
    index: number;
    playerId: string;
}

function StoryEntryRow(props: StoryEntryRowProps) {
    return (
        <div key={props.index} style={{
            display: 'flex',
            marginBottom: '10px'
        }}>
            <div style={{
                fontWeight: 'bold',
                marginRight: '10px',
                minWidth: '100px',
                textAlign: 'left'
            }}>
                {props.entry.playerId === props.playerId ? 'You' : props.entry.playerId}:
            </div>
            <div style={{
                flex: 1,
                paddingLeft: '10px',
                borderLeft: '2px solid #ccc'
            }}>
                {props.entry.text}
            </div>
        </div>
    );
}
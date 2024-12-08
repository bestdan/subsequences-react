import React, { useContext } from 'react';

import { GameStoryFinalData, StoryEntry } from './game_story.tsx';
import { StoryContext } from '../models/story_state.tsx';
import { PlayerIdContext } from './game_configs.tsx';


export function GameStoryFinal() {
    const story = useContext(StoryContext);
    const playerId = useContext(PlayerIdContext);

    return (
        <div>
            <h3>Our Collaborative Story:</h3>
            <div style={{
                backgroundColor: '#f0f0f0',
                padding: '20px',
                borderRadius: '10px',
                whiteSpace: 'pre-wrap'
            }}>

                {StoryBody()}

            </div>
        </div>
    );
}

export function StoryBody() {
    let story = useContext(StoryContext);
    const playerId = useContext(PlayerIdContext);
    if (!story) return (<p>Loading...</p>)

    if (story.length === 0) return (<p>No story entries found.</p>)

    return (story?.map((entry, index) => (
        StoryEntryRow({ entry, index, playerId: playerId })
    )));
}

interface StoryEntryRowProps {
    entry: StoryEntry;
    index: number;
    playerId: string;
}

function StoryEntryRow(props: StoryEntryRowProps) {
    console.log('StoryEntryRow props:', props);
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
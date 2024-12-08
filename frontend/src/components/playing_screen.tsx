

import { useCurrentPlayer } from "../models/current_player_state.tsx";
import { usePlayers } from "../models/players_state.tsx";
import { usePreviousText } from "../models/previous_text_state.tsx";
import { useCurrentRound } from "../models/round_state.tsx";
import { useSetStory, useStory } from "../models/story_state.tsx";

import { PlayerIdContext, TotalRoundsContext } from "./game_configs.tsx";
import { ChangeEvent, useContext, useState } from "react";

export function PlayingScreen() {

    const players = usePlayers();
    const currentPlayer = useCurrentPlayer()
    const round = useCurrentRound();
    const totalRounds = useContext(TotalRoundsContext);
    const story = useStory()
    const setStory = useSetStory()
    const previousText = usePreviousText();

    const [inputText, setInputText] = useState<string>('');

    const playerId = useContext(PlayerIdContext)

    return (
        <div className="game-in-progress">
            <h2>Game in Progress</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                {Array.from(players).map(player => (
                    <div
                        key={player}
                        style={{
                            padding: '10px',
                            border: player === currentPlayer ? '2px solid green' : '1px solid gray',
                            backgroundColor: player === currentPlayer ? '#e6ffe6' : 'transparent'
                        }}
                    >
                        {player === playerId ? 'You' : player}
                        {player === currentPlayer && ' (Playing)'}
                    </div>
                ))}
            </div>

            <p>Round {round} of {totalRounds}</p>

            {currentPlayer === playerId ? (
                <div>
                    <h3>Your Turn! (Round {round})</h3>
                    <PreviousTextSection />
                    <p>Continue the story (up to 255 characters):</p>
                    <textarea
                        value={String(inputText)}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value.slice(0, 255))}
                        maxLength={255}
                        rows={4}
                        style={{ width: '100%', maxWidth: '500px' }}
                        placeholder="Write the next part of the story..."
                    />
                    <p>{255 - inputText.length} characters remaining</p>
                    <button
                        onClick={() => setStory}
                        disabled={inputText.length === 0}
                    >
                        Submit
                    </button>
                </div>
            ) : (
                <div>
                    <h3>Waiting for {currentPlayer === playerId ? 'you' : currentPlayer} to play... (Round {round})</h3>
                </div>
            )}
        </div>
    );

}

export function PreviousTextSection() {
    const story = useStory();
    const playerId = useContext(PlayerIdContext);

    if (story.length === 0) return null;

    const previousText = story[story.length - 1].text
    const previousPlayer = story[story.length - 1].playerId

    return (

        <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#e6f2ff' }}>
            <p>Previous text by {previousPlayer === playerId ? 'you' : previousPlayer}:</p>
            <p>{previousText}</p>
        </div>

    );

}


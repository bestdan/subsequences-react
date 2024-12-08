import { CurrentPlayerContext } from "../models/current_player_state.tsx";
import { PlayersContext } from "../models/players_state.tsx";
import { PreviousTextStateContext } from "../models/previous_text_state.tsx";
import { RoundStateContext } from "../models/round_state.tsx";
import { StoryContext, StoryDispatchContext } from "../models/story_state.tsx";
import { PlayerIdContext, TotalRoundsContext } from "./game_configs.tsx";
import { ChangeEvent, useContext, useState } from "react";

export function PlayingScreen() {

    const players = useContext(PlayersContext);
    const currentPlayer = useContext(CurrentPlayerContext);
    const round = useContext(RoundStateContext);
    const totalRounds = useContext(TotalRoundsContext);
    const story = useContext(StoryContext);
    const setStory = useContext(StoryDispatchContext);
    const previousText = useContext(PreviousTextStateContext);

    const [inputText, setInputText] = useState<string>('');

    let pid = useContext(PlayerIdContext)

    return (
        <div className="game-lobby">
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
                        {player === pid ? 'You' : player}
                        {player === currentPlayer && ' (Playing)'}
                    </div>
                ))}
            </div>

            <p>Round {round} of {totalRounds}</p>

            {currentPlayer === pid ? (
                <div>
                    <h3>Your Turn! (Round {round})</h3>
                    {previousText && (
                        <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#e6f2ff' }}>
                            <p>Previous text by {story[story.length - 1].playerId === pid ? 'you' : story[story.length - 1].playerId}:</p>
                            <p>{previousText}</p>
                        </div>
                    )}
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
                        disabled={inputText[0].length === 0}
                    >
                        Submit
                    </button>
                </div>
            ) : (
                <div>
                    <h3>Waiting for {currentPlayer === pid ? 'you' : currentPlayer} to play... (Round {round})</h3>
                </div>
            )}
        </div>
    );

}
import { StoryEntry } from "./game_story";
import { ChangeEvent } from "react";

export function PlayingScreen(props: {
    players: Set<string>,
    playerId: string,
    currentPlayer: string,
    round: number,
    totalRounds: number,
    inputText: string,
    setInputText: (text: string) => void,
    story: StoryEntry[],
    previousText: string,
    handleSubmitText: () => void
}) {
    const {
        players,
        playerId,
        currentPlayer,
        round,
        totalRounds,
        inputText,
        setInputText,
        story,
        previousText,
        handleSubmitText
    } = props;

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
                        {player === playerId ? 'You' : player}
                        {player === currentPlayer && ' (Playing)'}
                    </div>
                ))}
            </div>

            <p>Round {round} of {totalRounds}</p>

            {currentPlayer === playerId ? (
                <div>
                    <h3>Your Turn! (Round {round})</h3>
                    {previousText && (
                        <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#e6f2ff' }}>
                            <p>Previous text by {story[story.length - 1].playerId === playerId ? 'you' : story[story.length - 1].playerId}:</p>
                            <p>{previousText}</p>
                        </div>
                    )}
                    <p>Continue the story (up to 255 characters):</p>
                    <textarea
                        value={inputText}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value.slice(0, 255))}
                        maxLength={255}
                        rows={4}
                        style={{ width: '100%', maxWidth: '500px' }}
                        placeholder="Write the next part of the story..."
                    />
                    <p>{255 - inputText.length} characters remaining</p>
                    <button
                        onClick={handleSubmitText}
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
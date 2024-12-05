export const createGame = async (
    playerId: string,
    httpBaseAddress: string,
    wsRef: React.MutableRefObject<WebSocket | null>,
    setGameState: (state: string) => void,
    setError: (error: string) => void,
    setGameCode: (code: string) => void,
    setIsHost: (isHost: boolean) => void,
    setPlayers: (players: Set<string>) => void
) => {
    try {
        console.log('Creating new game...');
        setGameState('creating');
        setError('');

        const response = await fetch(`${httpBaseAddress}/api/games`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerId }),
        });

        if (!response.ok) {
            throw new Error('Failed to create game');
        }

        const data = await response.json();
        console.log('Game created:', data);
        setGameCode(data.gameCode);
        setIsHost(true);
        setGameState('waiting');
        setPlayers(new Set([playerId]));

        // Notify WebSocket server about the new game
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'gameCreated',
                gameCode: data.gameCode,
                playerId: playerId
            }));
        }
    } catch (error) {
        console.error('Error creating game:', error);
        setError('Failed to create game. Please try again.');
        setGameState('initial');
    }
};

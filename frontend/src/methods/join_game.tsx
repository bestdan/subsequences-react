import React, { useContext } from 'react';
import { wsAddress, httpBaseAddress, playerId } from '../components/game_configs.tsx'

export interface JoinGameProps {
    gameCode: string;
    wsRef: React.MutableRefObject<WebSocket | null>;
    setGameState: (state: string) => void;
    setError: (error: string) => void;
    setGameCode: (code: string) => void;
    setPlayers: (players: Set<string>) => void;
}

export const joinGame = async (
    { gameCode, wsRef, setGameState, setError, setGameCode, setPlayers }: JoinGameProps
) => {

    try {
        setGameCode(gameCode)
        console.log('Joining game:', gameCode);
        setGameState('joining');
        setError('');

        const response = await fetch(`${useContext(httpBaseAddress)}/api/games/${gameCode}`);
        if (!response.ok) {
            throw new Error('Game not found');
        }

        const data = await response.json();
        console.log('Joined game:', data);
        setPlayers(new Set([...data.players, useContext(playerId)]));
        setGameState('waiting');
        // Notify WebSocket server about the new player
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'playerJoined',
                gameCode: gameCode,
                playerId: useContext(playerId)
            }));
        }

    } catch (error) {
        console.error('Error joining game:', error);
        setError('Failed to join game. Please check the game code and try again.');
        setGameState('initial');
    }
};
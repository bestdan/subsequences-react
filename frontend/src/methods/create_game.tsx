// import React, { useContext } from 'react';
// import { wsAddress, httpBaseAddress, playerId } from '../components/game_configs.tsx'

// export interface CreateGameProps {
//     wsRef: React.MutableRefObject<WebSocket | null>,
//     setGameState: (state: string) => void,
//     setError: (error: string) => void,
//     setGameCode: (code: string) => void,
//     setIsHost: (isHost: boolean) => void,
//     setPlayers: (players: Set<string>) => void
// }

// export const createGame = async (props: CreateGameProps) => {

//     try {
//         console.log('Creating new game...');
//         props.setGameState('creating');
//         props.setError('');
//         let pid = useContext(playerId);

//         const response = await fetch(`${useContext(httpBaseAddress)}/api/games`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ playerId: pid }),
//         });

//         if (!response.ok) {
//             throw new Error('Failed to create game');
//         }

//         const data = await response.json();
//         console.log('Game created:', data);
//         props.setGameCode(data.gameCode);
//         props.setIsHost(true);
//         props.setGameState('waiting');
//         props.setPlayers(new Set([pid]));

//         // Notify WebSocket server about the new game
//         if (props.wsRef.current?.readyState === WebSocket.OPEN) {
//             props.wsRef.current.send(JSON.stringify({
//                 type: 'gameCreated',
//                 gameCode: data.gameCode,
//                 playerId: pid
//             }));
//         }
//     } catch (error) {
//         console.error('Error creating game:', error);
//         props.setError('Failed to create game. Please try again.');
//         props.setGameState('initial');
//     }
// };

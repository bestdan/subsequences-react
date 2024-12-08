import React, { useContext } from 'react';
import { GameCodeContext } from '../models/game_code_state.tsx';
import { PlayersContext } from '../models/players_state.tsx';
import { WebSocketContext } from '../models/websocket_state.tsx';
import { PlayerIdContext } from './game_configs.tsx';



export function GameLobby() {
    const gameCode = useContext(GameCodeContext)
    const players = useContext(PlayersContext)
    const playerId = useContext(PlayerIdContext)
    const ws = useContext(WebSocketContext)

    const handleStartGame = (): void => {


        console.log('Start game clicked', {
            gameCode,
            players: Array.from(players)
        });

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'start_game',
                data: { gameCode }
            }));
        } else {
            console.error('WebSocket is not open');
        }
    };


    if (!players) return <p>Loading</p>

    return (
        <div className="game-lobby">
            <h2>Game Lobby</h2>
            <div className="game-code">
                Game Code: <span>{gameCode}</span>
            </div>
            <div className="players-list">
                <h3>Players:</h3>
                <ul>
                    {Array.from(players).map(id => (
                        <li>
                            {id === playerId ? `${id} (You)` : id}
                        </li>
                    ))}
                </ul>
            </div>
            {players.size >= 2 && (
                <button onClick={(event) => handleStartGame()}>Start Game</button>
            )}
        </div>
    );
}
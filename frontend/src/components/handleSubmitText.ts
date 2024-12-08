import { useContext } from "react";
import { WebSocketContext } from "../models/websocket_state";
import { GameCodeContext } from "../models/game_code_state";
import { CurrentPlayerContext } from "../models/current_player_state";
import { PlayerIdContext } from "./game_configs";


const handleSubmitText = (inputText: string) => {
  const websocket = useContext(WebSocketContext)
  const gameCode = useContext(GameCodeContext)
  const playerId = useContext(PlayerIdContext)
  const currentPlayer = useContext(CurrentPlayerContext)

  console.log('Submitting text:', {
    gameCode,
    playerId,
    currentPlayer,
    inputText
  });

  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({
      type: 'submit_text',
      data: {
        gameCode,
        text: inputText
      }
    }));

    // Clear input text immediately
    //setInputText('');
  }
};

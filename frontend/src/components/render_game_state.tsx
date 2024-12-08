import { useContext } from "react";
import { GameStateContext, GameState } from "../models/game_state.tsx";
import { GameStoryFinal } from "./game_final.tsx";
import { LandingMenu } from "./landing_menu.tsx";
import { GameLobby } from "./game_lobby.tsx";

import { PlayingScreen } from "./playing_screen.tsx";
export function renderGameState() {
  let localGameState = useContext(GameStateContext);


  if (localGameState == 'over') {
    return <GameStoryFinal />
  }

  switch (localGameState) {

    case 'initial':
      return <LandingMenu />
    case 'creating':
    case 'joining':
      return (
        <div className="game-menu">
          <h2>{localGameState === 'creating' ? 'Creating Game...' : 'Joining Game...'}</h2>
        </div>
      );

    case 'waiting':
      return <GameLobby />

    case 'playing':
      return <PlayingScreen />
    default:
      return null;
  }
};

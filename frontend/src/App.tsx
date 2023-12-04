import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameState, PhaseOfGame } from "./types/types";
import { v4 as uuidv4 } from "uuid";
import Game from "./components/Game";
   
function App() {
  const initialStateOfGame: GameState = {
    phaseOfGame: PhaseOfGame.welcome,
    letters: Array.from("ILOQUST"), 
    guessedWords: [],
    points: 0,
    input: [],
    message: { category: null, content: null },
    success: { success: null, points: null },
    multiPlayer: false,
    player2Name: null,
    player2GuessedWords: null,
    player2Points: null
  } 
  const [stateOfGame, setStateOfGame] = useState(initialStateOfGame);
  const navigate = useNavigate();
  function showGame() {
    navigate(`?game=${uuidv4()}&player1=player1`);
    setStateOfGame({...stateOfGame, phaseOfGame: PhaseOfGame.playing});
  }
  return (
    <div className="bg-yellow-400 h-screen">
      <h1 className="font-semibold">Spelling Bee</h1>
      {stateOfGame.phaseOfGame === PhaseOfGame.welcome ? (
        <>
          <p>How many words can you make with 7 letters?</p>
          <button
            className="btn btn-rounded text-white font-bold bg-black"
            onClick={showGame}
          >
            Play
          </button>
        </>
      ) : (
        <Game props={{stateOfGame, setStateOfGame}}/>
      )}
    </div>
  );
}

export default App;

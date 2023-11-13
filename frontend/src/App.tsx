import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Game from "./components/Game"
import { v4 as uuidv4 } from 'uuid';


function App() {
  const [stateOfGame, setStateOfGame] = useState("welcome")
  const navigate = useNavigate()
  function showGame() {
    navigate(`?game=${uuidv4()}&player=player1`)
    setStateOfGame("playing");

 }
  return (
    <div className="bg-yellow-400 h-screen">
    <h1 className="font-semibold">Spelling Bee</h1>

 {stateOfGame === "welcome" ?
 <><p>How many words can you make with 7 letters?</p>
    <button className="btn btn-rounded text-white font-bold bg-black" onClick={showGame}>Play</button>
    </> : 
    <Game/>
  }    
</div>
  )
}

export default App
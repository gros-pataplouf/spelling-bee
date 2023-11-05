import {useState} from "react"
import Game from "./components/Game"



function App() {
  const [stateOfGame, setStateOfGame] = useState("welcome")
  function showGame() {
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
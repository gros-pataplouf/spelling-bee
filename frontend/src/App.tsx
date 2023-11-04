import {useState} from "react"




function App() {


  const [stateOfGame, setStateOfGame] = useState("welcome")

  function showGame(e) {
    console.log("hello")
    e.preventDefault();
    setStateOfGame("playing");
        }

  return (
    <div className="bg-yellow-400 h-screen">
    <h1 className="font-semibold">Spelling Bee</h1>

 {stateOfGame === "welcome" ?
 <><p>How many words can you make with 7 letters?</p>
    <button className="btn btn-rounded text-white font-bold bg-black" onClick={showGame}>Play</button>
    </> : 
    <div >Playing</div>
  }    
</div>
  )
}

export default App
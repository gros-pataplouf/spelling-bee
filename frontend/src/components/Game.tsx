import { useState } from 'react'
import Cell from './Cell'

const strg = "iloqstu"
const letterArray = Array.from(strg.toUpperCase())
console.log(letterArray)

function Game() {
    const [input, setInput] = useState([""])
    function handleChange(){
        console.log("change")
    }

    return (
    <div>
    <input id="input" placeholder="Type or click" onChange={handleChange} value={input.join("")}/>
    <div id="hive">
        {letterArray.map(letter => <Cell letter={letter} middleLetter={letter === strg[0].toUpperCase()} key={letter} input={input} setInput={setInput}/>)}
    </div>
    </div>)
}

export default Game
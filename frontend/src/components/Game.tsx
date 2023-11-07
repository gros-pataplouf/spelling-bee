import { useState } from 'react'
import Cell from './Cell'
import { BaseSyntheticEvent } from 'react'
const strg = "iloqstu"
const letterArray = Array.from(strg.toUpperCase())
console.log(letterArray)

function Game() {
    const [input, setInput] = useState([""])
    function handleChange(e: BaseSyntheticEvent){
        const inputEvent = e.nativeEvent as InputEvent
        if (inputEvent.data && strg.includes(inputEvent.data.toLowerCase())) {
            setInput([...input, inputEvent.data.toUpperCase()])
        } else if (inputEvent.inputType === "deleteContentBackward") {
            setInput(input.slice(0, input.length-1))
        }
    }

    return (
    <div>
    <input id="input" role="input" placeholder="Type or click" onChange={handleChange} value={input.join("")}/>
    <div id="hive">
        {letterArray.map(letter => <Cell letter={letter} middleLetter={letter === strg[0].toUpperCase()} key={letter} input={input} setInput={setInput}/>)}
    </div>
    </div>)
}

export default Game
import { useState } from 'react'
import Cell from './Cell'
import { BaseSyntheticEvent } from 'react'
const strg = "iloqstu"
const letterArray = Array.from(strg.toUpperCase())

function Game() {
    const [input, setInput] = useState([""])
    const [letters, setLetters ] = useState(letterArray)

    function handleChange(e: BaseSyntheticEvent){
        const inputEvent = e.nativeEvent as InputEvent
        if (inputEvent.data && strg.includes(inputEvent.data.toLowerCase())) {
            setInput([...input, inputEvent.data.toUpperCase()])
        } else if (inputEvent.inputType === "deleteContentBackward") {
            setInput(input.slice(0, input.length-1))
        }
    }
    function shuffle() {
        const otherLettersOld = letters.slice(1,7)
        const otherLettersNew:string[] = []
        while (otherLettersOld.length) {
            const [removedLetter] = otherLettersOld.splice(Math.floor(Math.random()*otherLettersOld.length),1) 
            otherLettersNew.push(removedLetter)
        }
        setLetters([letterArray[0], ...otherLettersNew])
    }

    return (
    <div>
    <input id="input" role="input" placeholder="Type or click" onChange={handleChange} value={input.join("")}/>
    <div id="hive">
        {letters.map(letter => <Cell letter={letter} middleLetter={letter === strg[0].toUpperCase()} key={letter} input={input} setInput={setInput}/>)}
    </div>
    <button id="clear">Shuffle</button>
    <button id="shuffle" onClick={shuffle}>Shuffle</button>
    </div>)
}

export default Game
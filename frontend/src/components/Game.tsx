import { useState, useEffect } from 'react'
import { BaseSyntheticEvent } from 'react'
import Cell from './Cell'
import { GameMessage } from '../types/types'
const strg = "iloqstu"
const letterArray = Array.from(strg.toUpperCase())
function Game() {
    const socket = new WebSocket("ws://localhost:5000")
    socket.onmessage = (message) => {
        const parsedData = JSON.parse(message.data)
        if (parsedData.letters) {
            setLetters(Array.from(parsedData.letters))
        }

    }
    const [input, setInput] = useState([""])
    const [letters, setLetters ] = useState(letterArray)
    const initialGameMessage: GameMessage = {category: null, content: ""}
    const [message, setMessage] = useState(initialGameMessage)
    useEffect(() => {
        setMessage(initialGameMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input])
    function handleChange(e: BaseSyntheticEvent){
        const inputEvent = e.nativeEvent as InputEvent
        if (inputEvent.data && strg.includes(inputEvent.data.toLowerCase())) {
            setInput([...input, inputEvent.data.toUpperCase()])
        } else if (inputEvent.inputType === "deleteContentBackward") {
            setInput(input.slice(0, input.length-1))
        }
    }
    function deleteLetter() {
        if(input.length) {
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


    function submitWord() {
        if (input.join("").length < 4) {
            setMessage({category: "warning", content: "too short"})
            return
        }
        const solution = JSON.stringify(
            {
                type: "submission",
                content: input.join(""), 
            }
        )
        console.log("sending")
        socket.send(solution)
    }
    
    function handleKeyDown(event:React.KeyboardEvent<HTMLInputElement>) {
        if (event.code == "Enter") {
            submitWord()
        }}
    

    return (
    <div>
    <input id="input" role="input" placeholder="Type or click" onChange={handleChange} onKeyDown={handleKeyDown} value={input.join("")}/>
    <p>{message.content}</p>
    <div id="hive">
        {letters.map(letter => <Cell letter={letter} middleLetter={letter === strg[0].toUpperCase()} key={letter} input={input} setInput={setInput}/>)}
    </div>
    <button id="delete" onClick={deleteLetter}>Delete</button>
    <button id="shuffle" onClick={shuffle}>Shuffle</button>
    <button id="enter" onClick={submitWord}>Enter</button>

    </div>)
}

export default Game
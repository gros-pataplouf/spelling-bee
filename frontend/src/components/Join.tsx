import type React from 'react'
import { type JoinProps } from '../types/types'
import { type BaseSyntheticEvent, useState } from 'react'

export default function Join (props: JoinProps): React.JSX.Element {
  const { startGame, stateOfGame, setStateOfGame } = props
  const [userInput, setUserInput] = useState('Player2')
  function handleChange (e: BaseSyntheticEvent): void {
    const newName = e.target.value as string
    setUserInput(newName)
  }
  function submitName (): void {
    if (userInput === '') {
      return
    }
    setStateOfGame((draft) => {
      return {
        ...draft,
        player1Name: userInput
      }
    })
  }
  return <>
      <p>How many words can you make with 7 letters?</p>
      <p>{stateOfGame.player1Name} has invited you to play spelling bee!</p>
      <p>Please enter your name</p>
    <input value={userInput} onChange={handleChange} onMouseLeave={submitName}/>

      <button
        className="btn btn-rounded text-white font-bold bg-black"
        onClick={startGame('solo')}
      >
        Join game
      </button>

    </>
}

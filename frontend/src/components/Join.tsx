import type React from 'react'
import { type JoinProps } from '../types/types'
import { type BaseSyntheticEvent, useState } from 'react'

export default function Join (props: JoinProps): React.JSX.Element {
  const { startGame, setStateOfGame } = props
  const [userInput, setUserInput] = useState('player 2')
  function handleChange (e: BaseSyntheticEvent): void {
    const newName = e.target.value as string
    setUserInput(newName)
  }
  function submitName (): void {
    console.log(userInput)
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
  return <div className="flex flex-col space-y-12 text-center dark:text-black">
      <p className="text-xl text-bold">How many words can you make with 7 letters?</p>
      <p className="text-xl text-bold">You have been invited to play Spelling Bee!</p>
      <p className="text-xl text-bold">Please enter your name:</p>
      <input className="mx-auto input text-xl text-bold mb-4" value={userInput} onClick={ () => { userInput === 'player 2' && setUserInput('') } } onChange={handleChange} onMouseLeave={submitName}/>
      <button
        className="btn btn-rounded text-white font-bold bg-black mx-auto block"
        onClick={startGame('joining')}
      >
        Join game
      </button>
    </div>
}

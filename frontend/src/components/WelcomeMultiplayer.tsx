import type React from 'react'
import { type BaseSyntheticEvent, useState } from 'react'
import { type GameProps } from '../types/types'

export default function WelcomeMultiplayer ({ props }: GameProps): React.JSX.Element {
  const [notification, setNotification] = useState('')
  const [userInput, setUserInput] = useState('your name')
  const { stateOfGame, setStateOfGame } = props
  console.log(stateOfGame)
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

  function copyToClipBoard (): void {
    void navigator.clipboard.writeText(window.location.href)
    setNotification('Success! Waiting for your friend to join the game')
  }
  if (stateOfGame.player1Name === null) {
    return <div className="flex flex-col space-y-12 text-center dark:text-black">
    <p className="text-xl text-bold">Please enter your name</p>
    <input className="mx-auto input" value={userInput} onChange={handleChange} onClick={() => { userInput === 'your name' && setUserInput('') }}/>
    <button
        className="btn btn-rounded text-white font-bold bg-black mx-auto block"
        onClick={submitName}
      >
        Confirm
      </button>
  </div>
  }
  return <div className="flex flex-col space-y-12 text-center dark:text-black">
      <p className="text-xl text-bold">Send this link to your friend</p>
      <p className="text-xl text-bold cursor-copy" onClick={copyToClipBoard}>{window.location.href}</p>
      <button className="btn btn-solid-secondary btn-lg block mx-auto dark:bg-gray-700 dark:text-gray-100" onClick={copyToClipBoard}>Copy</button>
      <p className="text-2xl dark:text-red-800 animate-pulse">{notification}</p>
    </div>
}

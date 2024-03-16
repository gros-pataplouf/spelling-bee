import type React from 'react'
import { type BaseSyntheticEvent, useState } from 'react'
import { type GameProps } from '../types/types'

export default function WelcomeMultiplayer ({ props }: GameProps): React.JSX.Element {
  const [notification, setNotification] = useState('')
  const [userInput, setUserInput] = useState('your name')
  const { stateOfGame, setStateOfGame } = props
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
    return <>
    <p>Please enter your name</p>
    <input value={userInput} onChange={handleChange} />
    <button
        className="btn btn-rounded text-white font-bold bg-black"
        onClick={submitName}
      >
        Confirm
      </button>
  </>
  }
  return <>
      <p>Send this link to your friend</p>
      <p>{window.location.href}</p>
      <button className="btn btn-solid-secondary btn-sm" onClick={copyToClipBoard}>Copy</button>
      <p>{notification}</p>
    </>
}

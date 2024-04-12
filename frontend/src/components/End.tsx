// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import React from 'react'
import { type NotificationProps } from '../types/types'
import { useNavigate } from 'react-router-dom'
import { initialStateOfGame } from '../App'

export default function End (props: NotificationProps): React.JSX.Element {
  const { stateOfGame, setStateOfGame } = props
  const navigate = useNavigate()
  function reset (): void {
    localStorage.clear()
    navigate('/')
    setStateOfGame(initialStateOfGame)
  }
  return <div className="flex flex-col space-y-12">
      <p className="text-2xl text-center dark:text-black">Game over <br/> {stateOfGame.message.content}</p>
      <button
        className="btn btn-rounded text-white font-bold text-xl bg-black block mx-auto"
        onClick={reset}
        >
        Play again with {stateOfGame.player2Name}
      </button>
      <p>or</p>
      <button
        className="btn btn-rounded text-white font-bold text-xl bg-black block mx-auto"
        onClick={reset}
        >
        Reset
      </button>
    </div>
}
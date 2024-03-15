import type React from 'react'
import { type WelcomeProps } from '../types/types'

export default function Welcome (props: WelcomeProps): React.JSX.Element {
  const { startGame } = props
  return <>
      <p>How many words can you make with 7 letters?</p>
      <button
        className="btn btn-rounded text-white font-bold bg-black"
        onClick={startGame('solo')}
      >
        Play alone
      </button>
      <button
        className="btn btn-rounded text-white font-bold bg-black"
        onClick={startGame('multiplayer')}
      >
        Invite a friend
      </button>
    </>
}

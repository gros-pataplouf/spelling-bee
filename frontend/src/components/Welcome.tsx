import type React from 'react'
import { type WelcomeProps } from '../types/types'

export default function Welcome (props: WelcomeProps): React.JSX.Element {
  const { startGame, stateOfGame } = props
  return <div className="flex flex-col space-y-12">
      <p className="text-2xl text-center dark:text-black">How many words <br/> can you make with 7 letters?</p>

      {((stateOfGame?.loading) ?? false)
        ? <div className="relative h-[33vh] flex justify-center items-center">
            <div className="spinner-dot-intermittent [--spinner-color:var(--red-8)]"></div>
            </div>
        : <>
            <button
            className="btn btn-rounded text-white font-bold text-xl bg-black block mx-auto"
            onClick={startGame('playing')}
          >
            Play alone
          </button>
          <button
            className="btn btn-rounded text-white font-bold text-xl bg-black block mx-auto"
            onClick={startGame('inviting')}
          >
            Invite a friend
          </button>

            </>
      }

    </div>
}

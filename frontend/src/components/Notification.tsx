import type React from 'react'
import { useEffect } from 'react'
import { type GameProps } from '../types/types'

export default function Notification (props: GameProps): React.JSX.Element {
  const { stateOfGame, setStateOfGame } = props
  useEffect(() => {
    setTimeout(() => {
      if (stateOfGame.message.content != null) {
        setStateOfGame((draft) => {
          return {
            ...draft,
            message: {
              category: null,
              points: null,
              content: null
            }
          }
        })
      }
    }, 3000)
  }, [stateOfGame.message])

  return <p className="animate-bounce text-lg dark:text-red-900">
      &nbsp;
      <span id="notificationMessage">{stateOfGame.message?.content}</span>{' '}
      <span id="notificationPoints">{(stateOfGame.message?.points) != null && stateOfGame.message.points > 0 && '+'.concat(stateOfGame.message.points.toString())}</span>
    </p>
}

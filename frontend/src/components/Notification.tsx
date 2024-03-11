import type React from 'react'
import { type NotificationProps } from '../types/types'

export default function Notification (props: NotificationProps): React.JSX.Element {
  // eslint-disable-next-line no-unused-vars
  const { stateOfGame } = props
  return <p>
      <span id="notificationMessage">{stateOfGame.message?.content}</span>{' '}
      <span id="notificationPoints">{(stateOfGame.message?.points) != null && stateOfGame.message.points > 0 && '+'.concat(stateOfGame.message.points.toString())}</span>
    </p>
}

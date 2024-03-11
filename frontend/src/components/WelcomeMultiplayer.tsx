import type React from 'react'
import { type WelcomeProps } from '../types/types'

export default function WelcomeMultiplayer (_props: WelcomeProps): React.JSX.Element {
  return <>
      <p>Send this link to your friend</p>
      <p>{window.location.href}</p>

    </>
}

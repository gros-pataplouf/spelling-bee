import type React from 'react'
import { useState } from 'react'

export default function WelcomeMultiplayer (): React.JSX.Element {
  const [notification, setNotification] = useState('')
  function copyToClipBoard (): void {
    void navigator.clipboard.writeText(window.location.href)
    setNotification('Success! Waiting for your friend to join the game')
  }
  return <>
      <p>Send this link to your friend</p>
      <p>{window.location.href}</p>
      <button className="btn btn-solid-secondary btn-sm" onClick={copyToClipBoard}>Copy</button>
      <p>{notification}</p>
    </>
}

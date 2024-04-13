/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type React from 'react'
// import { useEffect, type BaseSyntheticEvent } from 'react'
import { type PlayerStatsProps } from '../types/types'

export default function Timer (props: PlayerStatsProps): React.JSX.Element {
  function formatTime (seconds: number): string {
    const displayedMinutes = (Math.floor(seconds / 60)).toString()
    let displayedSeconds = (seconds % 60).toString()
    if (displayedSeconds.length < 2) {
      displayedSeconds = '0'.concat(displayedSeconds)
    }
    return `${displayedMinutes}:${displayedSeconds} `
  }

  const { stateOfGame } = props

  return (
      <div className="text-red-700 text-2xl font-bold absolute top-8 right-8">{formatTime(stateOfGame.secondsLeft!)}</div>
  )
}

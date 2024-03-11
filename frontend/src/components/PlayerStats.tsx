import type React from 'react'
// import { useEffect, type BaseSyntheticEvent } from 'react'
import { type PlayerStatsProps } from '../types/types'

export default function PlayerStats (props: PlayerStatsProps): React.JSX.Element {
  const { stateOfGame } = props

  return <div className="card bg-gray-200 m-4">
      {stateOfGame.multiPlayer && <p id="playerName">{stateOfGame.player1Name}</p>}
      <p className="text-center">
        <span id="points">{stateOfGame.player1Points}</span> points
      </p>
      {stateOfGame.player1GuessedWords?.length > 0 && (
        <ul id="words" className="flex flex-wrap">
          {stateOfGame.player1GuessedWords.map((word) => {
            return <li key={word} className="mx-2">{word}</li>
          })}
        </ul>
      )}
        {stateOfGame.player2GuessedWords?.length !== undefined && stateOfGame.player2GuessedWords?.length > 0 && (
        <ul id="words2">your opponent has {stateOfGame.player2Points} points
        {stateOfGame.player2GuessedWords?.map((word) => {
          return <li key={word}>{word}</li>
        })}
        </ul>
        )}
    </div>
}

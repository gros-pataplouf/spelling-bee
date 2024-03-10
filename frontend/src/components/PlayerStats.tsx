import type React from 'react'
// import { useEffect, type BaseSyntheticEvent } from 'react'
import { type PlayerStatsProps } from '../types/types'

export default function PlayerStats (props: PlayerStatsProps): React.JSX.Element {
  const { stateOfGame, setStateOfGame } = props
  function changePlayerName (event: React.BaseSyntheticEvent): void {
    setStateOfGame({ ...stateOfGame, player1Name: event.target.value })
  }
  return <div>
      <input
        id="playerName"
        value={stateOfGame.player1Name}
        onChange={changePlayerName} />
      <p>
        <span id="points">{stateOfGame.player1Points}</span> points
      </p>
      {stateOfGame.player1GuessedWords?.length > 0 && (
        <ul id="words">
          {stateOfGame.player1GuessedWords.map((word) => {
            return <li key={word}>{word}</li>
          })}
        </ul>
      )}
        {stateOfGame.player2GuessedWords?.length !== undefined && stateOfGame.player2GuessedWords?.length > 0 && (
        <ul id="words2">
        {stateOfGame.player2GuessedWords?.map((word) => {
          return <li key={word}>{word}</li>
        })}
        </ul>
        )}
    </div>
}

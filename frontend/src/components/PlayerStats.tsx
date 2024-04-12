import type React from 'react'
// import { useEffect, type BaseSyntheticEvent } from 'react'
import { type PlayerStatsProps } from '../types/types'

export default function PlayerStats (props: PlayerStatsProps): React.JSX.Element {
  const { stateOfGame } = props

  return <div className="card m-4">
      <p className="text-center">
        <span id="points">{stateOfGame.player1Points}</span> points, {stateOfGame.guessesLeft} words left! &nbsp;
        <span className="text-red-700 font-bold">{stateOfGame.secondsLeft != null && Math.floor(stateOfGame.secondsLeft / 60)}:{stateOfGame.secondsLeft != null && stateOfGame.secondsLeft % 60}</span>
      </p>
      {stateOfGame.player1GuessedWords?.length > 0 && (
        <ul id="words" className="flex flex-wrap">
          {stateOfGame.player1GuessedWords.map((word) => {
            return <li key={word} className="mx-2">{word}</li>
          })}
        </ul>
      )}
        {stateOfGame.player2Name != null && (
        <>
        <p className="text-center">
              <span id="points">{stateOfGame.player2Name} has {stateOfGame.player2Points}</span> points
            </p>
        <ul id="words2" className="flex flex-wrap">
        {stateOfGame.player2GuessedWords?.map((word) => {
          return <li key={word} className="mx-2">{word}</li>
        })}
        </ul>
        </>
        )}
    </div>
}

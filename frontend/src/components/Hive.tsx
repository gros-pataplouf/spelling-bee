import type React from 'react'
import { v4 as uuidv4 } from 'uuid'
import { type GameProps } from '../types/types'
import Cell from './Cell'

export default function Hive (props: GameProps): React.JSX.Element {
  const { stateOfGame, setStateOfGame } = props
  return (
        <div id="hive" className="relative h-[33vh] w-full">
      {stateOfGame.letters.map((letter: string) => (
        <Cell
          letter={letter}
          middleLetter={letter === stateOfGame.letters[0]}
          key={uuidv4()}
          stateOfGame={stateOfGame}
          setStateOfGame={setStateOfGame}
        />
      ))}
    </div>
  )
}

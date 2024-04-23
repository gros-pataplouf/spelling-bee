import type React from 'react'
import { PhaseOfGame, type GameProps } from '../types/types'
import PlayerStats from './PlayerStats'
import Notification from './Notification'
import Timer from './Timer'
import Spinner from './Spinner'
import Hive from './Hive'
import Input from './Input'

function Game (props: GameProps): React.JSX.Element {
  const { stateOfGame, setStateOfGame } = props
  function deleteLetter (): void {
    if (stateOfGame.input.length > 0) {
      setStateOfGame((draft) => {
        return {
          ...draft,
          input: draft.input.slice(0, draft.input.length - 1)
        }
      })
    }
  }
  function shuffle (): void {
    const otherLettersOld = stateOfGame.letters.slice(1, 7)
    const otherLettersNew: string[] = []
    while (otherLettersOld.length > 0) {
      const [removedLetter] = otherLettersOld.splice(
        Math.floor(Math.random() * otherLettersOld.length),
        1
      )
      otherLettersNew.push(removedLetter)
    }
    setStateOfGame((draft) => {
      return {
        ...draft,
        letters: [draft.letters[0], ...otherLettersNew]
      }
    })
  }

  function submitWord (): void {
    setStateOfGame((draft) => { return { ...draft, guess: draft.input.join('') } })
  }

  function discardGame (): void {
    setStateOfGame((draft) => { return { ...draft, phaseOfGame: PhaseOfGame.discarded } })
  }

  return (
    <div className="flex flex-col items-center">
      <Timer stateOfGame={stateOfGame} setStateOfGame={setStateOfGame}/>
      <Notification stateOfGame={stateOfGame} setStateOfGame={setStateOfGame} />
      <Input stateOfGame={stateOfGame} setStateOfGame={setStateOfGame} />

      {stateOfGame.letters[0] === '?'
        ? <Spinner />
        : <Hive stateOfGame={stateOfGame} setStateOfGame={setStateOfGame} />

      }

      <div className="flex justify-center">
        <button
          className="btn rounded-full mx-2"
          id="delete"
          onClick={deleteLetter}
        >
          Delete
        </button>
        <button
          className="btn rounded-full mx-2"
          id="shuffle"
          onClick={shuffle}
        >
          Shuffle
        </button>
        <button
          className="btn rounded-full mx-2 bg-black text-white"
          id="enter"
          onClick={submitWord}
        >
          Enter
        </button>
        <div>
          <button className='btn absolute top-8 left-9' onClick={discardGame}>Stop</button>
        </div>
      </div>
        <PlayerStats stateOfGame={stateOfGame} setStateOfGame={setStateOfGame}/>
    </div>
  )
}

export default Game

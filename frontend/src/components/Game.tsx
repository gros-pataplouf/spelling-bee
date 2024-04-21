import type React from 'react'
import { v4 as uuidv4 } from 'uuid'
import { type BaseSyntheticEvent } from 'react'
import Cell from './Cell'
import PlayerStats from './PlayerStats'
import Notification from './Notification'
import Timer from './Timer'
import { PhaseOfGame, type GameProps } from '../types/types'

function Game ({ props }: GameProps): React.JSX.Element {
  const { stateOfGame, setStateOfGame } = props
  function handleChange (e: BaseSyntheticEvent): void {
    const inputEvent = e.nativeEvent as InputEvent
    if (
      inputEvent.data !== null &&
      stateOfGame.letters.length > 0 &&
      stateOfGame.letters
        .join('')
        .toLowerCase()
        .includes(inputEvent.data.toLowerCase())
    ) {
      setStateOfGame((draft) => {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        const input = inputEvent.data as string
        return {
          ...draft,
          input: [...draft.input, input.toUpperCase()]
        }
      })
    } else if (inputEvent.inputType === 'deleteContentBackward') {
      setStateOfGame((draft) => {
        return {
          ...draft,
          input: draft.input.slice(0, draft.input.length - 1)
        }
      })
    }
  }
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

  function handleKeyDown (event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.code === 'Enter') {
      submitWord()
    }
  }

  return (
    <div className="flex flex-col items-center">
      <Timer stateOfGame={stateOfGame} setStateOfGame={setStateOfGame}/>
      <Notification stateOfGame={stateOfGame} setStateOfGame={setStateOfGame} />

      <input
        id="input"
        className="block input-lg input"
        role="input"
        placeholder="Type or click"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={stateOfGame?.input.join('')}
      />
      {stateOfGame.letters[0] === '?'
        ? <div className="relative h-[33vh] flex justify-center items-center">
        <div className="spinner-dot-intermittent [--spinner-color:var(--red-8)]"></div>
        </div>
        : <div id="hive" className="relative h-[33vh] w-full">
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

import type React from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useEffect, type BaseSyntheticEvent } from 'react'
import Cell from './Cell'
import PlayerStats from './PlayerStats'
import Notification from './Notification'
import WelcomeMultiplayer from './WelcomeMultiplayer'
import { type GameProps } from '../types/types'

function Game ({ props }: GameProps): React.JSX.Element {
  const { stateOfGame, setStateOfGame } = props

  useEffect(() => {
    setStateOfGame({
      ...stateOfGame,
      message: { category: null, content: null, points: null }
    })
  }, [stateOfGame.input])
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
      setStateOfGame({
        ...stateOfGame,
        input: [...stateOfGame.input, inputEvent.data.toUpperCase()]
      })
    } else if (inputEvent.inputType === 'deleteContentBackward') {
      setStateOfGame({
        ...stateOfGame,
        input: stateOfGame.input.slice(0, stateOfGame.input.length - 1)
      })
    }
  }
  function deleteLetter (): void {
    if (stateOfGame.input.length > 0) {
      setStateOfGame({
        ...stateOfGame,
        input: stateOfGame.input.slice(0, stateOfGame.input.length - 1)
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
    setStateOfGame({
      ...stateOfGame,
      letters: [stateOfGame.letters[0], ...otherLettersNew]
    })
  }

  function submitWord (): void {
    setStateOfGame({ ...stateOfGame, guess: stateOfGame.input.join('') })
  }

  function handleKeyDown (event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.code === 'Enter') {
      submitWord()
    }
  }

  return (
    stateOfGame.multiPlayer && stateOfGame.player2Id === null
      ? <WelcomeMultiplayer/>
      : <div className="flex flex-col items-center">
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
      </div>
        <PlayerStats stateOfGame={stateOfGame} setStateOfGame={setStateOfGame}/>
    </div>
  )
}

export default Game

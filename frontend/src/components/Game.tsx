import type React from 'react'

import { useEffect, type BaseSyntheticEvent } from 'react'
import Cell from './Cell'
import { type GameProps } from '../types/types'

function Game ({ props }: GameProps): React.JSX.Element {
  const { stateOfGame, setStateOfGame } = props

  useEffect(() => {
    setStateOfGame({
      ...stateOfGame,
      message: { category: null, content: null }
    })
  }, [stateOfGame.input, stateOfGame.player1Points])
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
    if (stateOfGame.input.join('').length < 4) {
      setStateOfGame({
        ...stateOfGame,
        message: { category: 'warning', content: 'too short' }
      })
    } else if (!stateOfGame.input.join('').includes(stateOfGame.letters[0])) {
      setStateOfGame({
        ...stateOfGame,
        message: { category: 'warning', content: 'middleletter missing' }
      })
    } else {
      setStateOfGame({ ...stateOfGame, guess: stateOfGame.input.join('') })
    }
  }

  function handleKeyDown (event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.code === 'Enter') {
      submitWord()
    }
  }

  function changePlayerName (event: React.BaseSyntheticEvent): void {
    setStateOfGame({ ...stateOfGame, player1Name: event.target.value })
  }

  return (
    <div className="flex flex-col items-center">
      {stateOfGame.success.points !== null && (
        <p>
          <span id="successMessage">{stateOfGame.success.success}</span>{' '}
          <span id="successPoints">+{stateOfGame.success.points}</span>
        </p>
      )}
      <input
        id="input"
        className="block"
        role="input"
        placeholder="Type or click"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={stateOfGame?.input.join('')}
      />
      <p id="message">{stateOfGame.message.content}</p>
      <div id="hive" className="relative h-[33vh] w-full">
        {stateOfGame.letters.map((letter: string) => (
          <Cell
            letter={letter}
            middleLetter={letter === stateOfGame.letters[0]}
            key={letter}
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
      <div>
        <div>
          <input
            id="playerName"
            value={stateOfGame.player1Name}
            onChange={changePlayerName}
          />
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
        </div>
      </div>
    </div>
  )
}

export default Game

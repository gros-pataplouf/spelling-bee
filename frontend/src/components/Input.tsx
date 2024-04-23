import type React from 'react'
import { type BaseSyntheticEvent } from 'react'
import { type GameProps } from '../types/types'

export default function Input (props: GameProps): React.JSX.Element {
  const { stateOfGame, setStateOfGame } = props
  function submitWord (): void {
    setStateOfGame((draft) => { return { ...draft, guess: draft.input.join('') } })
  }
  function handleKeyDown (event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.code === 'Enter') {
      submitWord()
    }
  }
  function handleChange (e: BaseSyntheticEvent): void {
    const inputEvent = e.nativeEvent as InputEvent
    if (
      inputEvent.data !== null &&
      stateOfGame.letters.length > 0 &&
      (Boolean(stateOfGame.letters
        .join('')
        .toLowerCase()
        .includes(inputEvent.data.toLowerCase())))
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

  return (
        <input
        id="input"
        className="block input-lg input"
        role="input"
        placeholder="Type or click"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={stateOfGame?.input.join('')}
      />

  )
}

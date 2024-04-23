import type React from 'react'
import { type CellProps } from '../types/types'
import { type BaseSyntheticEvent } from 'react'

function Cell (props: CellProps): React.JSX.Element {
  let sortOfLetter: string = ''
  if (props.middleLetter) {
    sortOfLetter = 'middleLetter'
  } else {
    sortOfLetter = 'otherLetter'
  }
  const { setStateOfGame } = props

  function selectLetter (event: BaseSyntheticEvent): void {
    const svg = event.currentTarget as SVGElement
    if (svg.lastChild?.textContent !== null) {
      const selectedLetter = svg.lastChild?.textContent
      if (selectedLetter !== undefined) {
        setStateOfGame((draft) => {
          return {
            ...draft,
            input: [...draft.input, selectedLetter]
          }
        })
      }
    }
  }

  return (
    <svg
      onClick={selectLetter}
      height="64"
      viewBox="0 0 120 103.92304845413263"
      className={`${sortOfLetter} absolute`}
      key={props.letter}
    >
      <polygon
        points="0,51.96152422706631 30,0 90,0 120,51.96152422706631 90,103.92304845413263 30,103.92304845413263"
        fill="white"
        stroke="gray"
      ></polygon>
      <text x="51.96" y="60" fontFamily="Arial" fontSize="30" fontWeight="bold">
        {props.letter}
      </text>
    </svg>
  )
}

export default Cell

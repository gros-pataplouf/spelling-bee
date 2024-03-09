import type React from 'react'

export enum PhaseOfGame {
  playing = 'playing',
  welcome = 'welcome',
}

export interface GameState {
  gameId: string | null
  gameTimeStamp: number | null
  phaseOfGame: PhaseOfGame
  letters: string[]
  player1Id: string | null
  playerName: string
  guessedWords: string[] | []
  points: number
  input: string[]
  message: ServerMessage
  success: SuccessMessage
  multiPlayer: boolean
  player2Id: string | null
  player2Name: string | null
  player2GuessedWords: string[] | [] | null
  player2Points: number | null
  guess?: string
}

export interface GameProps {
  props: {
    stateOfGame: GameState
    setStateOfGame: React.Dispatch<React.SetStateAction<GameState>>
  }
}

export interface CellProps {
  letter: string
  middleLetter: boolean
  stateOfGame: GameState
  setStateOfGame: React.Dispatch<React.SetStateAction<GameState>>
}

export interface ServerMessage {
  category: string | null
  content: string | null
}

export enum ClientMessageType {
  submission = 'submission',
  message = 'message',
}

export interface ClientMessage {
  type: ClientMessageType
  content: string
}

export interface SuccessMessage {
  success: string | null
  points: number | null
}

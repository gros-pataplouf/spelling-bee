import type React from 'react'

export enum PhaseOfGame {
  playing = 'playing',
  welcome = 'welcome',
  joining = 'joining',
  waiting = 'waiting',
  inviting = 'inviting',
  error = 'error',
  ended = 'ended',
  discarded = 'discarded'
}

export interface GameState {
  gameId: string | null
  secondsLeft: number | null
  phaseOfGame: PhaseOfGame
  letters: string[]
  player1Id: string | null
  player1Name: string | null
  player1GuessedWords: string[] | []
  player1Points: number
  input: string[]
  message: ServerMessage
  multiPlayer: boolean
  player2Id: string | null
  player2Name: string | null
  player2GuessedWords: string[] | [] | null
  player2Points: number | null
  guess?: string
  loading?: boolean
  guessesLeft?: number | null
}

export interface GameProps {
  stateOfGame: GameState
  setStateOfGame: React.Dispatch<React.SetStateAction<GameState>>
}

export interface CellProps {
  letter: string
  middleLetter: boolean
  stateOfGame: GameState
  setStateOfGame: React.Dispatch<React.SetStateAction<GameState>>
}

export interface WelcomeProps {
  // TO DO construct proper function signature for startGame
  // eslint-disable-next-line @typescript-eslint/ban-types
  startGame: Function
  stateOfGame: GameState

}

export interface JoinProps {
  // TO DO construct proper function signature for startGame
  // eslint-disable-next-line @typescript-eslint/ban-types
  startGame: Function
  stateOfGame: GameState
  setStateOfGame: React.Dispatch<React.SetStateAction<GameState>>
}

export interface ServerMessage {
  category: string | null
  content: string | null
  points: number | null
}

export enum ClientMessageType {
  submission = 'submission',
  message = 'message',
}

export interface ClientMessage {
  type: ClientMessageType
  content: string
}

export enum PhaseOfGame {
  playing = "playing",
  welcome = "welcome",
}

export interface GameState {
  phaseOfGame: PhaseOfGame;
  letters: string[];
  guessedWords: string[] | [];
  points: number;
  input: string[];
  message: ServerMessage;
  success: SuccessMessage;
  multiPlayer: boolean;
  player2Name: string | null;
  player2GuessedWords: string[] | [] | null;
  player2Points: number | null;
}

export interface GameProps {
  props: {
    stateOfGame: GameState;
    setStateOfGame: React.Dispatch<React.SetStateAction<GameState>>;
  };
}

export interface CellProps {
  letter: string;
  middleLetter: boolean;
  stateOfGame: GameState;
  setStateOfGame: React.Dispatch<React.SetStateAction<GameState>>;
}

export interface ServerMessage {
  category: string | null;
  content: string | null;
}

export enum ClientMessageType {
  submission = "submission",
  message = "message",
}

export interface ClientMessage {
  type: ClientMessageType;
  content: string;
}

export interface QueryDict {
  game: string | null;
  player1: string | null;
  player2: string | null;
}

export interface SuccessMessage {
  success: string | null;
  points: number | null;
}

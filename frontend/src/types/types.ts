export interface CellProps {
    letter: string,
    middleLetter: boolean, 
    input: string[],
    setInput: React.Dispatch<React.SetStateAction<string[]>>
}


export enum ServerMessageType {
    Log = 'Log',
    NoMoreLogs = 'NoMoreLogs',
  }
   
export interface ServerMessage {
    id: number;
    type: ServerMessageType;
    content: string;
  }

export enum ClientMessageType {
    submission = 'submission',
    message = 'message'
}
   
export interface ClientMessage {
    type: ClientMessageType;
    content: string;
}
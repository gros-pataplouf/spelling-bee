export interface CellProps {
    letter: string,
    middleLetter: boolean, 
    input: string[],
    setInput: React.Dispatch<React.SetStateAction<string[]>>
}
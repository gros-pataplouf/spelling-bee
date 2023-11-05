import { CellProps } from '../types/types'


function Cell(props: CellProps): JSX.Element {
    return ( 
    <svg viewBox="0 0 480 103.92304845413263" key={props.letter}>
        <polygon points="0,51.96152422706631 30,0 90,0 120,51.96152422706631 90,103.92304845413263 30,103.92304845413263" fill="gray" stroke="white"></polygon>
        <text x="50%" y="50%" fontFamily="Arial" fontSize="25">{props.letter}</text>
    </svg>
    )
}

export default Cell
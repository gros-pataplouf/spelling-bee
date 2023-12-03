import { CellProps } from "../types/types";

function Cell(props: CellProps): JSX.Element {
  let sortOfLetter: string = "";
  if (props.middleLetter) {
    sortOfLetter = "middleLetter";
  } else {
    sortOfLetter = "otherLetter";
  }
  const { input, setInput } = props;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function selectLetter(event: any) {
    const svg = event.currentTarget as SVGElement;
    const selectedLetter = svg.lastChild?.textContent as string;
    setInput([...input, selectedLetter]);
  }

  return (
    <svg
      onClick={selectLetter}
      height="50"
      viewBox="0 0 120 103.92304845413263"
      className={sortOfLetter}
      key={props.letter}
    >
      <polygon
        points="0,51.96152422706631 30,0 90,0 120,51.96152422706631 90,103.92304845413263 30,103.92304845413263"
        fill="white"
        stroke="gray"
      ></polygon>
      <text x="51.96" y="60" fontFamily="Arial" fontSize="25">
        {props.letter}
      </text>
    </svg>
  );
}

export default Cell;

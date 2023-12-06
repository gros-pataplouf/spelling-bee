import { useEffect } from "react";
import { BaseSyntheticEvent } from "react";
import Cell from "./Cell";
import { GameProps } from "../types/types";

function Game({ props }: GameProps) {
  const { stateOfGame, setStateOfGame } = props;

  useEffect(() => {
    setStateOfGame({
      ...stateOfGame,
      message: { category: null, content: null },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateOfGame.input, stateOfGame.points]);
  function handleChange(e: BaseSyntheticEvent) {
    const inputEvent = e.nativeEvent as InputEvent;
    if (
      inputEvent.data &&
      stateOfGame.letters
        .join("")
        .toLowerCase()
        .includes(inputEvent.data.toLowerCase())
    ) {
      setStateOfGame({
        ...stateOfGame,
        input: [...stateOfGame.input, inputEvent.data.toUpperCase()],
      });
    } else if (inputEvent.inputType === "deleteContentBackward") {
      setStateOfGame({
        ...stateOfGame,
        input: stateOfGame.input.slice(0, stateOfGame.input.length - 1),
      });
    }
  }
  function deleteLetter() {
    if (stateOfGame.input.length) {
      setStateOfGame({
        ...stateOfGame,
        input: stateOfGame.input.slice(0, stateOfGame.input.length - 1),
      });
    }
  }
  function shuffle() {
    const otherLettersOld = stateOfGame.letters.slice(1, 7);
    const otherLettersNew: string[] = [];
    while (otherLettersOld.length) {
      const [removedLetter] = otherLettersOld.splice(
        Math.floor(Math.random() * otherLettersOld.length),
        1,
      );
      otherLettersNew.push(removedLetter);
    }
    setStateOfGame({
      ...stateOfGame,
      letters: [stateOfGame.letters[0], ...otherLettersNew],
    });
  }

  function submitWord() {
    if (stateOfGame.input.join("").length < 4) {
      setStateOfGame({
        ...stateOfGame,
        message: { category: "warning", content: "too short" },
      });
      return;
    } else if (!stateOfGame.input.join("").includes(stateOfGame.letters[0])) {
      setStateOfGame({
        ...stateOfGame,
        message: { category: "warning", content: "middleletter missing" },
      });
    } else {
      setStateOfGame({...stateOfGame, guess: stateOfGame.input.join("")})
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.code == "Enter") {
      submitWord();
    }
  }

  function changePlayerName(event: React.BaseSyntheticEvent) {
    setStateOfGame({ ...stateOfGame, playerName: event.target.value });
  }

  return (
    <div className="flex flex-col items-center">
      {stateOfGame.success.points && (
        <p>
          <span id="successMessage">{stateOfGame.success.success}</span>{" "}
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
        value={stateOfGame.input && stateOfGame.input.join("")}
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
            value={stateOfGame.playerName}
            onChange={changePlayerName}
          />
          <p>
            <span id="points">{stateOfGame.points}</span> points
          </p>
          {stateOfGame.guessedWords.length && (
            <ul id="words">
              {stateOfGame.guessedWords.map((word) => {
                return <li key={word}>{word}</li>;
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Game;

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { BaseSyntheticEvent } from "react";
import Cell from "./Cell";
import { QueryDict, GameProps } from '../types/types';

function Game({props} : GameProps ) {
  const {stateOfGame, setStateOfGame} = props;
  const socket = new WebSocket("ws://localhost:5000");
  const location = useLocation();


  socket.onmessage = (message) => {
    const parsedData = JSON.parse(message.data);
    if (parsedData.letters) {
      setStateOfGame({...stateOfGame, letters: Array.from(parsedData.letters)});
    }
    if (parsedData.warning) {
      setStateOfGame({...stateOfGame, message: { category: parsedData.warning, content: parsedData.warning }});
    }
    if (parsedData.points) {
      setStateOfGame({...stateOfGame, points: stateOfGame.points + parsedData["points"]})
    }
    if (parsedData.words) {
      setStateOfGame({...stateOfGame, guessedWords: [...stateOfGame.guessedWords, ...parsedData.words]});
    }
    if (parsedData.success) {
      setStateOfGame({...stateOfGame, success: {success: parsedData.success, points: parsedData.points}})
      setTimeout(() => setStateOfGame({...stateOfGame, success: {success: null, points: null}}), 2000);
    }
  };
  useEffect(() => {
    setStateOfGame({...stateOfGame, message: {category: null, content: null}});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateOfGame.input]);
  function handleChange(e: BaseSyntheticEvent) {
    const inputEvent = e.nativeEvent as InputEvent;
    if (
      inputEvent.data &&
      stateOfGame.letters.join("").toLowerCase().includes(inputEvent.data.toLowerCase())
    ) {
      setStateOfGame({...stateOfGame, input: [...stateOfGame.input, inputEvent.data.toUpperCase()]})
    } else if (inputEvent.inputType === "deleteContentBackward") {
      setStateOfGame({...stateOfGame, input: stateOfGame.input.slice(0, stateOfGame.input.length -1)})
    }
  }
  function deleteLetter() {
    if (stateOfGame.input.length) {
      setStateOfGame({...stateOfGame, input: stateOfGame.input.slice(0, stateOfGame.input.length - 1)});
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
    setStateOfGame({...stateOfGame, letters: [stateOfGame.letters[0], ...otherLettersNew]});
  }

  function parseQueryParams(queryString: string): QueryDict {
    const parsedStringArray = queryString
      .slice(1, queryString.length)
      .split("&");
    const parsedDictArray = parsedStringArray.map((elt) => {
      const key = elt.split("=")[0];
      const value = elt.split("=")[1];
      return { [key]: value };
    });
    const queryDict:QueryDict = {
      game: null,
      player1: null, 
      player2: null
    };
    for (const item of parsedDictArray) {
      const key = Object.keys(item)[0]
      const value = Object.values(item)[0] 
      if (key == "game") {
        queryDict[key] = value
      }
      if (key == "player1") {
        queryDict[key] = value
      }
      if (key == "player2") {
        queryDict[key] = value
      }
    }
    return queryDict;
  }

  function submitWord() {
    if (stateOfGame.input.join("").length < 4) {
      setStateOfGame({...stateOfGame, message: { category: "warning", content: "too short" }})
      return;
    } else if (!stateOfGame.input.join("").includes(stateOfGame.letters[0])) {
      setStateOfGame({...stateOfGame, message: { category: "warning", content: "middleletter missing"}})
    }
    const solution = JSON.stringify({
      type: "submission",
      content: stateOfGame.input.join(""),
    });
    socket.send(solution);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.code == "Enter") {
      submitWord();
    }
  }

  return (
    <div>
      {stateOfGame.success.points && (
        <p>
          <span id="successMessage">{stateOfGame.success.success}</span>{" "}
          <span id="successPoints">+{stateOfGame.success.points}</span>
        </p>
      )}
      <input
        id="input"
        role="input"
        placeholder="Type or click"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={stateOfGame.input && stateOfGame.input.join("")}
      />
      <p id="message">{stateOfGame.message.content}</p>
      <div id="hive">
        {stateOfGame.letters.map((letter:string) => (
          <Cell
            letter={letter}
            middleLetter={letter === stateOfGame.letters[0]}
            key={letter}
            stateOfGame={stateOfGame}
            setStateOfGame={setStateOfGame}
          />
        ))}
      </div>
      <button id="delete" onClick={deleteLetter}>
        Delete
      </button>
      <button id="shuffle" onClick={shuffle}>
        Shuffle
      </button>
      <button id="enter" onClick={submitWord}>
        Enter
      </button>
      <div>
        <p>{parseQueryParams(location.search).player1}</p>
        <p>
          <span id="points">{stateOfGame.points}</span> points
        </p>
      </div>
      {stateOfGame.guessedWords.length && (
        <ul id="words">
          {stateOfGame.guessedWords.map((word) => {
            return <li key={word}>{word}</li>;
          })}
        </ul>
      )}
    </div>
  );
}

export default Game;

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { BaseSyntheticEvent } from "react";
import Cell from "./Cell";
import { ServerMessage, SuccessMessage, QueryDict } from "../types/types";

function Game() {
  const socket = new WebSocket("ws://localhost:5000");

  const [letters, setLetters] = useState(Array.from("ILOQUST"));
  const [points, setPoints] = useState(0);
  const [words, setWords] = useState([]);
  const initialSuccessMessage: SuccessMessage = { success: null, points: null };
  const [success, setSuccess] = useState(initialSuccessMessage);
  const [input, setInput] = useState([""]);
  const initialServerMessage: ServerMessage = { category: null, content: "" };
  const [message, setMessage] = useState(initialServerMessage);
  
  const location = useLocation();


  socket.onmessage = (message) => {
    const parsedData = JSON.parse(message.data);
    if (parsedData.letters) {
      setLetters(Array.from(parsedData.letters));
    }
    if (parsedData.warning) {
      setMessage({ category: parsedData.warning, content: parsedData.warning });
    }
    if (parsedData.points) {
      setPoints(points + parsedData.points);
    }
    if (parsedData.words) {
      setWords(parsedData.words);
    }
    if (parsedData.success) {
      setSuccess({ success: parsedData.success, points: parsedData.points });
      setTimeout(() => setSuccess(initialSuccessMessage), 2000);
    }
  };
  useEffect(() => {
    setMessage(initialServerMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);
  function handleChange(e: BaseSyntheticEvent) {
    const inputEvent = e.nativeEvent as InputEvent;
    if (
      inputEvent.data &&
      letters.join("").toLowerCase().includes(inputEvent.data.toLowerCase())
    ) {
      setInput([...input, inputEvent.data.toUpperCase()]);
    } else if (inputEvent.inputType === "deleteContentBackward") {
      setInput(input.slice(0, input.length - 1));
    }
  }
  function deleteLetter() {
    if (input.length) {
      setInput(input.slice(0, input.length - 1));
    }
  }
  function shuffle() {
    const otherLettersOld = letters.slice(1, 7);
    const otherLettersNew: string[] = [];
    while (otherLettersOld.length) {
      const [removedLetter] = otherLettersOld.splice(
        Math.floor(Math.random() * otherLettersOld.length),
        1,
      );
      otherLettersNew.push(removedLetter);
    }
    setLetters([letters[0], ...otherLettersNew]);
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
    if (input.join("").length < 4) {
      setMessage({ category: "warning", content: "too short" });
      return;
    } else if (!input.join("").includes(letters[0])) {
      setMessage({ category: "warning", content: "middleletter missing" });
    }
    const solution = JSON.stringify({
      type: "submission",
      content: input.join(""),
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
      {success.points && (
        <p>
          <span id="successMessage">{success.success}</span>{" "}
          <span id="successPoints">+{success.points}</span>
        </p>
      )}
      <input
        id="input"
        role="input"
        placeholder="Type or click"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={input.join("")}
      />
      <p id="message">{message.content}</p>
      <div id="hive">
        {letters.map((letter) => (
          <Cell
            letter={letter}
            middleLetter={letter === letters[0]}
            key={letter}
            input={input}
            setInput={setInput}
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
          <span id="points">{points}</span> points
        </p>
      </div>
      {words && (
        <ul id="words">
          {words.map((word) => {
            return <li key={word}>{word}</li>;
          })}
        </ul>
      )}
    </div>
  );
}

export default Game;

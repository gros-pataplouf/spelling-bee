import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GameState, PhaseOfGame } from "./types/types";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorage } from "usehooks-ts";
import Game from "./components/Game";

function App() {
  const initialStateOfGame: GameState = {
    gameId: null,
    gameTimeStamp: null,
    phaseOfGame: PhaseOfGame.welcome,
    letters: Array.from("ILOQUST"),
    playerId: null,
    playerName: "Player 1",
    guessedWords: [],
    points: 0,
    input: [],
    message: { category: null, content: null },
    success: { success: null, points: null },
    multiPlayer: false,
    player2Id: null,
    player2Name: null,
    player2GuessedWords: null,
    player2Points: null,
  };
  const [stateOfGame, setStateOfGame] = useState(initialStateOfGame);
  const location = useLocation();
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5000");
    socket.onopen = () => socket.send(JSON.stringify(stateOfGame))
    
    return () => socket.close()

  }, [stateOfGame])
  const [localStorage, setLocalStorage] = useLocalStorage("spellingBee", {
    gameId: "",
    playerId: "",
    timeStamp: 0,
  });
  const navigate = useNavigate();
  function getQueryParam(
    locationSearch: string,
    keyWord: string,
  ): string | null {
    const cleanedLocationSearch = locationSearch
      .replace("/", "")
      .replace("?", "");
    const parsedStringArray = cleanedLocationSearch.split("&");
    const parsedDictArray = parsedStringArray.map((elt) => {
      const key = elt.split("=")[0];
      const value = elt.split("=")[1];
      return { [key]: value };
    });
    const queryDict: { [index: string]: string | null } = { [keyWord]: null };
    for (const item of parsedDictArray) {
      const key = Object.keys(item)[0];
      const value = Object.values(item)[0];
      if (key === keyWord) {
        queryDict[keyWord] = value;
      }
    }
    return queryDict[keyWord];
  }

  function isValidUuid(uuid: string): boolean {
    const uuidRegex =
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
    return uuidRegex.test(uuid);
  }

  function showGame() {
    let gameId: string;
    let playerId: string;
    let timeStamp: number;

    const gameQueryParam = getQueryParam(location.search, "game");
    // if there is a search string with game id, look into local storage
    //// if it exists in local storage, check the timestamp
    ////// if timestamp less than 24h, use data from local storage and send to server
    ////// else timestamp 24h or older, create fresh gameid and playerid
    //// elsif requested game uuid not in local storage, it means a new player has joined the game => set requested uuid as gameid, create playerid, send request to server to join game
    // elsif there is no searchstring for game id, retrieve it from local storage
    //// if > 24h : reset timestamp, gameid, playerid
    //// elseif < 24h: use gameid, and playerid to communicate with server

    if (gameQueryParam && isValidUuid(gameQueryParam)) {
      if (localStorage.gameId === gameQueryParam) {
        console.log("gameId from localStrorage matches queryParam")
        if (localStorage.timeStamp + 24 * 60 * 60 * 1000 > Date.now()) {
          console.log("timestamp is less than one day")
          gameId = localStorage.gameId;
          playerId = localStorage.playerId;
          timeStamp = localStorage.timeStamp;
        } else {
          console.log("timestamp is too old")
          gameId = uuidv4();
          playerId = uuidv4();
          timeStamp = Date.now();
        }
      } else {
        console.log("the valid uuid does not match gameId from local storage ", gameQueryParam)
        gameId = gameQueryParam;
        playerId = uuidv4();
        timeStamp = Date.now();
      }
    } else {
      console.log("there is no query param or it is not a valid uuid")
      if (
        localStorage.gameId &&
        localStorage.playerId &&
        localStorage.timeStamp + 24 * 60 * 60 * 1000 > Date.now()
      ) {
        gameId = localStorage.gameId;
        playerId = localStorage.playerId;
        timeStamp = localStorage.timeStamp;
      } else {
        console.log("but there is still a valid entry in local storage")

        gameId = uuidv4();
        playerId = uuidv4();
        timeStamp = Date.now();
      }
    }
    navigate(`?game=${gameId}`);
    setStateOfGame({
      ...stateOfGame,
      phaseOfGame: PhaseOfGame.playing,
      gameId: gameId,
      playerId: playerId,
      gameTimeStamp: timeStamp,
    });
    setLocalStorage({
      gameId: gameId,
      playerId: playerId,
      timeStamp: timeStamp,
    });
  
  }
  return (
    <div className="bg-yellow-200 h-screen flex flex-col justify-center items-center">
      <h1 className="font-semibold text-center pb-6">Spelling Bee</h1>
      {stateOfGame.phaseOfGame === PhaseOfGame.welcome ? (
        <>
          <p>How many words can you make with 7 letters?</p>
          <button
            className="btn btn-rounded text-white font-bold bg-black"
            onClick={showGame}
          >
            Play
          </button>
        </>
      ) : (
        <Game props={{ stateOfGame, setStateOfGame }} />
      )}
    </div>
  );
}

export default App;

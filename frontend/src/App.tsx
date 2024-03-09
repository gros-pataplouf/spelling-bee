import { useEffect, useState, useRef } from 'react'
import type React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PhaseOfGame, type GameState } from './types/types'
import { v4 as uuidv4 } from 'uuid'
import { useLocalStorage } from 'usehooks-ts'
import { isValidUuid } from './helpers/helpers'
import Game from './components/Game'

function App (): React.JSX.Element {
  const connection = useRef<WebSocket | null>(null)
  const initialStateOfGame: GameState = {
    gameId: null,
    gameTimeStamp: null,
    phaseOfGame: PhaseOfGame.welcome,
    letters: Array.from('ILOQUST'),
    player1Id: null,
    player1Name: 'Player 1',
    player1GuessedWords: [],
    player1Points: 0,
    input: [],
    message: { category: null, content: null },
    success: { success: null, points: null },
    multiPlayer: false,
    player2Id: null,
    player2Name: null,
    player2GuessedWords: null,
    player2Points: null
  }
  const [stateOfGame, setStateOfGame] = useState(initialStateOfGame)
  const location = useLocation()
  useEffect(() => {
    if (stateOfGame?.gameId !== null) {
      let socket
      if (import.meta.env.REACT_ENV === 'test') {
        socket = new WebSocket('ws://localhost:8000')
      } else {
        socket = new WebSocket(`ws://localhost:8000/${stateOfGame.gameId}`)
      }
      socket.onopen = () => {
        if (connection.current !== null) {
          connection.current.send(JSON.stringify(stateOfGame))
        }
      }
      socket.onmessage = (message) => {
        if (connection.current !== null) {
          const newState: GameState = { ...stateOfGame, ...JSON.parse(message.data as string) }
          console.log(newState)
          setStateOfGame(newState)
        }
      }
      connection.current = socket
      return () => {
        if (connection.current !== null) {
          connection.current.close()
        }
      }
    }
  }, [stateOfGame.gameId, stateOfGame.guess, stateOfGame.player1Name])
  const [localStorage, setLocalStorage] = useLocalStorage('spellingBee', {
    gameId: '',
    player1Id: '',
    timeStamp: 0
  })
  const navigate = useNavigate()

  function showGame (): void {
    let gameId: string
    let player1Id: string
    let timeStamp: number

    const gamePath = location.pathname.slice(1)
    console.log(gamePath)

    // if there is a search string with game id, look into local storage
    /// / if it exists in local storage, check the timestamp
    /// /// if timestamp less than 24h, use data from local storage and send to server
    /// /// else timestamp 24h or older, create fresh gameid and player1id
    /// / elsif requested game uuid not in local storage, it means a new player has joined the game => set requested uuid as gameid, create player1id, send request to server to join game
    // elsif there is no searchstring for game id, retrieve it from local storage
    /// / if > 24h : reset timestamp, gameid, player1id
    /// / elseif < 24h: use gameid, and player1id to communicate with server

    if (gamePath !== null && isValidUuid(gamePath)) {
      if (localStorage.gameId === gamePath) {
        console.log('gameId from localStrorage matches queryParam')
        if (localStorage.timeStamp + 24 * 60 * 60 * 1000 > Date.now()) {
          console.log('timestamp is less than one day')
          gameId = localStorage.gameId
          player1Id = localStorage.player1Id
          timeStamp = localStorage.timeStamp
        } else {
          console.log('timestamp is too old')
          gameId = uuidv4()
          player1Id = uuidv4()
          timeStamp = Date.now()
        }
      } else {
        console.log(
          'the valid uuid does not match gameId from local storage ',
          gamePath
        )
        gameId = gamePath
        player1Id = uuidv4()
        timeStamp = Date.now()
      }
    } else {
      console.log('there is no query param or it is not a valid uuid')
      if (
        localStorage.gameId !== '' &&
        localStorage.player1Id !== '' &&
        localStorage.timeStamp + 24 * 60 * 60 * 1000 > Date.now()
      ) {
        gameId = localStorage.gameId
        player1Id = localStorage.player1Id
        timeStamp = localStorage.timeStamp
      } else {
        console.log('but there is still a valid entry in local storage')

        gameId = uuidv4()
        player1Id = uuidv4()
        timeStamp = Date.now()
      }
    }
    navigate(`/${gameId}`)
    setStateOfGame({
      ...stateOfGame,
      phaseOfGame: PhaseOfGame.playing,
      gameId,
      player1Id,
      gameTimeStamp: timeStamp
    })
    setLocalStorage({
      gameId,
      player1Id,
      timeStamp
    })
  }
  return (
    <div className="bg-yellow-200 h-screen flex flex-col justify-center items-center">
      <h1 className="font-semibold text-center pb-6">Spelling Bee</h1>
      {stateOfGame.phaseOfGame === PhaseOfGame.welcome
        ? (
        <>
          <p>How many words can you make with 7 letters?</p>
          <button
            className="btn btn-rounded text-white font-bold bg-black"
            onClick={showGame}
          >
            Play
          </button>
        </>
          )
        : (
        <Game props={{ stateOfGame, setStateOfGame }} />
          )}
    </div>
  )
}

export default App

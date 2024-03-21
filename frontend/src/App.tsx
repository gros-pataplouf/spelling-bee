/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import { useEffect, useRef, type MouseEventHandler } from 'react'
import { useImmer } from 'use-immer'
import type React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PhaseOfGame, type GameState } from './types/types'
import { v4 as uuidv4 } from 'uuid'
import { useLocalStorage } from 'usehooks-ts'
import { isValidUuid } from './helpers/helpers'
import Game from './components/Game'
import Welcome from './components/Welcome'
import Join from './components/Join'
import Invite from './components/Invite'
const BASE_URL: string =
import.meta.env.VITE_REACT_ENV === 'production'
  ? import.meta.env.VITE_PRODUCTION_URL
  : 'ws://localhost:8000'

function App (): React.JSX.Element {
  const connection = useRef<WebSocket | null>(null)
  const initialStateOfGame: GameState = {
    gameId: null,
    gameTimeStamp: null,
    phaseOfGame: PhaseOfGame.welcome,
    letters: import.meta.env.VITE_REACT_ENV === 'test' ? Array.from('ILOQUST') : Array.from('???????'),
    player1Id: null,
    player1Name: null,
    player1GuessedWords: [],
    player1Points: 0,
    input: [],
    message: { category: null, content: null, points: null },
    multiPlayer: false,
    player2Id: null,
    player2Name: null,
    player2GuessedWords: null,
    player2Points: null
  }
  const [stateOfGame, setStateOfGame] = useImmer(initialStateOfGame)
  const location = useLocation()
  useEffect(() => {
    console.log(isValidUuid(location.pathname.slice(1)))
    console.log(location.pathname.slice(1))
    console.log(localStorage.gameId)
    let socket: WebSocket | null = null
    let gameId: string
    let player1Id: string | null
    if (stateOfGame?.gameId !== null) {
      if (import.meta.env.VITE_REACT_ENV === 'test') {
        socket = new WebSocket(BASE_URL)
      } else {
        socket = new WebSocket(`${BASE_URL}/${stateOfGame.gameId}?${stateOfGame.player1Id}`)
      }
    } else if (isValidUuid(location.pathname.slice(1))) {
      gameId = location.pathname.slice(1)
      player1Id = localStorage.player1Id
      socket = new WebSocket(`${BASE_URL}/query`)
    }

    if (socket != null) {
      console.log(socket.url)
      socket.onopen = () => {
        if (connection.current !== null) {
          if (stateOfGame.gameId !== null) {
            console.log('sending message', stateOfGame)
            connection.current.send(JSON.stringify(stateOfGame))
          } else {
            console.log('connecting')
            connection.current.send(JSON.stringify({ gameId, player1Id }))
          }
        }
      }
      socket.onmessage = (message) => {
        if (connection.current != null) {
          const incoming = JSON.parse(message.data as string)
          setStateOfGame((draft) => { return { ...draft, ...incoming } })
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
    player1Id: ''
  })
  const navigate = useNavigate()
  function startGame (mode: string): MouseEventHandler<HTMLButtonElement> {
    function innerFunction (): void {
      let gameId: string = ''
      let player1Id: string = ''
      const gamePath = location.pathname.slice(1)
      // if there is a search string with game id, look into local storage
      /// if it exists in local storage, use data from local storage and send to server
      /// if invalid or not existant else create a player id
      if (gamePath !== null && isValidUuid(gamePath)) {
        gameId = gamePath
      } else {
        gameId = uuidv4()
      }
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      player1Id = (isValidUuid(localStorage.player1Id) && localStorage.player1Id) || uuidv4()
      navigate(`/${gameId}`)
      setStateOfGame((draft) => {
        return {
          ...draft,
          phaseOfGame: mode === 'multiplayer' ? PhaseOfGame.inviting : PhaseOfGame.playing,
          gameId,
          player1Id,
          multiPlayer: mode === 'multiplayer'
        }
      })
      setLocalStorage({
        gameId,
        player1Id
      })
    }
    return innerFunction
  }

  return (
    <div className="bg-yellow-400 h-screen flex flex-col justify-center items-cente">
      <h1 className="font-semibold text-center pb-6 dark:text-black text-4xl">Spelling Bee</h1>
      {stateOfGame.phaseOfGame === PhaseOfGame.welcome && < Welcome startGame={startGame}/>}
      {(stateOfGame.phaseOfGame === PhaseOfGame.inviting || stateOfGame.phaseOfGame === PhaseOfGame.waiting) && < Invite startGame={startGame} stateOfGame={stateOfGame} setStateOfGame={setStateOfGame} />}
      {stateOfGame.phaseOfGame === PhaseOfGame.joining && <Join startGame={startGame} stateOfGame={stateOfGame} setStateOfGame={setStateOfGame} />}
      {stateOfGame.phaseOfGame === PhaseOfGame.playing && <Game props={{ stateOfGame, setStateOfGame }}/>}

    </div>
  )
}

export default App

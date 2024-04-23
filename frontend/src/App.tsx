import type React from 'react'
import { useEffect, useRef, type MouseEventHandler } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useImmer } from 'use-immer'
import { useLocalStorage } from 'usehooks-ts'
import { v4 as uuidv4 } from 'uuid'
import End from './components/End'
import Error from './components/Error'
import Game from './components/Game'
import Invite from './components/Invite'
import Join from './components/Join'
import Welcome from './components/Welcome'
import { isValidUuid } from './helpers/helpers'
import { PhaseOfGame, type GameState } from './types/types'
import { BASE_URL, INITIAL_LETTERS } from './helpers/constants'

export const initialStateOfGame: GameState = {
  gameId: null,
  secondsLeft: null,
  phaseOfGame: PhaseOfGame.welcome,
  letters: INITIAL_LETTERS,
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

function App (): React.JSX.Element {
  const connection = useRef<WebSocket | null>(null)
  const [stateOfGame, setStateOfGame] = useImmer(initialStateOfGame)
  const location = useLocation()
  useEffect(() => {
    let socket: WebSocket | null = null
    let gameId: string
    let player1Id: string | null
    if (stateOfGame?.gameId !== null) {
      if (import.meta.env.VITE_REACT_ENV === 'test') {
        socket = new WebSocket(BASE_URL)
      } else {
        socket = new WebSocket(`${BASE_URL}/${stateOfGame.gameId}?${stateOfGame.player1Id}`)
      }
    } else if (location.pathname.slice(1) !== '') {
      gameId = location.pathname.slice(1)
      player1Id = localStorageReact.player1Id
      socket = new WebSocket(`${BASE_URL}/query`)
    }

    if (socket != null) {
      socket.onopen = () => {
        setStateOfGame((draft) => { return { ...draft, loading: true } })
        if (connection.current !== null) {
          if (stateOfGame.gameId !== null) {
            connection.current.send(JSON.stringify(stateOfGame))
          } else {
            connection.current.send(JSON.stringify({ gameId, player1Id }))
          }
        }
      }
      socket.onmessage = (message) => {
        if (connection.current != null) {
          setStateOfGame((draft) => { return { ...draft, loading: false } })
          const incoming = JSON.parse(message.data as string)
          const allLetters = Array.from(document.querySelectorAll('text')).map(elt => elt.textContent) as string[]
          // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
          if (allLetters.length > 0 && incoming.letters?.length > 0 && [...incoming.letters].sort().join('') === [...allLetters].sort().join('')) {
            delete incoming.letters // prevent overwriting order of shuffeled letters
          }
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
  }, [stateOfGame.gameId, stateOfGame.guess, stateOfGame.player1Name, stateOfGame.phaseOfGame])
  const [localStorageReact, setLocalStorageReact] = useLocalStorage('spellingBee', {
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
      player1Id = (isValidUuid(localStorageReact.player1Id) && localStorageReact.player1Id) || uuidv4()
      navigate(`/${gameId}`)
      const multiPlayerMode: boolean = stateOfGame.multiPlayer || mode === 'inviting'
      setStateOfGame((draft) => {
        return {
          ...draft,
          phaseOfGame: mode,
          gameId,
          player1Id,
          multiPlayer: multiPlayerMode
        }
      })
      localStorage.clear()
      setLocalStorageReact({
        gameId,
        player1Id
      })
    }
    return innerFunction
  }

  return (

    <div className="bg-yellow-400 h-screen flex flex-col justify-center items-cente">
      <h1 className="font-semibold text-center pb-6 dark:text-black text-4xl">Spelling Bee</h1>
      {stateOfGame.phaseOfGame === PhaseOfGame.error && < Error stateOfGame={stateOfGame} setStateOfGame={setStateOfGame}/>}
      {stateOfGame.phaseOfGame === PhaseOfGame.discarded && < End stateOfGame={stateOfGame} setStateOfGame={setStateOfGame}/>}
      {stateOfGame.phaseOfGame === PhaseOfGame.ended && < End stateOfGame={stateOfGame} setStateOfGame={setStateOfGame}/>}
      {stateOfGame.phaseOfGame === PhaseOfGame.welcome && < Welcome startGame={startGame} stateOfGame={stateOfGame}/>}
      {(stateOfGame.phaseOfGame === PhaseOfGame.inviting || stateOfGame.phaseOfGame === PhaseOfGame.waiting) && < Invite startGame={startGame} stateOfGame={stateOfGame} setStateOfGame={setStateOfGame} />}
      {stateOfGame.phaseOfGame === PhaseOfGame.joining && <Join startGame={startGame} stateOfGame={stateOfGame} setStateOfGame={setStateOfGame} />}
      {stateOfGame.phaseOfGame === PhaseOfGame.playing && <Game stateOfGame={stateOfGame} setStateOfGame={setStateOfGame}/>}
    </div>
  )
}

export default App

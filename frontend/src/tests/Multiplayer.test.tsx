import { describe, test, expect, beforeEach } from 'vitest'
import {
  render,
  getByText
} from '@testing-library/react'
import { Server, WebSocket } from 'mock-socket'
import { type GameState } from '../types/types'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

global.WebSocket = WebSocket
const websocketServer = new Server('ws://localhost:8000')
let clientMessages: GameState[] = []
websocketServer.on('connection', (socket) => {
  socket.on('message', (message) => {
    const parsedData: GameState = JSON.parse(JSON.stringify(message))
    clientMessages.push(parsedData)
  })
})

describe('<Game/>', () => {
  beforeEach(() => {
    clientMessages = []
  })
  test('User can initiate multiplayer game', () => {
    const app = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = app.container.querySelector('button') as HTMLElement

    expect(getByText(button, 'Play alone')).toBeInTheDocument()
  })
})

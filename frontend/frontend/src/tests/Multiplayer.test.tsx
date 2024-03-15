import { describe, test, expect, beforeEach } from 'vitest'
import {
  render,
  fireEvent,
  screen,
  waitFor
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
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    expect(screen.getByText('Invite a friend')).toBeInTheDocument()
  })
  test('User gets instructions to invite a friend', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    fireEvent(
      screen.getByText('Invite a friend'),
      new MouseEvent('click', {
        bubbles: true
      })
    )
    await waitFor(() => { expect(screen.getByText('Send this link to your friend')).toBeInTheDocument() })
  })
})

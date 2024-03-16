import { describe, test, expect, beforeEach } from 'vitest'
import { render, fireEvent, waitFor, getByText, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  test('the frontend renders letters from the websocket servers into the polygons', async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = game.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play alone'),
      new MouseEvent('click', {
        bubbles: true
      })
    )
    websocketServer.emit('message', JSON.stringify({ letters: Array.from('ABCDEFG') }))
    await waitFor(() => { expect(game.container.querySelector('text')?.textContent).toBe('A') }
    )
    const letterArrayBefore = Array.from(
      game.container.querySelectorAll('#hive>svg>text')
    ).map((node) => node.textContent)
    expect(letterArrayBefore.join('')).toBe('ABCDEFG')
  })

  test('Frontend displays warning messages from the backend', async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = game.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play alone'),
      new MouseEvent('click', {
        bubbles: true
      })
    )

    websocketServer.emit('message', JSON.stringify({ message: { category: 'warning', content: 'not a word', points: null } }))
    await waitFor(async () => {
      expect(game.container.querySelector('#notificationMessage')).toHaveTextContent(
        'not a word'
      )
    })
  })

  test('Messages from the backend disappear after a short lapse of time', async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = game.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play alone'),
      new MouseEvent('click', {
        bubbles: true
      })
    )

    websocketServer.emit('message', JSON.stringify({ message: { category: 'warning', content: 'not a word', points: null } }))

    await waitFor(async () => {
      expect(game.container.querySelector('#notificationMessage')).toBeEmptyDOMElement()
    })
    screen.debug()
  })

  test('Frontend displays points sent from the backend', async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = game.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play alone'),
      new MouseEvent('click', {
        bubbles: true
      })
    )
    websocketServer.emit('message', JSON.stringify({ player1Points: 3 }))
    await waitFor(async () => {
      expect(game.container.querySelector('#points')).toHaveTextContent(
        '3'
      )
    })
  })

  test('There is a list of already guessed words sent by the server', async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = game.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play alone'),
      new MouseEvent('click', {
        bubbles: true
      })
    )
    websocketServer.emit(
      'message',
      JSON.stringify({ player1GuessedWords: ['POCKET', 'POKE'] })
    )
    await waitFor(async () => {
      expect(game.container.querySelectorAll('#words>li').length).toBe(2)
    })
  })
  test('On reception of a point, the frontend displays a success message', async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = game.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play alone'),
      new MouseEvent('click', {
        bubbles: true
      })
    )
    websocketServer.emit(
      'message',
      JSON.stringify({ message: { points: 3, content: 'Excellent!', category: 'success' } })
    )
    await waitFor(async () => {
      expect(game.container.querySelector('#notificationMessage')).toHaveTextContent(
        'Excellent!'
      )
      expect(game.container.querySelector('#notificationPoints')).toHaveTextContent(
        '+3'
      )
    })
  })
  test('Backend server can reset input field', async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = game.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play alone'),
      new MouseEvent('click', {
        bubbles: true
      })
    )
    const enterButton = game.container.querySelector(
      'button#enter'
    )
    const inputForm = game.container.querySelector(
      'input#input'
    )
    if (enterButton === null || inputForm === null) {
      throw new Error('enter button or input form null')
    }
    await userEvent.click(inputForm)
    await userEvent.type(inputForm, 'SOLILOQUIST')
    websocketServer.emit(
      'message',
      JSON.stringify({ input: [] })
    )
    await waitFor(async () => {
      expect(screen.getByRole('input')).toHaveAttribute(
        'value',
        'SOLILOQUIST'
      )
      expect(screen.getByRole('input')).toHaveAttribute(
        'value',
        'SOLILOQUIST'
      )
    })
  })
})

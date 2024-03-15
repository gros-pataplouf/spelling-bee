import { describe, test, expect, beforeEach } from 'vitest'
import {
  render,
  fireEvent,
  waitFor,
  act,
  getByText
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Server, WebSocket } from 'mock-socket'
import { type GameState } from '../types/types'
import { BrowserRouter } from 'react-router-dom'

import App from '../App'
global.WebSocket = WebSocket
const websocketServer = new Server('ws://localhost:8000')
let clientMessages: GameState[] = []
websocketServer.on('connection', (socket) => {
  socket.on(
    'message',
    (message: string | Blob | ArrayBuffer | ArrayBufferView) => {
      if (typeof message === 'string') {
        const parsedData: GameState = JSON.parse(message)
        clientMessages.push(parsedData)
      }
    }
  )
})

describe('<Game/>', () => {
  beforeEach(() => {
    clientMessages = []
  })

  test('Pressing the enter button sends the >= 4 letter value of the input field to ws://localhost:8000', async () => {
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
    await userEvent.click(enterButton)
    await waitFor(async () => {
      expect(clientMessages.at(-1)?.guess).toBe('SOLILOQUIST')
    })
  })

  test('Pressing enter (not the button) also submits the  >= 4 to ws://localhost:5000', async () => {
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

    const inputForm = game.container.querySelector(
      'input#input'
    )
    if (inputForm === null) {
      throw new Error('input form is null')
    }
    await userEvent.click(inputForm)
    await userEvent.type(inputForm, 'SOLILOQUIST{enter}')
    await waitFor(async () => {
      expect(clientMessages.at(-1)?.guess).toBe('SOLILOQUIST')
    })
  })

  test('a < 4 letter input is not transmitted to ws://localhost:5000', async () => {
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
      throw new Error('enter button or input form is null')
    }
    await userEvent.click(inputForm)
    await userEvent.type(inputForm, 'SIT')
    await userEvent.click(enterButton)
    await waitFor(async () => {
      expect(clientMessages.at(-1)?.guess).not.toBeDefined()
    })
  })

  test('If the middleletter is missing, nothing is submitted to the server', async () => {
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
      throw new Error('enter button or input form is null')
    }
    await userEvent.click(inputForm)
    await act(async () => { await userEvent.type(inputForm, 'LOST') })
    await userEvent.click(enterButton)
    await waitFor(async () => {
      expect(clientMessages.at(-1)?.guess).toBeUndefined()
    })
  })
  test('Backend receives gameId from frontend', async () => {
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
    const uuidRegex =
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
    await waitFor(async () => {
      const gameId = clientMessages.at(-1)?.gameId
      if (gameId !== undefined && gameId !== null) {
        expect(uuidRegex.test(gameId)).toBe(true)
      } else {
        throw new Error('GameId is undefined')
      }
    })
  })
})

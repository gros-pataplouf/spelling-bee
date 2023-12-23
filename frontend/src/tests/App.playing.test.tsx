import { describe, test, expect, beforeEach } from 'vitest'
import {
  render,
  fireEvent,
  screen,
  waitFor,
  getByText
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Server, WebSocket } from 'mock-socket'
import { type GameState } from '../types/types'
import { BrowserRouter } from 'react-router-dom'

import App from '../App'
global.WebSocket = WebSocket
const websocketServer = new Server('ws://localhost:5000')
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
  test('After clicking on play button, 7 polygons are visible', () => {
    const app = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = app.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play'),
      new MouseEvent('click', {
        bubbles: true
      })
    )
    const polygons = app.container.querySelectorAll('#hive>svg>polygon')
    expect(polygons.length).toBe(7)
  })
  test('Each svg contains a text element', () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = game.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play'),
      new MouseEvent('click', {
        bubbles: true
      })
    )

    const textBoxes = game.container.querySelectorAll('#hive>svg>text')
    expect(textBoxes.length).toBe(7)
  })

  test('There is one svg with class middleLetter', () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = game.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play'),
      new MouseEvent('click', {
        bubbles: true
      })
    )
    const middleLetterSvg = game.container.querySelectorAll(
      '#hive>.middleLetter'
    )
    expect(middleLetterSvg.length).toBe(1)
  })

  test('If you click one letter / hive, the clicked letter appears in the input field', () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = game.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play'),
      new MouseEvent('click', {
        bubbles: true
      })
    )

    const randomLetter =
      game.container.querySelectorAll('#hive>svg>text')[
        Math.floor(Math.random() * 7)
      ]
    let inputField = game.container.querySelector('input')
    const valueBefore = inputField?.value ?? ''

    fireEvent(
      randomLetter,
      new MouseEvent('click', {
        bubbles: true
      })
    )
    inputField = game.container.querySelector('input')
    const valueAfter = randomLetter.textContent + valueBefore
    expect(inputField).toHaveAttribute('value', valueAfter)
  })

  test('If you press one letter, (key down), it appears in the input field if it is part of the letter set', async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = game.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play'),
      new MouseEvent('click', {
        bubbles: true
      })
    )
    await userEvent.click(screen.getByRole('input'))
    await userEvent.type(
      screen.getByRole('input'),
      'ABCSOLI'
    )
    expect(screen.getByRole('input')).toHaveAttribute(
      'value',
      'SOLI'
    )
  })

  test('Clicking the shuffle button will shuffle the letters, except for #middleLetter, which will stay the first Node', async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = game.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play'),
      new MouseEvent('click', {
        bubbles: true
      })
    )
    const shuffleButton = game.container.querySelector(
      '#shuffle'
    )
    if (shuffleButton === null) {
      throw new Error()
    }
    expect(shuffleButton).toBeInTheDocument()
    const letterArrayBefore = Array.from(
      game.container.querySelectorAll('#hive>svg>text')
    ).map((node) => node.textContent)
    await userEvent.click(shuffleButton)
    const letterArrayAfter = Array.from(
      game.container.querySelectorAll('#hive>svg>text')
    ).map((node) => node.textContent)
    expect(letterArrayBefore[0]).toEqual(letterArrayAfter[0])
    expect(letterArrayBefore.slice(1, 7)).not.toEqual(
      letterArrayAfter.slice(1, 7)
    )
  })

  test('Clicking the delete button clears one letter from the input form', async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = game.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play'),
      new MouseEvent('click', {
        bubbles: true
      })
    )

    const inputForm = game.container.querySelector(
      'input#input'
    )
    if (inputForm === null) {
      throw new Error('inputForm is null')
    }
    await userEvent.type(inputForm, 'SOIL')
    const deleteButton = game.container.querySelector(
      'button#delete'
    )
    if (deleteButton === null) {
      throw new Error('deleteButton is null')
    }

    await userEvent.click(deleteButton)
    expect(inputForm).toHaveAttribute('value', 'SOI')
  })

  test('a < 4 letter input generates a "too short" message"', async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = game.container.querySelector('button')
    if (button === null) {
      throw new Error('play button not present')
    }
    fireEvent(
      getByText(button, 'Play'),
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
    if (inputForm === null || enterButton === null) {
      throw new Error('inputform or enter button is null')
    }
    await userEvent.click(inputForm)
    await userEvent.type(inputForm, 'SIT')
    await userEvent.click(enterButton)
    expect(screen.getByText('too short')).toBeInTheDocument()
  })

  test('if the input field changes and there is no submission, the message is deleted', async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = game.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play'),
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
      throw new Error('enterButton or inputForm is null')
    }

    await userEvent.click(inputForm)
    await userEvent.type(inputForm, 'SIT')
    await userEvent.click(enterButton)
    await userEvent.type(inputForm, 'IO')
    expect(game.container.querySelector('input#input+p')).not.toHaveTextContent(
      'too short'
    )
  })

  test("The frontend displays an input form with value 'Player 1'", async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = game.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play'),
      new MouseEvent('click', {
        bubbles: true
      })
    )
    await waitFor(async () => {
      expect(game.container.querySelector('#playerName')).toHaveValue(
        'Player 1'
      )
    })
  })
  test('Player 1 can change their user name', async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = game.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play'),
      new MouseEvent('click', {
        bubbles: true
      })
    )
    const playerField = game.container.querySelector('input#playerName')
    if (playerField === null) {
      throw new Error('playerField not present')
    }
    await userEvent.click(
      playerField
    )
    await userEvent.type(
      playerField,
      '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}Pataplouf'
    )
    await waitFor(async () => {
      expect(game.container.querySelector('#playerName')).toHaveValue(
        'Pataplouf'
      )
    })
  })
})

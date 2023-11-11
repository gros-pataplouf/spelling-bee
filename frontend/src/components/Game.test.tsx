import { describe, test, expect, beforeEach } from 'vitest'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Server, WebSocket } from 'mock-socket';
import { ClientMessage } from '../types/types';
import Game from './Game'
global.WebSocket = WebSocket
const websocketServer = new Server('ws://localhost:5000');
let clientMessages: ClientMessage[] = []


describe('<Game/>', () => {
    beforeEach(() => {
        clientMessages = []
        websocketServer.on('connection', (socket) => {
            socket.on('message', (message) => {
                const parsedData: ClientMessage = JSON.parse(JSON.stringify(message));
                clientMessages.push(parsedData);
            }
            )
        })
    })
    test('Game component monts properly', () => {
        const game = render(<Game/>)
        expect(game).toBeTruthy()
    })
    test('After clicking on play button, 7 polygons are visible', () => {
        const game = render(<Game />)
        const polygons = game.container.querySelectorAll('#hive>svg>polygon')
        expect(polygons.length).toBe(7)
    })
    test('Each svg contains a text element', () => {
        const game = render(<Game />)
        const textBoxes = game.container.querySelectorAll('#hive>svg>text')
        expect(textBoxes.length).toBe(7)
    })
    test('The text elements are rendered with svg text attributes', () => {
        const game = render(<Game />)
        const textBoxes = game.container.querySelectorAll('#hive>svg>text')
        textBoxes.forEach(textBox => {
            expect(textBox).toHaveAttribute("x")
            expect(textBox).toHaveAttribute("y")
            expect(textBox).toHaveAttribute("font-family")
            expect(textBox).toHaveAttribute("font-size")
        })
    })


    test('There is one svg with class middleLetter', () => {
        const game = render(<Game />)
        const middleLetterSvg = game.container.querySelectorAll('#hive>.middleLetter')
        expect(middleLetterSvg.length).toBe(1)
    })

    test('If you click one letter / hive, the clicked letter appears in the input field', () => {
        const game = render(<Game />)
        const randomLetter = game.container.querySelectorAll('#hive>svg>text')[Math.floor(Math.random()*7)]
        let inputField = game.container.querySelector('input') as HTMLInputElement
        const valueBefore = inputField.value || ""
     
        fireEvent(
            randomLetter,
            new MouseEvent('click', {
              bubbles: true
            }),
            )
        inputField = game.container.querySelector('input') as HTMLInputElement
        const valueAfter = randomLetter.textContent + valueBefore
        expect(inputField).toHaveAttribute("value",  valueAfter)
    })

    test('If you press one letter, (key down), it appears in the input field if it is part of the letter set', async () => {
        const game = render(<Game/>)
        await userEvent.click(screen.getByRole("input") as HTMLInputElement)
        await userEvent.type(screen.getByRole("input") as HTMLInputElement, "ABCSOLI")
        expect(screen.getByRole("input") as HTMLInputElement).toHaveAttribute("value",  "SOLI")
    })

    test('There is a shuffle button', () => {
        const game = render(<Game/>)
        const shuffleButton = game.container.querySelector("#shuffle") as HTMLButtonElement
        expect(shuffleButton).toBeInTheDocument()
    })

    test('Clicking the shuffle button will shuffle the letters, except for #middleLetter, which will stay the first Node', async () => {
        const game = render(<Game/>)
        const shuffleButton = game.container.querySelector("#shuffle") as HTMLButtonElement
        expect(shuffleButton).toBeInTheDocument()
        const letterArrayBefore = Array.from(game.container.querySelectorAll('#hive>svg>text')).map(node => node.textContent)
        await userEvent.click(shuffleButton)
        const letterArrayAfter = Array.from(game.container.querySelectorAll('#hive>svg>text')).map(node => node.textContent)
        expect(letterArrayBefore[0]).toEqual(letterArrayAfter[0])
        expect(letterArrayBefore.slice(1,7)).not.toEqual(letterArrayAfter.slice(1,7))
    })

    test('There is a delete button', () => {
        const game = render(<Game/>)
        const shuffleButton = game.container.querySelector("button#delete") as HTMLButtonElement
        expect(shuffleButton).toBeInTheDocument()
    })

    test('Clicking the delete button clears one letter from the input form', async () => {
        const game = render(<Game/>)
        const inputForm = game.container.querySelector("input#input") as HTMLInputElement
        await userEvent.type(inputForm, "SOIL")
        const deleteButton = game.container.querySelector("button#delete") as HTMLButtonElement
        await userEvent.click(deleteButton)
        expect(inputForm).toHaveAttribute("value", "SOI")
    })


    test('Clicking the delete button clears one letter from the input form', async () => {
        const game = render(<Game/>)
        const inputForm = game.container.querySelector("input#input") as HTMLInputElement
        await userEvent.type(inputForm, "SOIL")
        const deleteButton = game.container.querySelector("button#delete") as HTMLButtonElement
        await userEvent.click(deleteButton)
        expect(inputForm).toHaveAttribute("value", "SOI")
    })

    test('There is an enter button', () => {
        const game = render(<Game/>)
        const enterButton = game.container.querySelector("button#enter") as HTMLButtonElement
        expect(enterButton).toBeTruthy()
    })

    test('Pressing the enter button sends the >= 4 letter value of the input field to ws://localhost:5000', async () => {
        const game = render(<Game/>)
        const enterButton = game.container.querySelector("button#enter") as HTMLButtonElement
        const inputForm = game.container.querySelector("input#input") as HTMLInputElement
        await userEvent.click(inputForm)
        await userEvent.type(inputForm, "SOLILOQUIST")
        await userEvent.click(enterButton)
        await new Promise((r) => setTimeout(r, 2000));
        return waitFor(async () => {
            await expect(JSON.parse(clientMessages.at(-1)).content).toBe(
              "SOLILOQUIST"
            );
          });

    })
    test('a < 4 letter input is not transmitted to ws://localhost:5000', async () => {
        const game = render(<Game/>)
        const enterButton = game.container.querySelector("button#enter") as HTMLButtonElement
        const inputForm = game.container.querySelector("input#input") as HTMLInputElement
        await userEvent.click(inputForm)
        await userEvent.type(inputForm, "SIT")
        await userEvent.click(enterButton)
        await new Promise((r) => setTimeout(r, 2000));
        return waitFor(async () => {
            await expect(clientMessages).toStrictEqual(
              []
            );
          });

    })
})
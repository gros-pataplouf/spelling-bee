import { describe, test, expect, it } from 'vitest'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Game from './Game'


describe('<Game/>', () => {
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


})

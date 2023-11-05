import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'

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
})

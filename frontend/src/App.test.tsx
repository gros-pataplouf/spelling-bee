
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fireEvent, getByText } from '@testing-library/react'

import App from './App'

describe('<App />', () => {
  test('App mounts properly', () => {
    const wrapper = render(<App />)
    expect(wrapper).toBeTruthy()
  })

  test('There is a h1 containing the title "Spelling Bee"', () => {
    const wrapper = render(<App />)
    const h1 = wrapper.container.querySelector('h1')
    expect(h1?.textContent).toBe('Spelling Bee')
  })

  test('Subtitle displayed correctly', () => {
    const wrapper = render(<App />)
    const text = screen.getByText("How many words can you make with 7 letters?");
    expect(text.textContent).toBeTruthy()
  })

  // Get by text using the React testing library
  test('Play button displayed', () => {
    const wrapper = render(<App />)
    const button = wrapper.container.querySelector('button')
    expect(button?.textContent).toBe('Play')
  })
  it('After clicking on play button, you get input field', () => {
    const wrapper = render(<App />)
    const button = wrapper.container.querySelector('button')
    fireEvent(
      getByText(button, 'Play'),
      new MouseEvent('click', {
        bubbles: true
      }),
      )
    const inputField = wrapper.container.querySelector('input#input')
    expect(inputField).toBeInTheDocument()
  })

  it('After clicking on play button, 7 polygons are visible', () => {
    const wrapper = render(<App />)
    const button = wrapper.container.querySelector('button')
    fireEvent(
      getByText(button, 'Play'),
      new MouseEvent('click', {
        bubbles: true
      }),
      )
    const polygons = wrapper.container.querySelectorAll('#hive>svg>polygon')
    expect(polygons.length).toBe(7)
  })

});

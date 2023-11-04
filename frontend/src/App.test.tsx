
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('<App />', () => {
  test('App mounts properly', () => {
    const wrapper = render(<App />)
    expect(wrapper).toBeTruthy()

    // Get by h1
    const h1 = wrapper.container.querySelector('h1')
    expect(h1?.textContent).toBe('Spelling Bee')

    // Get by text using the React testing library
    const text = screen.getByText(
      /How many words can you make with 7 letters?/i
    );
    expect(text.textContent).toBeTruthy()
  })
});

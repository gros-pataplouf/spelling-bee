import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, getByText } from '@testing-library/react'
import { WebSocket } from 'mock-socket'
import { BrowserRouter } from 'react-router-dom'
import * as router from 'react-router'

import App from '../App'

//
global.WebSocket = WebSocket

describe('<App />', () => {
  const navigate = vi.fn()

  beforeEach(() => {
    vi.spyOn(router, 'useNavigate').mockImplementation(() => navigate)
  })

  test('App mounts properly', () => {
    const wrapper = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    expect(wrapper).toBeTruthy()
  })

  test('There is a h1 containing the title "Spelling Bee"', () => {
    const wrapper = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const h1 = wrapper.container.querySelector('h1')
    expect(h1?.textContent).toBe('Spelling Bee')
  })

  test('Play button displayed', () => {
    const wrapper = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = wrapper.container.querySelector('button')
    expect(button?.textContent).toBe('Play')
  })
  test('After clicking on play button, you get input field', () => {
    const wrapper = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = wrapper.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play'),
      new MouseEvent('click', {
        bubbles: true
      })
    )
    const inputField = wrapper.container.querySelector('input#input')
    expect(inputField).toBeInTheDocument()
  })

  test('Clicking the play button modifies the url to contain ?game=uuid', async () => {
    const wrapper = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    const button = wrapper.container.querySelector('button') as HTMLElement
    fireEvent(
      getByText(button, 'Play'),
      new MouseEvent('click', {
        bubbles: true
      })
    )
    expect(navigate).toHaveBeenCalledWith(
      expect.stringMatching(
        /game=[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
      )
    )
  })
})

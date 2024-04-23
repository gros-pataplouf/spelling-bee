export const BASE_URL: string =
import.meta.env.VITE_REACT_ENV === 'production'
  ? import.meta.env.VITE_PRODUCTION_URL
  : 'ws://localhost:8000'

export const INITIAL_LETTERS: string[] = import.meta.env.VITE_REACT_ENV === 'test' ? Array.from('ILOQUST') : Array.from('???????')

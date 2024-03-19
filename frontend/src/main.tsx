import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import App from './App.tsx'

import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/:gameId/',
    element: <App />
  }
])

const root = document.getElementById('root') as Element
ReactDOM.createRoot(root).render(
      <RouterProvider router={router} />
)

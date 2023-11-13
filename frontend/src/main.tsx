import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

import App from './App.tsx'


import './index.css'


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,

  },
]);

const root:Element|null = document.getElementById("root")
if (root) {
  ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
}

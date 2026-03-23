/**
 * Application entry point.
 * Mounts the React app into the DOM and wraps it with StrictMode
 * for highlighting potential problems during development.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

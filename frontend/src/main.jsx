import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { IS_DEMO } from './utils/navigation'

// The static demo (mode "demo") is hosted on GitHub Pages, which has no
// server-side routing, so it uses hash URLs.
const Router = IS_DEMO ? HashRouter : BrowserRouter

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)

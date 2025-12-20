import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import App from './App.tsx'
import { TickerProvider } from './contexts/TickerContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TickerProvider>
      <App />
    </TickerProvider>
  </StrictMode>,
)

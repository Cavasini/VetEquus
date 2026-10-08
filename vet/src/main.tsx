import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { VetProvider } from './context/VetContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VetProvider>
      <App />
    </VetProvider>
  </StrictMode>,
)

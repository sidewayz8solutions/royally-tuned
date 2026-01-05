import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { ArtistProvider } from './contexts/ArtistContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ArtistProvider>
          <App />
          <Analytics />
        </ArtistProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'// Ensure correct path
import { AuthProvider } from './api.jsx'
import { BoxProvider } from './context/BoxContext.jsx'
import { BookingProvider } from './context/BookingContext.jsx'
import 'leaflet/dist/leaflet.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BoxProvider>
          <BookingProvider>
            <App />
          </BookingProvider>
        </BoxProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
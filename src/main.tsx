import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { Provider } from '@/components/ui/provider.tsx'
import './globals.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Forecast from './pages/forecast.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/forecast" element={<Forecast />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)

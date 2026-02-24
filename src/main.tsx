import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { Provider } from '@/components/ui/provider.tsx'
import './globals.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Alerts from './pages/alerts.tsx'
import { ProtectedRoute } from './routes/ProtectedRoute.tsx'
import NotFound from './pages/notFound.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CurrentWeather from './pages/currentWeather.tsx'

const queryClient = new QueryClient();
  
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<App />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/currentWeather" element={<CurrentWeather />} />
              <Route path="/alerts" element={<Alerts />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
)

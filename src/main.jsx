/**
 * 1. React ile uygulamayı root div'e bağlar.
 * 2. BrowserRouter ile sayfalar arası geçişi sağlar.
 * 3. index.css ile global stilleri yükler.
 * 4. StrictMode ile hata denetimini etkinleştirir.
 * 5. App bileşenini render ederek uygulamayı başlatır.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> 
      <App />
    </BrowserRouter>
  </StrictMode>,
)
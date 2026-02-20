/**
 * UYGULAMANIN GİRİŞ KAPISI (ENTRY POINT)
 * -------------------------------------------------------------------------
 * 1. BAŞLATICI: React kütüphanesini kullanarak uygulamayı tarayıcıdaki 'root' isimli div'e bağlar.
 * 2. NAVİGASYON DESTEĞİ: 'BrowserRouter' ile sarmalayarak tüm sitenin sayfalar arası geçiş özelliğini aktif eder.
 * 3. STİL TEMELİ: 'index.css' dosyasını buraya dahil ederek tüm uygulamanın görsel şablonunu (anayasa) yükler.
 * 4. GÜVENLİK (Strict Mode): Kodun daha sağlam olması için React'ın hata denetimi modunu çalıştırır.
 * 5. ANA YAPI: Hazırladığımız 'App.jsx' bileşenini render ederek sitenin yaşam döngüsünü başlatır.
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
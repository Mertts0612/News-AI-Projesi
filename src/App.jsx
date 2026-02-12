/**
 * UYGULAMA ANA YÖNLENDİRME (ROUTING) MERKEZİ
 * -------------------------------------------------------------------------
 * 1. SAYFA YÖNETİMİ: Uygulamanın hangi URL adresinde hangi sayfayı (Home/Detail) göstereceğini belirler.
 * 2. DİNAMİK ROTALAMA: '/detay/:id' yapısı sayesinde tek bir sayfa üzerinden sınırsız sayıda haber detayını yönetir.
 * 3. BÜTÜNLÜK: Tüm sayfaları (Home ve Detail) tek bir çatı altında toplayarak 'Single Page Application' (SPA) yapısını kurar.
 * 4. CSS BAĞLANTISI: Uygulamanın genel görsel şablonu olan App.css dosyasını projeye dahil eder.
 */
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Detail from './Pages/Detail';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Routes: Hangi yol (path) hangi bileşeni (element) açacak? */}
      <Routes>
  <Route path="/" element={<Home />} />
  {/* 👇 Buradaki yazıma dikkat: 'haber' ile ':id' arasında mutlaka / olmalı */}
  <Route path="/haber/:id" element={<Detail />} />
</Routes>
    </div>
  );
}

export default App;
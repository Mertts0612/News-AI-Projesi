/**
 * UYGULAMA ANA YÖNLENDİRME (ROUTING) MERKEZİ
 * -------------------------------------------------------------------------
 * 1. SAYFA YÖNETİMİ: Home, Detail ve SearchResults sayfalarını yönetir.
 * 2. DİNAMİK ROTALAMA: '/haber/:id' ve '/arama?q=' yapıları.
 * 3. CSS BAĞLANTISI: Uygulamanın genel görsel şablonu olan App.css dahil edilir.
 */
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home/Home';
import Detail from './Details/Detail';
import SearchResults from './SearchResults/SearchResults';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/haber/:id" element={<Detail />} />
        <Route path="/arama" element={<SearchResults />} />
      </Routes>
    </div>
  );
}

export default App;

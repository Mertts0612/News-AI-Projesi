import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home/Home';
import Detail from './Details/Detail';
import SearchResults from './SearchResults/SearchResults';
import './App.css';

function App() {
  // Tema hafızası: Hafızada varsa onu al, yoksa dark başla
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Favori hafızası: Hafızadan oku, diziye çevir
  const [favoriteIds, setFavoriteIds] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Tema değişince hem HTML'e bas hem hafızaya yaz
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Favori listesi her değiştiğinde hafızaya yaz
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const toggleFavorite = (id) => {
    setFavoriteIds(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="App">
      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              favoriteIds={favoriteIds} 
              toggleFavorite={toggleFavorite}
              theme={theme}
              toggleTheme={toggleTheme} 
            />
          } 
        />
        <Route path="/haber/:id" element={<Detail theme={theme} />} />
        <Route path="/arama" element={<SearchResults theme={theme} />} />
      </Routes>
    </div>
  );
}

export default App;
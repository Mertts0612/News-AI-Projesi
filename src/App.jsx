import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home/Home';
import Detail from './Details/Detail';
import SearchResults from './SearchResults/SearchResults';
import Weather from './Weather/Weather';
import Deprem from './Deprem/Deprem';
import './App.css';

function App() {
  // Tema hafızası: Hafızada varsa onu al, yoksa dark başla
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Tema değişince hem HTML'e bas hem hafızaya yaz
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
              theme={theme}
              toggleTheme={toggleTheme} 
            />
          } 
        />
        <Route path="/haber/:id" element={<Detail />} />
        <Route path="/arama" element={<SearchResults theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/hava-durumu" element={<Weather />} />
        <Route path="/deprem" element={<Deprem />} />
      </Routes>
    </div>
  );
}

export default App;
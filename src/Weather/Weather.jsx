/**
 * 1. useWeather ile anlık derece, durum, nem ve 3 günlük tahmin.
 * 2. TopBar ve useCurrencies; geri dön butonu ile önceki sayfaya gider.
 * 3. Loading ve error durumları; weather-card ile ana içerik.
 * 4. weatherIcon ile durum emojisi; tema data-theme ile CSS'e iletilir.
 * 5. 3 günlük tahmin grid; tahmin3Gun dizisi map ile listelenir.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeather } from '../hooks/useWeather';
import TopBar from '../TopBar/TopBar';
import { useCurrencies } from '../hooks/useCurrencies';
import './Weather.css';

function weatherIcon(durum) {
  if (!durum) return '⛅';
  const d = String(durum).toLowerCase();
  if (d.includes('güneş') || d.includes('açık')) return '☀️';
  if (d.includes('yağmur')) return '🌧️';
  if (d.includes('kar')) return '❄️';
  if (d.includes('bulut')) return '☁️';
  return '⛅';
}

export default function Weather() {
  const navigate = useNavigate();
  const { weather, loading, error } = useWeather({ refreshInterval: 60000 });
  const { currencies } = useCurrencies({ refreshInterval: 10000 });
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';

  return (
    <div className="weather-page" data-theme={theme}>
      <TopBar currencies={currencies} />
      <div className="grain-overlay" />
      <div className="weather-content">
        <nav className="back-nav">
          <button type="button" className="back-link-btn" onClick={() => navigate(-1)}>
            ← Geri dön
          </button>
        </nav>

        {loading && (
          <div className="weather-loading">
            <div className="spinner" />
            <p>Hava durumu yükleniyor...</p>
          </div>
        )}

        {error && (
          <div className="weather-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && weather && (
          <article className="weather-card">
            <header className="weather-header">
              <span className="weather-icon-lg">{weatherIcon(weather.durum)}</span>
              <h1 className="weather-title">Hava Durumu</h1>
              <p className="weather-durum">{weather.durum}</p>
            </header>

            <div className="weather-now">
              <span className="weather-degree-now">{weather.anlikDerece}°</span>
              <span className="weather-label">Anlık sıcaklık</span>
            </div>

            <div className="weather-meta">
              <div className="weather-meta-item">
                <span className="weather-meta-label">Nem</span>
                <span className="weather-meta-value">%{weather.nemOrani}</span>
              </div>
            </div>

            {weather.tahmin3Gun && weather.tahmin3Gun.length > 0 && (
              <section className="weather-forecast">
                <h2 className="weather-forecast-title">3 Günlük Tahmin</h2>
                <div className="weather-forecast-grid">
                  {weather.tahmin3Gun.map((day, i) => (
                    <div key={i} className="weather-forecast-day">
                      <span className="forecast-day-name">{day.gun}</span>
                      <span className="forecast-day-degree">{day.derece}°</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>
        )}
      </div>
    </div>
  );
}

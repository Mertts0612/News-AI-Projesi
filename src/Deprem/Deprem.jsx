/**
 * Tümünü gör – Deprem bilgileri tam sayfa.
 * useEarthquakes ile tüm deprem listesi tablo halinde gösterilir.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEarthquakes } from '../hooks/useEarthquakes';
import TopBar from '../TopBar/TopBar';
import { useCurrencies } from '../hooks/useCurrencies';
import './Deprem.css';

function formatTarih(iso) {
  if (!iso) return '–';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
}

export default function Deprem() {
  const navigate = useNavigate();
  const { earthquakes, loading, error } = useEarthquakes({ refreshInterval: 30000 });
  const { currencies } = useCurrencies({ refreshInterval: 10000 });
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';

  return (
    <div className="deprem-page" data-theme={theme}>
      <TopBar currencies={currencies} />
      <div className="grain-overlay" />
      <div className="deprem-content">
        <nav className="back-nav">
          <button type="button" className="back-link-btn" onClick={() => navigate(-1)}>
            ← Geri dön
          </button>
        </nav>

        <h1 className="deprem-page-title">Deprem Bilgileri</h1>

        {loading && (
          <div className="deprem-loading">
            <div className="spinner" />
            <p>Deprem verileri yükleniyor...</p>
          </div>
        )}

        {error && (
          <div className="deprem-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (!earthquakes || earthquakes.length === 0) && (
          <p className="deprem-empty">Kayıtlı deprem verisi bulunamadı.</p>
        )}

        {!loading && !error && earthquakes && earthquakes.length > 0 && (
          <div className="deprem-table-wrap">
            <table className="deprem-table">
              <thead>
                <tr>
                  <th>Yer</th>
                  <th>Büyüklük</th>
                  <th>Derinlik (km)</th>
                  <th>Tarih / Saat</th>
                </tr>
              </thead>
              <tbody>
                {earthquakes.map((eq) => (
                  <tr key={eq.id}>
                    <td className="deprem-yer">{eq.yer}</td>
                    <td className="deprem-mag">M{eq.büyüklük}</td>
                    <td className="deprem-derinlik">{eq.derinlik}</td>
                    <td className="deprem-saat">{formatTarih(eq.saat)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

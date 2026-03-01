/**
 * Ana sayfada kullanılabilecek kısa deprem özeti: son 5 deprem + "Tümünü gör" linki.
 * useEarthquakes ile veri alır; /deprem sayfasına yönlendirir.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEarthquakes } from '../hooks/useEarthquakes';
import './DepremSummary.css';

function formatSaat(iso) {
  if (!iso) return '–';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export default function DepremSummary() {
  const navigate = useNavigate();
  const { earthquakes, loading } = useEarthquakes({ refreshInterval: 30000 });
  const list = (earthquakes || []).slice(0, 5);

  return (
    <section className="deprem-summary">
      <div className="deprem-summary-header">
        <h2 className="deprem-summary-title">Son Depremler</h2>
        <button type="button" className="deprem-summary-link" onClick={() => navigate('/deprem')}>
          Tümünü gör →
        </button>
      </div>
      {loading ? (
        <div className="deprem-summary-loading">
          <div className="spinner" />
        </div>
      ) : list.length === 0 ? (
        <p className="deprem-summary-empty">Veri yok</p>
      ) : (
        <ul className="deprem-summary-list">
          {list.map((eq) => (
            <li key={eq.id} className="deprem-summary-item">
              <span className="deprem-summary-yer">{eq.yer}</span>
              <span className="deprem-summary-mag">M{eq.büyüklük}</span>
              <span className="deprem-summary-saat">{formatSaat(eq.saat)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

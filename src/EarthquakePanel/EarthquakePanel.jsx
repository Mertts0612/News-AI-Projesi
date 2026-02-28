/**
 * Ana sayfada skor paneli yanında gösterilen deprem paneli.
 * useEarthquakes ile veri alır; skor paneli ile aynı yükseklik/uzunlukta.
 */
import React from 'react';
import { useEarthquakes } from '../hooks/useEarthquakes';
import './EarthquakePanel.css';

function EarthquakePanel() {
    const { earthquakes, loading, error } = useEarthquakes({ refreshInterval: 60000 });
    const latest = [...(earthquakes || [])]
        .sort((a, b) => new Date(b.saat || 0) - new Date(a.saat || 0))
        .slice(0, 5);

    return (
        <div className="earthquake-panel">
            <header className="earthquake-panel-header">
                <span className="earthquake-panel-icon">🌍</span>
                <h3 className="earthquake-panel-title">Son Depremler</h3>
            </header>
            <div className="earthquake-panel-body">
                {loading && <div className="earthquake-panel-loading">Yükleniyor...</div>}
                {error && <div className="earthquake-panel-error">{error}</div>}
                {!loading && !error && latest.length === 0 && (
                    <div className="earthquake-panel-empty">Veri yok</div>
                )}
                {!loading && !error && latest.length > 0 && (
                    <ul className="earthquake-panel-list">
                        {latest.map((eq) => (
                            <li key={eq.id} className="earthquake-panel-item">
                                <span className="eq-place">{eq.yer}</span>
                                <strong className="eq-mag">{eq.büyüklük}</strong>
                                <span className="eq-meta">
                                    {eq.derinlik} km · {eq.saat
                                        ? new Date(eq.saat).toLocaleString('tr-TR', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : '–'}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default EarthquakePanel;

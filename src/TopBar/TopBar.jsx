/**
 * 1. currencies prop ile USD, EUR, BTC, BIST100, ALTIN değer ve değişim yüzdesi.
 * 2. Artış/azalışa göre yeşil veya kırmızı renk (accent-green, accent-red).
 * 3. CANLI göstergesi ve animasyonlu nokta; tarih toLocaleDateString tr-TR.
 * 4. Deprem ikonu (SVG Waves) + hover dropdown: son 5 deprem (Şehir, Şiddet, Saat).
 * 5. TopBar.css ile stiller; container ile genişlik sınırı.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEarthquakes } from '../hooks/useEarthquakes';
import './TopBar.css';

const defaultCurrencies = {
  usd: { value: 33.45, change: 0 },
  eur: { value: 36.78, change: 0 },
  btc: { value: 98450, change: 0 },
  bist: { value: 9842, change: 0 },
  gold: { value: 3621, change: 0 }
};

function formatSaat(iso) {
  if (!iso) return '–';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

/** Seismograf / deprem dalgası ikonu – tek çizgi tepe–çukur */
function DepremIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M0 12 L2 12 L4 4 L6 20 L8 8 L10 16 L12 10 L14 14 L16 12 L24 12" />
    </svg>
  );
}

function TopBar({ currencies = defaultCurrencies }) {
  const navigate = useNavigate();
  const c = currencies || defaultCurrencies;
  const { earthquakes } = useEarthquakes({ refreshInterval: 30000 });
  const list = (earthquakes || []).slice(0, 5);

  return (
    <div className="top-bar">
      <div className="container">
        <div className="top-bar-content">
          <div className="currency-ticker">
            <div className="currency-item">
              <span className="currency-label">USD/TRY</span>
              <span className={`currency-value ${c.usd?.change >= 0 ? 'currency-up' : 'currency-down'}`}>
                ₺{(c.usd?.value ?? 0).toFixed(2)}
              </span>
              <span style={{ fontSize: '0.75rem', color: c.usd?.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {c.usd?.change >= 0 ? '↑' : '↓'} {Math.abs(c.usd?.change ?? 0)}%
              </span>
            </div>
            <div className="currency-item">
              <span className="currency-label">EUR/TRY</span>
              <span className={`currency-value ${c.eur?.change >= 0 ? 'currency-up' : 'currency-down'}`}>
                ₺{(c.eur?.value ?? 0).toFixed(2)}
              </span>
              <span style={{ fontSize: '0.75rem', color: c.eur?.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {c.eur?.change >= 0 ? '↑' : '↓'} {Math.abs(c.eur?.change ?? 0)}%
              </span>
            </div>
            <div className="currency-item">
              <span className="currency-label">BTC/USD</span>
              <span className={`currency-value ${c.btc?.change >= 0 ? 'currency-up' : 'currency-down'}`}>
                ${(c.btc?.value ?? 0).toLocaleString()}
              </span>
              <span style={{ fontSize: '0.75rem', color: c.btc?.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {c.btc?.change >= 0 ? '↑' : '↓'} {Math.abs(c.btc?.change ?? 0)}%
              </span>
            </div>
            <div className="currency-item">
              <span className="currency-label">BIST100</span>
              <span className={`currency-value ${c.bist?.change >= 0 ? 'currency-up' : 'currency-down'}`}>
                {(c.bist?.value ?? 0).toLocaleString('tr-TR')}
              </span>
              <span style={{ fontSize: '0.75rem', color: c.bist?.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {c.bist?.change >= 0 ? '↑' : '↓'} {Math.abs(c.bist?.change ?? 0)}%
              </span>
            </div>
            <div className="currency-item">
              <span className="currency-label">ALTIN/GR</span>
              <span className={`currency-value ${c.gold?.change >= 0 ? 'currency-up' : 'currency-down'}`}>
                ₺{(c.gold?.value ?? 0).toLocaleString('tr-TR')}
              </span>
              <span style={{ fontSize: '0.75rem', color: c.gold?.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {c.gold?.change >= 0 ? '↑' : '↓'} {Math.abs(c.gold?.change ?? 0)}%
              </span>
            </div>
          </div>

          <div className="top-bar-right">
            <div className="top-bar-deprem-wrap">
              <span className="top-bar-deprem-icon" title="Son depremler">
                <DepremIcon />
              </span>
              <div className="top-bar-deprem-dropdown">
                <div className="top-bar-deprem-dropdown-header">Son 5 Deprem</div>
                <ul className="top-bar-deprem-list">
                  {list.length === 0 ? (
                    <li className="top-bar-deprem-item top-bar-deprem-empty">Veri yok</li>
                  ) : (
                    list.map((eq) => (
                      <li key={eq.id} className="top-bar-deprem-item">
                        <span className="top-bar-deprem-yer">{eq.yer}</span>
                        <span className="top-bar-deprem-mag">M{eq.büyüklük}</span>
                        <span className="top-bar-deprem-saat">{formatSaat(eq.saat)}</span>
                      </li>
                    ))
                  )}
                </ul>
                <button type="button" className="top-bar-deprem-more" onClick={() => navigate('/deprem')}>
                  Tümünü gör →
                </button>
              </div>
            </div>
            <div className="live-indicator">
              <div className="live-dot"></div>
              <span>CANLI</span>
            </div>
            <span>
              {new Date().toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
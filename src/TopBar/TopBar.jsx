/**
 * 1. currencies prop ile USD, EUR, BTC, BIST100, ALTIN değer ve değişim yüzdesi.
 * 2. Artış/azalışa göre yeşil veya kırmızı renk (accent-green, accent-red).
 * 3. CANLI göstergesi ve animasyonlu nokta; tarih toLocaleDateString tr-TR.
 * 4. top-bar-content: currency-ticker ve top-bar-right (tarih).
 * 5. TopBar.css ile stiller; container ile genişlik sınırı.
 */
import React from 'react';
import './TopBar.css'; 
function TopBar({ currencies }) {
  return (
    <div className="top-bar">
      <div className="container">
        <div className="top-bar-content">
          <div className="currency-ticker">
            <div className="currency-item">
              <span className="currency-label">USD/TRY</span>
              <span className={`currency-value ${currencies.usd.change >= 0 ? 'currency-up' : 'currency-down'}`}>
                ₺{currencies.usd.value.toFixed(2)}
              </span>
              <span style={{ fontSize: '0.75rem', color: currencies.usd.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {currencies.usd.change >= 0 ? '↑' : '↓'} {Math.abs(currencies.usd.change)}%
              </span>
            </div>
            
            <div className="currency-item">
              <span className="currency-label">EUR/TRY</span>
              <span className={`currency-value ${currencies.eur.change >= 0 ? 'currency-up' : 'currency-down'}`}>
                ₺{currencies.eur.value.toFixed(2)}
              </span>
              <span style={{ fontSize: '0.75rem', color: currencies.eur.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {currencies.eur.change >= 0 ? '↑' : '↓'} {Math.abs(currencies.eur.change)}%
              </span>
            </div>

            <div className="currency-item">
              <span className="currency-label">BTC/USD</span>
              <span className={`currency-value ${currencies.btc.change >= 0 ? 'currency-up' : 'currency-down'}`}>
                ${currencies.btc.value.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.75rem', color: currencies.btc.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {currencies.btc.change >= 0 ? '↑' : '↓'} {Math.abs(currencies.btc.change)}%
              </span>
            </div>

            <div className="currency-item">
              <span className="currency-label">BIST100</span>
              <span className={`currency-value ${currencies.bist.change >= 0 ? 'currency-up' : 'currency-down'}`}>
                {currencies.bist.value.toLocaleString('tr-TR')}
              </span>
              <span style={{ fontSize: '0.75rem', color: currencies.bist.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {currencies.bist.change >= 0 ? '↑' : '↓'} {Math.abs(currencies.bist.change)}%
              </span>
            </div>

            <div className="currency-item">
              <span className="currency-label">ALTIN/GR</span>
              <span className={`currency-value ${currencies.gold.change >= 0 ? 'currency-up' : 'currency-down'}`}>
                ₺{currencies.gold.value.toLocaleString('tr-TR')}
              </span>
              <span style={{ fontSize: '0.75rem', color: currencies.gold.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {currencies.gold.change >= 0 ? '↑' : '↓'} {Math.abs(currencies.gold.change)}%
              </span>
            </div>
          </div>

          <div className="top-bar-right">
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
/**
 * CANLI VERİ VE BİLGİ ÇUBUĞU BİLEŞENİ
 * -------------------------------------------------------------------------
 * 1. DİNAMİK VERİ GÖSTERİMİ: Home.jsx'ten gelen anlık döviz ve kripto verilerini görselleştirir.
 * 2. DURUMSAL RENKLENDİRME: Kur değişim oranına göre (artış/azalış) otomatik olarak yeşil veya kırmızı renk atar.
 * 3. CANLI SİNYAL: 'CANLI' ibaresi ve animasyonlu nokta ile sistemin aktif olduğunu kullanıcıya hissettirir.
 * 4. YERELLEŞTİRME: Güncel tarihi Türkiye standartlarında (Gün, Ay, Yıl ve Gün ismi) otomatik olarak formatlar.
 * 5. HİZALAMA: İçeriği 'Space Mono' fontuyla profesyonel bir finans terminali havasında düzenler.
 */
import React from 'react';
import './TopBar.css'; 
function TopBar({ currencies }) {
  return (
    <div className="top-bar">
      <div className="container">
        <div className="top-bar-content">
          {/* Sol Taraf: Döviz ve Kripto Ticker */}
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

          {/* Sağ Taraf: Canlı Gösterge ve Tarih */}
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
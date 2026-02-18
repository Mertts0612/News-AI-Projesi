/**
 * HABER DETAY SAYFASI BİLEŞENİ
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import newsData from '../Data/newsData.json';
import TopBar from '../TopBar/TopBar';
import './Detail.css'

function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currencies, setCurrencies] = useState({
    usd: { value: 33.45, change: 0.12 },
    eur: { value: 36.78, change: -0.08 },
    btc: { value: 98450, change: 2.34 },
    bist: { value: 9842, change: 0.47 },
    gold: { value: 3621, change: 0.83 }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrencies(prev => ({
        usd:  { value: +(prev.usd.value  + (Math.random() - 0.5) * 0.1).toFixed(2),  change: +((Math.random() - 0.5) * 0.5).toFixed(2) },
        eur:  { value: +(prev.eur.value  + (Math.random() - 0.5) * 0.1).toFixed(2),  change: +((Math.random() - 0.5) * 0.5).toFixed(2) },
        btc:  { value: Math.round(prev.btc.value  + (Math.random() - 0.5) * 200),     change: +((Math.random() - 0.5) * 2).toFixed(2) },
        bist: { value: Math.round(prev.bist.value + (Math.random() - 0.5) * 50),      change: +((Math.random() - 0.5) * 1).toFixed(2) },
        gold: { value: Math.round(prev.gold.value + (Math.random() - 0.5) * 20),      change: +((Math.random() - 0.5) * 1).toFixed(2) },
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const newsItem = newsData.news.find(item => item.id === parseInt(id));

  if (!newsItem) {
    return (
      <div className="container" style={{ color: 'white', padding: '5rem', textAlign: 'center' }}>
        <h2>Haber bulunamadı!</h2>
        <button className="pill active" onClick={() => navigate('/')} style={{ marginTop: '2rem' }}>
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  return (
    <div className="detail-page">
      {/* Üst Siyah Bar - Her zaman görünür */}
      <TopBar currencies={currencies} />

      <div className="grain-overlay"></div>
      <div className="detail-content-container">
        <nav className="back-nav" style={{ marginBottom: '3rem', paddingTop: '2rem' }}>
          <button
            onClick={() => navigate('/')}
            className="back-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00d4ff', fontWeight: 'bold' }}
          >
            ← GERİ DÖN
          </button>
        </nav>

        <article>
          <header className="header-section">
            <span className="category-tag">{newsItem.category}</span>
            <h1 className="detail-title gradient-text">{newsItem.title}</h1>
            <div className="meta-panel">
              <span>📅 {newsItem.date}</span>
              <span>👁️ {newsItem.views} GÖRÜNTÜLENME</span>
              <span>⏱️ {newsItem.readTime} OKUMA</span>
            </div>
          </header>

          {/* Haberin Ana Görseli - Küçültülmüş */}
          <div className="news-image-wrapper">
            {newsItem.imageUrl ? (
              <img
                src={newsItem.imageUrl}
                alt={newsItem.title}
                className="detail-main-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<div class="news-image-placeholder">🤖</div>';
                }}
              />
            ) : (
              <div className="news-image-placeholder">🤖</div>
            )}
          </div>

          <div className="content-body">
            <p className="news-spot" style={{
              fontSize: '1.5rem', borderLeft: '4px solid #00d4ff',
              paddingLeft: '1.5rem', marginBottom: '2.5rem', color: '#ffffff', fontWeight: '500'
            }}>
              {newsItem.description.split('.')[0]}.
            </p>
            <div className="description" style={{ fontSize: '1.2rem', lineHeight: '1.8', opacity: '0.9', color: '#a0a0a0' }}>
              {newsItem.description}
            </div>
          </div>

          {/* AI Analiz Kutusu */}
          <div className="ai-note" style={{
            marginTop: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.03)',
            borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', fontStyle: 'italic'
          }}>
            <span style={{ color: '#00d4ff' }}>✨ AI Analizi:</span> Bu içerik yapay zeka tarafından analiz edilmiş ve doğrulanmıştır.
          </div>

          {/* Kaynak Kutusu */}
          <div className="ai-note source-note" style={{
            marginTop: '1.5rem', padding: '2rem', background: 'rgba(255,255,255,0.03)',
            borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', fontStyle: 'normal'
          }}>
            <span style={{ color: '#00d4ff' }}>🔗 Kaynak:</span>{' '}
            <a
              href={newsItem.sourceUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#a0cfff', textDecoration: 'underline', wordBreak: 'break-all' }}
            >
              {newsItem.sourceUrl || 'Kaynak linki mevcut değil'}
            </a>
          </div>
        </article>
      </div>

      <footer className="footer-bottom" style={{ marginTop: '5rem', paddingBottom: '2rem', textAlign: 'center' }}>
        <p>© 2026 AI News • Tufan'ın Web Sitesi</p>
      </footer>
    </div>
  );
}

export default Detail;

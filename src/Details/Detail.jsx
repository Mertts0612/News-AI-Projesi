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
      <TopBar currencies={currencies} />

      <div className="grain-overlay"></div>
      <div className="detail-content-container">
        <nav className="back-nav">
          <button
            onClick={() => navigate('/')}
            className="back-link-btn"
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
            {/* style içindeki sabit renkleri sildik, sadece hizalamayı bıraktık veya CSS'e taşıdık */}
            <p className="news-spot-text">
              {newsItem.description.split('.')[0]}.
            </p>
            <div className="description-text">
              {newsItem.description}
            </div>
          </div>

          {/* Sabit background ve border renklerini sildik */}
          <div className="info-box-ai">
            <span className="info-label">✨ AI Analizi:</span> Bu içerik yapay zeka tarafından analiz edilmiş ve doğrulanmıştır.
          </div>

          <div className="info-box-source">
            <span className="info-label">🔗 Kaynak:</span>{' '}
            <a
              href={newsItem.sourceUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="source-link"
            >
              {newsItem.sourceUrl || 'Kaynak linki mevcut değil'}
            </a>
          </div>
        </article>
      </div>

      <footer className="footer-bottom-section">
        <p>© 2026 AI News </p>
      </footer>
    </div>
  );
}

export default Detail;

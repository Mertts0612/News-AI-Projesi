/**
 * 1. useParams ile haber id; getNewsData() ile veri newsDataApi üzerinden alınır.
 * 2. TopBar ve useCurrencies; geri dön butonu ile ana sayfaya navigasyon.
 * 3. Loading ve error durumları; haber bulunamazsa "Haber bulunamadı" mesajı.
 * 4. Detay başlık, spot, görsel, açıklama ve meta paneli.
 * 5. Sayfa açılışında scroll en üste (useEffect, id bağımlı).
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNewsData } from '../services/newsDataApi';
import TopBar from '../TopBar/TopBar';
import { useCurrencies } from '../hooks/useCurrencies';
import './Detail.css';

function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currencies } = useCurrencies({ refreshInterval: 5000 });
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNewsItem(null);
    setImageError(false);

    getNewsData()
      .then(({ news }) => {
        if (cancelled) return;
        const list = Array.isArray(news) ? news : [];
        const item = list.find((item) => String(item.id) === String(id));
        setNewsItem(item ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Veri yüklenemedi');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page">
        <TopBar currencies={currencies} />
        <div className="grain-overlay" />
        <div className="container">
          <div className="loading">
            <div className="spinner" />
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Haber yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ color: 'white', padding: '5rem', textAlign: 'center' }}>
        <h2>Veri yüklenirken hata oluştu</h2>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>{error}</p>
        <button className="pill active" onClick={() => navigate('/')} style={{ marginTop: '2rem' }}>
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

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
              <span>📅 {newsItem.date ?? '–'}</span>
              <span>👁️ {newsItem.views ?? '–'} GÖRÜNTÜLENME</span>
              <span>⏱️ {newsItem.readTime ?? '–'} OKUMA</span>
            </div>
          </header>

          <div className="news-image-wrapper">
            {newsItem.imageUrl && !imageError ? (
              <img
                src={newsItem.imageUrl}
                alt={newsItem.title}
                className="detail-main-img"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="news-image-placeholder">🤖</div>
            )}
          </div>

          <div className="content-body">
            <p className="news-spot-text">
              {newsItem.description && typeof newsItem.description === 'string'
                ? newsItem.description.split('.')[0] + '.'
                : ''}
            </p>
            <div className="description-text">
              {newsItem.description || ''}
            </div>
          </div>

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

/**
 * HABER DETAY SAYFASI BİLEŞENİ
 * -------------------------------------------------------------------------
 * 1. URL'deki ID parametresini yakalayarak hangi habere tıklandığını anlar.
 * 2. newsData.json(Backendden gelicek api) dosyasından ilgili haberi bulur ve tüm içeriği ekrana basar.
 * 3. Kullanıcının ana sayfaya geri dönebilmesi için navigasyon kontrolü sağlar.
 * 4. Haberin bulunamadığı durumlarda kullanıcıyı yönlendiren bir hata ekranı sunar.
 */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import newsData from '../Data/newsData.json';
import './Detail.css'

function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // JSON içinden haberi bul
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
      <div className="grain-overlay"></div>
      <div className="detail-content-container">
        {/* Geri Dön Navigasyonu */}
        <nav className="back-nav" style={{ marginBottom: '3rem', paddingTop: '4rem' }}>
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

          {/* Haberin Ana Görseli - Mock Veriden Çekiliyor */}
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

          <div className="ai-note" style={{
            marginTop: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.03)',
            borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', fontStyle: 'italic'
          }}>
            <span style={{ color: '#00d4ff' }}>✨ AI Analizi:</span> Bu içerik yapay zeka tarafından analiz edilmiş ve doğrulanmıştır.
          </div>
        </article>
      </div>

      <footer className="footer-bottom" style={{ marginTop: '5rem', paddingBottom: '2rem', textAlign: 'center' }}>
        <p>© 2026 AI News • Tufan’ın Web Sitesi</p>
      </footer>
    </div>
  );
}

export default Detail;
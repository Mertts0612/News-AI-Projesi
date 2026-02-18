/**
 * HABER KARTLARI (BİLEŞEN) YAPISI
 * -------------------------------------------------------------------------
 * 1. TEKRAR KULLANILABİLİRLİK: Tek bir şablon üzerinden tüm haber listesini kutucuklar halinde oluşturur.
 * 2. PROPS YÖNETİMİ: 'item' objesi üzerinden gelen başlık, kategori ve istatistik gibi verileri ekrana yansıtır.
 * 3. NAVİGASYON: Tıklandığında haberin ID'sini kullanarak kullanıcıyı doğru detay sayfasına yönlendirir.
 * 4. GÖRSEL EFEKT: 'animationDelay' kullanarak kartların ekrana sırayla ve akıcı bir şekilde gelmesini sağlar.
 * 5. FAVORİLEME: Yıldız butonu ile haberleri favorilere ekleme/çıkarma.
 * 6. ZAMAN GÖSTERİMİ: "X saat önce" formatında dinamik tarih gösterimi.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewsCard.css';

function NewsCard({ item, index }) {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');

  // Favori durumunu localStorage'dan yükle
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorited(favorites.includes(item.id));
  }, [item.id]);

  // "X saat önce" hesaplama
  useEffect(() => {
    const calculateTimeAgo = () => {
      if (!item.publishedAt) {
        setTimeAgo(item.date || '');
        return;
      }

      const now = new Date();
      const published = new Date(item.publishedAt);
      const diffMs = now - published;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) {
        setTimeAgo('Az önce');
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins} dakika önce`);
      } else if (diffHours < 24) {
        setTimeAgo(`${diffHours} saat önce`);
      } else if (diffDays < 7) {
        setTimeAgo(`${diffDays} gün önce`);
      } else {
        setTimeAgo(item.date || '');
      }
    };

    calculateTimeAgo();
    const interval = setInterval(calculateTimeAgo, 60000); // Her dakika güncelle
    return () => clearInterval(interval);
  }, [item.publishedAt, item.date]);

  // Favori toggle
  const toggleFavorite = (e) => {
    e.stopPropagation(); // Kartın tıklanma olayını engelle
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorited) {
      const updated = favorites.filter(id => id !== item.id);
      localStorage.setItem('favorites', JSON.stringify(updated));
      setIsFavorited(false);
    } else {
      favorites.push(item.id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorited(true);
    }
  };

  // Önem yüzdesine göre renk
  const getImportanceColor = (importance) => {
    if (importance >= 90) return '#00d4ff'; // Çok önemli - mavi
    if (importance >= 80) return '#9d4edd'; // Önemli - mor
    if (importance >= 70) return '#10b981'; // Orta - yeşil
    return '#6b7280'; // Düşük - gri
  };

  return (
    <article
      className="news-card"
      onClick={() => navigate(`/haber/${item.id}`)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="card-header">
        <span className="category-tag">{item.category}</span>
        <span className="date">{timeAgo}</span>
      </div>
      
      <h3>{item.title}</h3>
      
      <p>{item.description}</p>
      
      <div className="card-footer">
        <div className="card-meta-left">
          {/* Önem yüzdesi */}
          {item.importance && (
            <span 
              className="importance-badge"
              style={{ 
                color: getImportanceColor(item.importance),
                borderColor: getImportanceColor(item.importance)
              }}
            >
              <span className="importance-icon">⚡</span>
              %{item.importance}
            </span>
          )}
          
          {/* Okuma süresi */}
          <span className="stat">
            <span className="stat-icon">⏱️</span>
            {item.readTime}
          </span>
        </div>

        {/* Favori butonu - sağ alt */}
        <button
          className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
          onClick={toggleFavorite}
          title={isFavorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        >
          <span className="star-icon">{isFavorited ? '⭐' : '☆'}</span>
        </button>
      </div>
    </article>
  );
}

export default NewsCard;

/**
 * 1. item prop ile başlık, kategori, açıklama, importance, readTime gösterilir.
 * 2. Tıklanınca /haber/:id sayfasına navigate; animationDelay ile sıralı görünüm.
 * 3. Favori: localStorage ve favoritesUpdated event; yıldız butonu toggle.
 * 4. timeAgo: publishedAt/date ile "X saat önce" hesaplanır; dakikada bir güncellenir.
 * 5. getImportanceColor ile önem yüzdesi rengi; favorited state Header ile senkron.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewsCard.css';


function NewsCard({ item, index }) {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const checkFavorite = () => {
      // Eğer zaten favori değilse ve hala değilse bir şey yapma
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const isStillFavorite = favorites.includes(item.id);
      // ANİMASYONLU GEÇİŞ:
      // Burada state'i aniden değiştirmek yerine CSS sınıflarının 
      // geçiş yapmasına izin verecek şekilde güncelliyoruz

      if (isFavorited === isStillFavorite) return;

      setIsFavorited(isStillFavorite);
    };

    checkFavorite();
    window.addEventListener('favoritesUpdated', checkFavorite);
    window.addEventListener('storage', checkFavorite);

    return () => {
      window.removeEventListener('favoritesUpdated', checkFavorite);
      window.removeEventListener('storage', checkFavorite);
    };
  }, [item.id, isFavorited]);
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
    const interval = setInterval(calculateTimeAgo, 60000);
    return () => clearInterval(interval);
  }, [item.publishedAt, item.date]);

    
    // 1. Durumu belirle
    const isAdding = !isFavorited; 
        // Çıkartma
  const toggleFavorite = (e) => {
    e.stopPropagation(); 
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    if (isFavorited) {
        const updated = favorites.filter(id => id !== item.id);
        // Ekleme
        localStorage.setItem('favorites', JSON.stringify(updated));
        setIsFavorited(false);
    } else {
        favorites.push(item.id);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    // 2. KRİTİK SATIR: Bu satır Header'ı dürter ve "Veri değişti, oku!" der.
        setIsFavorited(true);
    }
  // Önem yüzdesine göre renk

    window.dispatchEvent(new Event('favoritesUpdated'));
};

  const getImportanceColor = (importance) => {
    if (importance >= 90) return '#00d4ff';
    if (importance >= 80) return '#9d4edd';
    if (importance >= 70) return '#10b981';
    return '#6b7280';
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
          {/* Önem yüzdesi */}
      
      <div className="card-footer">
        <div className="card-meta-left">
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

          <span className="stat">
            <span className="stat-icon">⏱️</span>
            {item.readTime}
        {/* Favori butonu - sağ alt */}
          </span>
        </div>

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
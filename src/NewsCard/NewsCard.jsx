/**
 * 1. item prop ile başlık, kategori, açıklama, importance, readTime gösterilir.
 * 2. Tıklanınca /haber/:id sayfasına navigate; animationDelay ile sıralı görünüm.
 * 3. Favori: localStorage ve favoritesUpdated event; yıldız butonu toggle.
 * 4. timeAgo: publishedAt/date ile "X saat önce" hesaplanır; dakikada bir güncellenir.
 * 5. Önem yıldızları; favorited state Header ile senkron.
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

  const toggleFavorite = (e) => {
    e.stopPropagation(); 
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
    window.dispatchEvent(new Event('favoritesUpdated'));
};

  // Önem yüzdesini 1-5 yıldıza çevir (en yüksek = 5 yıldız)
  const importanceToStars = (importance) => {
    if (!importance) return 1;
    return Math.min(5, Math.max(1, Math.ceil((Number(importance) / 100) * 5)));
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
          {item.importance != null && (
            <span 
              className="importance-badge importance-stars"
              title={`Önem: ${importanceToStars(item.importance)}/5`}
              aria-label={`Önem seviyesi: ${importanceToStars(item.importance)} yıldız`}
            >
              {[...Array(5)].map((_, i) => (
                <span key={i} className="star" aria-hidden>
                  {i < importanceToStars(item.importance) ? '★' : '☆'}
                </span>
              ))}
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
/**
 * HABER KARTLARI (BİLEŞEN) YAPISI
 * -------------------------------------------------------------------------
 * 1. TEKRAR KULLANILABİLİRLİK: Tek bir şablon üzerinden tüm haber listesini kutucuklar halinde oluşturur.
 * 2. PROPS YÖNETİMİ: 'item' objesi üzerinden gelen başlık, kategori ve istatistik gibi verileri ekrana yansıtır.
 * 3. NAVİGASYON: Tıklandığında haberin ID'sini kullanarak kullanıcıyı doğru detay sayfasına yönlendirir.
 * 4. GÖRSEL EFEKT: 'animationDelay' kullanarak kartların ekrana sırayla ve akıcı bir şekilde gelmesini sağlar.
 * 5. BİLGİ PANELİ: Haberin okunma süresi, görüntülenme sayısı ve kategorisi gibi özet verileri kullanıcıya sunar.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NewsCard.css'; 

function NewsCard({ item, index }) {
  const navigate = useNavigate();

  return (
    <article
      className="news-card"
      // 👇 Tıklandığında React Router ile detay sayfasına gider
      onClick={() => navigate(`/haber/${item.id}`)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="card-header">
        <span className="category-tag">{item.category}</span>
        <span className="date">{item.date}</span>
      </div>
      
      <h3>{item.title}</h3>
      
      <p>{item.description}</p>
      
      <div className="card-footer">
        <span className="read-more">Devamını Oku</span>
        <div className="card-stats">
          <span className="stat">👁️ {item.views}</span>
          <span className="stat">⏱️ {item.readTime}</span>
        </div>
      </div>
    </article>
  );
}

export default NewsCard;
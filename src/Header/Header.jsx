/**
 * ÜST MENÜ VE NAVİGASYON BİLEŞENİ
 * -------------------------------------------------------------------------
 * 1. MARKA KİMLİĞİ: Sitenin ana logosunu ve görsel bütünlüğünü temsil eder.
 * 2. KATEGORİ YÖNETİMİ: 'categories' dizisini dönerek dinamik butonlar (pills) oluşturur.
 * 3. ETKİLEŞİM: Kullanıcının tıkladığı kategoriyi aktif hale getirir ve Home.jsx'e haber verir.
 * 4. TEMA KONTROLÜ: Kullanıcı arayüzünün (Karanlık/Aydınlık) değiştirilmesi için buton arayüzü sunar.
 * 5. ARAMA TASARIMI: Kullanıcı deneyimi için merkezi bir arama çubuğu ve eylem butonları içerir.
 */
import React from 'react';
import './Header.css'; 
function Header({ categories, activeCategory, setActiveCategory, theme, toggleTheme, searchTerm, setSearchTerm }) { 
  return (
    <header className="navbar">
      <div className="container">
        <div className="header-content">
          {/* Sol Taraf: Logo */}
          <div className="logo-section">
            <div className="logo">AI NEWS</div>
          </div>

          {/* Orta Taraf: Arama Kutusu (Senin orijinal tasarımın) */}
          <div className="search-container">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Haberlerde ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Sağ Taraf: Tema ve Diğer Butonlar */}
          <div className="header-actions">
            <button className="icon-button" onClick={toggleTheme} title="Tema Değiştir">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="icon-button" title="Bildirimler">🔔</button>
            <button className="icon-button" title="Favoriler">⭐</button>
          </div>
        </div>

        {/* Alt Taraf: Kategori Butonları (Nav Pills) */}
        <nav className="nav-pills" style={{ marginTop: '1.5rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}

        </nav>
      </div>
    </header>
  );
}

export default Header;
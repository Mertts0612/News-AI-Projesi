/**
 * ÜST MENÜ VE NAVİGASYON BİLEŞENİ
 * -------------------------------------------------------------------------
 * 1. MARKA KİMLİĞİ: Sitenin ana logosunu ve görsel bütünlüğünü temsil eder.
 * 2. KATEGORİ YÖNETİMİ: 'categories' dizisini dönerek dinamik butonlar (pills) oluşturur.
 * 3. ETKİLEŞİM: Kullanıcının tıkladığı kategoriyi aktif hale getirir ve Home.jsx'e haber verir.
 * 4. TEMA KONTROLÜ: Kullanıcı arayüzünün (Karanlık/Aydınlık) değiştirilmesi için buton arayüzü sunar.
 * 5. ARAMA: Anlık öneri (autocomplete) sistemi ve Enter ile arama sayfasına yönlendirme.
 */
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeather } from '../hooks/useWeather';
import './Header.css';

function weatherIcon(durum) {
  if (!durum) return '⛅';
  const d = String(durum).toLowerCase();
  if (d.includes('güneş') || d.includes('açık')) return '☀️';
  if (d.includes('yağmur')) return '🌧️';
  if (d.includes('kar')) return '❄️';
  if (d.includes('bulut')) return '☁️';
  return '⛅';
}

function Header({
    categories,
    activeCategory,
    setActiveCategory,
    theme,
    toggleTheme,
    searchTerm,
    setSearchTerm,
    onSearchNavigate,
    allNews = []
}) {
    const navigate = useNavigate();
    // Panel varsayılan açık; ortadaki çubukla açıp kapatılır
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const sidebarRef = useRef(null);

    // Sayfada sidebar varken html'e has-sidebar ver (Detail/Weather'da margin uygulanmasın)
    useLayoutEffect(() => {
        document.documentElement.classList.add('has-sidebar');
        return () => {
            document.documentElement.classList.remove('has-sidebar');
        };
    }, []);

    // İçeriğin daralıp genişlemesi için data-sidebar
    useLayoutEffect(() => {
        document.documentElement.setAttribute('data-sidebar', sidebarOpen ? 'open' : 'closed');
    }, [sidebarOpen]);
    // 1. Favori ID'lerini tutacak state
    const [favoriteIds, setFavoriteIds] = useState([]);

    // 2. localStorage'dan veriyi çekip state'e yazan fonksiyon
    useEffect(() => {
        const syncFavorites = () => {
            const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
            setFavoriteIds(saved);
        };

        syncFavorites(); // Sayfa açıldığında çalıştır

        // NewsCard'dan gelen sinyali ve diğer sekmelerdeki değişimi dinle
        window.addEventListener('favoritesUpdated', syncFavorites);
        window.addEventListener('storage', syncFavorites);

        return () => {
            window.removeEventListener('favoritesUpdated', syncFavorites);
            window.removeEventListener('storage', syncFavorites);
        };
    }, []);

    // 3. Ekranda gösterilecek haberleri hesapla (Her render'da güncel kalır)
    const favoriteNews = allNews.filter(item =>
        favoriteIds.map(String).includes(String(item.id))
    );

    const { weather } = useWeather({ refreshInterval: 60000 });
    const [showFavorites, setShowFavorites] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const wrapperRef = useRef(null);

    // Dışarı tıklanınca kapat
    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowSuggestions(false);
                setActiveSuggestion(-1);
                setShowFavorites(false);
            }
            // Sidebar toggle çubuğu dışında dışarı tıklanınca paneli kapatma (sadece çubuktan toggle)
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Yazı değişince önerileri filtrele
    const handleInputChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        setActiveSuggestion(-1);

        if (val.trim().length < 1) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const q = val.toLowerCase();
        const matched = allNews
            .filter(item =>
                (item.title || '').toLowerCase().includes(q) ||
                (item.category || '').toLowerCase().includes(q)
            )
            .slice(0, 5);

        setSuggestions(matched);
        setShowSuggestions(matched.length > 0);
    };

    // Klavye navigasyonu
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveSuggestion(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveSuggestion(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
                handleSuggestionClick(suggestions[activeSuggestion]);
            } else if (searchTerm.trim()) {
                doSearch(searchTerm.trim());
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setActiveSuggestion(-1);
        }
    };

    const doSearch = (term) => {
        setShowSuggestions(false);
        setSuggestions([]);
        if (onSearchNavigate) {
            onSearchNavigate(term);
        } else {
            navigate(`/arama?q=${encodeURIComponent(term)}`);
        }
    };

    const handleSuggestionClick = (item) => {
        setShowSuggestions(false);
        setSuggestions([]);
        setSearchTerm('');
        navigate(`/haber/${item.id}`);
    };

    return (
        <>
            {/* Sol panel: Kategoriler + Deprem – varsayılan açık, ortadaki çubukla toggle */}
            <aside className={`category-sidebar ${sidebarOpen ? 'open' : 'closed'}`} ref={sidebarRef}>
                <div className="sidebar-header">
                    <span className="sidebar-title">Kategoriler</span>
                </div>

                {/* Kategoriler listesi en üstte */}
                <nav className="sidebar-nav">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            className={`sidebar-item ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            <span className="sidebar-item-icon">
                                {cat === 'Tümü' && '📰'}
                                {cat === 'Teknoloji' && '💻'}
                                {cat === 'Siyaset' && '🏛️'}
                                {cat === 'Gündem' && '📢'}
                                {cat === 'Spor' && '⚽'}
                                {cat === 'Ekonomi' && '💰'}
                                {cat === 'Eğitim' && '📚'}
                            </span>
                            <span className="sidebar-item-text">{cat}</span>
                            {activeCategory === cat && <span className="sidebar-item-check">✓</span>}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Toggle çubuğu: panelin sağ kenarında ortada, aç/kapa */}
            <button
                type="button"
                className={`sidebar-toggle-handle ${sidebarOpen ? 'open' : 'closed'}`}
                onClick={() => setSidebarOpen(prev => !prev)}
                title={sidebarOpen ? 'Paneli kapat' : 'Paneli aç'}
                aria-label={sidebarOpen ? 'Paneli kapat' : 'Paneli aç'}
            >
                <span className="sidebar-toggle-icon">{sidebarOpen ? '‹' : '›'}</span>
            </button>

            <header className="navbar">
                <div className="container">
                    <div className="header-content">
                        <div className="logo-section">
                            <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/')}>
                                AI News
                            </div>
                        </div>

                        {/* Orta: Arama + Autocomplete */}
                    <div className="search-container" ref={wrapperRef}>
                        <div className="search-wrapper">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Haberlerde ara..."
                                value={searchTerm}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onFocus={() => {
                                    if (suggestions.length > 0) setShowSuggestions(true);
                                }}
                                autoComplete="off"
                            />
                        </div>

                        {/* Autocomplete Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="autocomplete-dropdown">
                                <div className="autocomplete-header">
                                    <span>Öneriler</span>
                                </div>
                                {suggestions.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className={`autocomplete-item ${activeSuggestion === idx ? 'active' : ''}`}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleSuggestionClick(item);
                                        }}
                                        onMouseEnter={() => setActiveSuggestion(idx)}
                                    >
                                        <span className="autocomplete-icon">📰</span>
                                        <div className="autocomplete-text">
                                            <span className="autocomplete-title">{item.title}</span>
                                            <span className="autocomplete-category">{item.category}</span>
                                        </div>
                                        <span className="autocomplete-arrow">→</span>
                                    </div>
                                ))}
                                <div
                                    className="autocomplete-search-all"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        doSearch(searchTerm);
                                    }}
                                >
                                    <span>🔍</span>
                                    <span>"{searchTerm}" için tüm sonuçları gör</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sağ: Hava durumu + Tema + Favori */}
                    <div className="header-actions">
                        <button
                            type="button"
                            className="header-weather-widget"
                            onClick={() => navigate('/hava-durumu')}
                            title="Hava durumu detayı"
                        >
                            <span className="header-weather-icon">{weatherIcon(weather?.durum)}</span>
                            <span className="header-weather-degree">{weather?.anlikDerece ?? '–'}°</span>
                        </button>
                        <button className="icon-button" onClick={toggleTheme} title="Tema Değiştir">
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <div className="favorites-wrapper" ref={wrapperRef}>
                            <button
                                className={`icon-button ${favoriteIds.length > 0 ? 'has-favorites' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowFavorites(!showFavorites);
                                }}
                                title="Favoriler"
                            >
                                ⭐
                                {favoriteIds.length > 0 && (
                                    <span key={favoriteIds.length} className="fav-count fav-count-animate">
                                        {favoriteIds.length}
                                    </span>
                                )}
                            </button>

                            {/* BURASI KRİTİK: {showFavorites && ( ... )} yapısını sildik.
            Yerine direkt div'i koyduk ve active sınıfıyla kontrol ediyoruz.
        */}
                            <div className={`fav-dropdown ${showFavorites ? 'active' : ''}`}>
                                <div className="fav-header">
                                    <span>Favorilerim</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        

                                        {favoriteNews.length > 0 && (
                                            // Header.jsx içindeki Temizle butonu
                                            <button
                                                className="clear-all-btn"
                                                onClick={() => {
                                                    if (window.confirm("Tüm favorileri silmek istediğine emin misin?")) {
                                                        localStorage.setItem('favorites', JSON.stringify([]));
                                                        setFavoriteIds([]);
                                                        window.dispatchEvent(new Event('favoritesUpdated'));
                                                    }
                                                }}
                                            >
                                                Temizle
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="fav-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {favoriteNews.length > 0 ? (
                                        favoriteNews.map(news => (
                                            <div
                                                key={news.id}
                                                className="fav-item"
                                                style={{ cursor: 'pointer', position: 'relative' }}
                                                onClick={() => {
                                                    setShowFavorites(false);
                                                    navigate(`/haber/${news.id}`);
                                                }}
                                            >
                                                <img src={news.imageUrl} alt="" className="fav-thumb" />
                                                <div className="fav-info">
                                                    <span className="fav-title">{news.title}</span>
                                                    <span className="fav-category">#{news.category}</span>
                                                </div>

                                                {/* Favori panelindeki tekil silme butonu (X) */}
                                                <button
                                                    className="remove-fav-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
                                                        const updated = saved.filter(id => String(id) !== String(news.id));
                                                        localStorage.setItem('favorites', JSON.stringify(updated));
                                                        window.dispatchEvent(new Event('favoritesUpdated'));
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="fav-empty">
                                            <div className="fav-empty-icon" aria-hidden>
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                                </svg>
                                            </div>
                                            <p>Henüz bir haber favorilemedin.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        </>
    );
}

export default Header;
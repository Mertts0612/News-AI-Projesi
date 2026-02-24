/**
 * ÜST MENÜ VE NAVİGASYON BİLEŞENİ
 * -------------------------------------------------------------------------
 * 1. MARKA KİMLİĞİ: Sitenin ana logosunu ve görsel bütünlüğünü temsil eder.
 * 2. KATEGORİ YÖNETİMİ: 'categories' dizisini dönerek dinamik butonlar (pills) oluşturur.
 * 3. ETKİLEŞİM: Kullanıcının tıkladığı kategoriyi aktif hale getirir ve Home.jsx'e haber verir.
 * 4. TEMA KONTROLÜ: Kullanıcı arayüzünün (Karanlık/Aydınlık) değiştirilmesi için buton arayüzü sunar.
 * 5. ARAMA: Anlık öneri (autocomplete) sistemi ve Enter ile arama sayfasına yönlendirme.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeather } from '../hooks/useWeather';
import { useEarthquakes } from '../hooks/useEarthquakes';
import logoImg from '../assets/logo.png';
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
    // Sidebar (kategoriler) açık/kapalı
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
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
    const { earthquakes } = useEarthquakes({ refreshInterval: 60000 });
    const latestEarthquakes = [...(earthquakes || [])]
        .sort((a, b) => new Date(b.saat || 0) - new Date(a.saat || 0))
        .slice(0, 3);
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
            // Sidebar dışına tıklanınca kapat
            if (sidebarRef.current && !sidebarRef.current.contains(e.target) && !e.target.closest('.sidebar-toggle')) {
                setSidebarOpen(false);
            }
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
            {/* Soldan açılan kategoriler için overlay */}
            <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />

            {/* Sol sidebar: Kategoriler */}
            <aside className={`category-sidebar ${sidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
                <div className="sidebar-header">
                    <span className="sidebar-title">Kategoriler</span>
                    <button type="button" className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
                </div>

                {/* Kategoriler listesi en üstte */}
                <nav className="sidebar-nav">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            className={`sidebar-item ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => {
                                setActiveCategory(cat);
                                setSidebarOpen(false);
                            }}
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

                {/* Son Depremler - kategorilerin altında */}
                <div className="sidebar-earthquakes">
                    <h3 className="sidebar-earthquakes-title">Son Depremler</h3>
                    <ul className="sidebar-earthquakes-list">
                        {latestEarthquakes.length === 0 ? (
                            <li className="sidebar-earthquake-item empty">Veri yok</li>
                        ) : (
                            latestEarthquakes.map((eq) => (
                                <li key={eq.id} className="sidebar-earthquake-item">
                                    <span className="eq-row">
                                        <span className="eq-yer">{eq.yer}</span>
                                        <strong className="eq-mag">{eq.büyüklük}</strong>
                                    </span>
                                    <span className="eq-sub">
                                        {eq.derinlik} km · {eq.saat ? new Date(eq.saat).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '–'}
                                    </span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </aside>

            <header className="navbar">
                <div className="container">
                    <div className="header-content">
                        <div className="logo-section">
                            <button
                                type="button"
                                className="sidebar-toggle"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                title="Kategoriler"
                            >
                                <span className="hamburger-icon">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                            </button>
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
                {/* Kategoriler – top barda yatay sıra */}
                <nav className="nav-pills">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            className={`pill ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </nav>
            </div>
        </header>
        </>
    );
}

export default Header;
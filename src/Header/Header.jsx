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
import './Header.css';

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
                item.title.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q)
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
        <header className="navbar">
            <div className="container">
                <div className="header-content">
                    {/* Sol: Logo */}
                    <div className="logo-section">
                        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                            AI NEWS
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

                    {/* Sağ: Tema + Favori */}
                    <div className="header-actions">
                        <button className="icon-button" onClick={toggleTheme} title="Tema Değiştir">
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <button className="icon-button" title="Favoriler">⭐</button>
                    </div>
                </div>

                {/* Kategori Pills */}
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

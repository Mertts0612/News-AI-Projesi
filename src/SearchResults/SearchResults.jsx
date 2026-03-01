/**
 * ARAMA SONUÇLARI SAYFASI
 * -------------------------------------------------------------------------
 * 1. HEADER KORUNUR: Siyah navbar her zaman üstte kalır (sticky).
 * 2. URL PARAMETRESİ: ?q= ile gelen arama terimini yakalar.
 * 3. FİLTRELEME: newsData üzerinde arama yaparak eşleşen haberleri listeler.
 * 4. API HAZIR: Şu an local data kullanılıyor, ileride API ile swap edilebilir.
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import TopBar from '../TopBar/TopBar';
import NewsCard from '../NewsCard/NewsCard';
import { useCurrencies } from '../hooks/useCurrencies';
import { getNewsData } from '../services/newsDataApi';
import { categories } from '../constants/categories';
import './SearchResults.css';

function SearchResults({ theme, toggleTheme }) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';

    const [searchTerm, setSearchTerm] = useState(query);
    const [allNews, setAllNews] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("Tümü");
    const { currencies } = useCurrencies({ refreshInterval: 5000 });

    // Haberleri newsData üzerinden yükle
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const { news: newsList } = await getNewsData();
                setAllNews(Array.isArray(newsList) ? newsList : []);
            } catch (error) {
                console.error('Veri yüklenirken hata:', error);
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        };
        loadData();
    }, []);

    // Arama filtresi — query veya allNews değiştiğinde çalışır
    useEffect(() => {
        if (!query.trim()) {
            setResults(allNews);
            return;
        }
        const q = query.toLowerCase();
        const filtered = allNews.filter(item =>
            (item.title || '').toLowerCase().includes(q) ||
            (item.description || '').toLowerCase().includes(q) ||
            (item.category || '').toLowerCase().includes(q)
        );
        setResults(filtered);
    }, [query, allNews]);

    return (
        <div className="search-page" data-theme={theme}>
            <div className="grain-overlay"></div>

            <TopBar currencies={currencies} />

            <Header
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                theme={theme}
                toggleTheme={toggleTheme}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearchNavigate={(term) => navigate(`/arama?q=${encodeURIComponent(term)}`)}
                allNews={allNews}
            />

            <main className="container search-main">
                {/* Başlık alanı */}
                <div className="search-results-header">
                    <div className="search-query-info">
                        <span className="search-label">Arama sonuçları:</span>
                        <span className="search-query-text">"{query}"</span>
                    </div>
                    <span className="search-count">
                        {loading ? '...' : `${results.length} haber bulundu`}
                    </span>
                </div>

                {/* Yükleniyor */}
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                ) : results.length === 0 ? (
                    <div className="no-results">
                        <div className="no-results-icon">🔍</div>
                        <h3>Sonuç bulunamadı</h3>
                        <p>
                            "<strong>{query}</strong>" için herhangi bir haber bulunamadı.
                            Farklı anahtar kelimeler deneyin.
                        </p>
                        <button className="back-home-btn" onClick={() => navigate('/')}>
                            Ana Sayfaya Dön
                        </button>
                    </div>
                ) : (
                    <div className="news-grid search-grid">
                        {results.map((item, index) => (
                            <NewsCard key={item.id} item={item} index={index} />
                        ))}
                    </div>
                )}
            </main>

            <footer className="footer-bottom">
                <p>© 2026 AI News • Tufan'ın Web Sitesi • Eğitim Amaçlıdır</p>
            </footer>
        </div>
    );
}

export default SearchResults;

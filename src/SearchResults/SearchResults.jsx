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
import axios from 'axios';
import Header from '../Header/Header';
import TopBar from '../TopBar/TopBar';
import NewsCard from '../NewsCard/NewsCard';
import './SearchResults.css';

const categories = ["Tümü", "Teknoloji", "Siyaset", "Gündem", "Spor", "Ekonomi", "Sağlık", "Eğitim"];

function SearchResults() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';

    const [searchTerm, setSearchTerm] = useState(query);
    const [allNews, setAllNews] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("Tümü");
    const [theme, setTheme] = useState(() => {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    });
    const [currencies] = useState({
        usd: { value: 33.45, change: 0.12 },
        eur: { value: 36.78, change: -0.08 },
        btc: { value: 98450, change: 2.34 },
        bist: { value: 9842, change: 0.47 },
        gold: { value: 3621, change: 0.83 }
    });

    // Tema yönetimi
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Haberleri yükle
    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/src/Data/newsData.json');
                setAllNews(response.data.news);
                setTimeout(() => setLoading(false), 500);
            } catch (error) {
                console.error('Haber yüklenirken hata:', error);
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    // Arama filtresi — query veya allNews değiştiğinde çalışır
    useEffect(() => {
        if (!query.trim()) {
            setResults(allNews);
            return;
        }
        const q = query.toLowerCase();
        const filtered = allNews.filter(item =>
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
        );
        setResults(filtered);
    }, [query, allNews]);

    // Enter veya buton ile yeni arama
    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            navigate(`/arama?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <div className="search-page" data-theme={theme}>
            <div className="grain-overlay"></div>

            <TopBar currencies={currencies} />

            <Header
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                theme={theme}
                toggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
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

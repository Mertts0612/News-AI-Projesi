/**
 * ANA SAYFA (HAYATİ MERKEZ) BİLEŞENİ
 * -------------------------------------------------------------------------
 * 1. VERİ YÖNETİMİ: newsData.json dosyasından haberleri çeker ve tüm siteye dağıtır.
 * 2. CANLI KUR MOTORU: useEffect kullanarak her 5 saniyede bir döviz kurlarını rastgele günceller.
 * 3. FİLTRELEME SİSTEMİ: Kullanıcının seçtiği kategoriye göre haber listesini anlık olarak süzer.
 * 4. TEMA KONTROLÜ: Aydınlık/Karanlık tema değişimini 'data-theme' özelliği üzerinden yönetir.
 * 5. ORKESTRASYON: TopBar, Header ve NewsCard gibi alt bileşenleri bir araya getirerek ana yapıyı oluşturur.
 */
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from "../TopBar/TopBar";
import Header from "../Header/Header";
import NewsCard from "../NewsCard/NewsCard";
import { useCurrencies } from '../hooks/useCurrencies';
import { getNewsData } from '../services/newsDataApi';
import { categories } from '../constants/categories';
import './Home.css';

function Home({ theme, toggleTheme }) {
    const navigate = useNavigate();
    const mainSectionRef = useRef(null);
    const isInitialMount = useRef(true);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("Tümü");
    const [searchTerm, setSearchTerm] = useState("");
    const { currencies } = useCurrencies({ refreshInterval: 5000 });

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const { news: newsList } = await getNewsData();
                setNews(Array.isArray(newsList) ? newsList : []);
            } catch (error) {
                console.error("Veri yüklenirken hata oluştu:", error);
                setNews([]);
            } finally {
                setTimeout(() => setLoading(false), 800);
            }
        };
        loadData();
    }, []);

    // Sayfa yenilendiğinde / ilk açıldığında en üstten başlat
    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
    }, []);

    // Kategori değişiminde scroll – sadece kullanıcı tıkladığında; DOM güncellendikten hemen sonra (tek kaydırma)
    useLayoutEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (!mainSectionRef.current) return;
        const header = document.querySelector('.navbar');
        const headerHeight = header ? header.offsetHeight + 16 : 180;
        const y = mainSectionRef.current.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }, [activeCategory]);

    // 4. Filtreleme ve Öne Çıkan Haber Mantığı
    const filteredNews = news.filter(item => {
        const matchesCategory = activeCategory === "Tümü" || item.category === activeCategory;
        const term = (searchTerm || '').toLowerCase();
        const title = (item.title || '').toLowerCase();
        const category = (item.category || '').toLowerCase();
        const matchesSearch = title.includes(term) || category.includes(term);
        return matchesCategory && matchesSearch;
    });

    // Öne çıkan haberi bul
    const featuredNews = news.find(item => item.featured);
    return (
        // En üstteki div'i buna dönüştür:
        <div className="home-page" data-theme={theme}>
            <div className="grain-overlay"></div>
            {/* Diğer bileşenler... */}

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
                allNews={news}
            />

            <main className="container" style={{ marginTop: '2rem' }}>
                <section className="hero">
                    <div className="hero-grid"> {/* Bu sınıf grid yapısını sağlar */}
                        <div className="hero-content">
                            <h1>
                                Okumaya Değil, <br />
                                <span className="gradient-text">Anlamaya Vakit Ayırın</span>
                            </h1>
                            <p>
                                Binlerce haberi sizin yerinize tarıyor ve yapay zeka ile saniyeler içinde okuyabileceğiniz özetlere dönüştürüyoruz. Gündemi zahmetsizce yakalayın.
                            </p>
                        </div>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <h3 className="stat-number">250+</h3>
                                <p className="stat-label">Günlük Haber</p>
                            </div>
                            <div className="stat-item">
                                <h3 className="stat-number">24/7</h3>
                                <p className="stat-label">Canlı Takip</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Öne Çıkan Haber Alanı - sadece "Tümü" seçiliyken göster */}
                {featuredNews && !loading && activeCategory === "Tümü" && (
                    <section className="featured-section">
                        <h2 className="section-title">Öne Çıkan Haber</h2>
                        <div
                            className="featured-card"
                            onClick={() => navigate(`/haber/${featuredNews.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="featured-image-wrapper">
                                {featuredNews.imageUrl ? (
                                    <img
                                        src={featuredNews.imageUrl}
                                        alt={featuredNews.title}
                                        className="featured-main-img"
                                        onError={(e) => {
                                            // Resim yüklenemezse kırık ikonunu gizle ve robotu bas
                                            e.target.style.display = 'none';
                                            e.target.parentNode.innerHTML = '<div class="featured-image-placeholder">🤖</div>';
                                        }}
                                    />
                                ) : (
                                    "🤖"
                                )}
                            </div>
                            <div className="featured-content">
                                <div className="featured-meta">
                                    <span className="category-tag">{featuredNews.category}</span>
                                    <span className="date">{featuredNews.date}</span>
                                </div>
                                <h2>{featuredNews.title}</h2>
                                <p>{featuredNews.description}</p>
                                <div className="card-footer">
                                    <span className="read-more">Devamını Oku</span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* --- Tüm Haberler Başlığı ve Kaydırma Referansı --- */}
                <div className="section-header" ref={mainSectionRef} style={{ marginTop: '3rem' }}>
                    <h2 className="section-title">
                        📰 {activeCategory === "Tümü" ? "Tüm Haberler" : `${activeCategory} Haberleri`}
                    </h2>
                </div>

                {/* --- Haber Izgarası --- */}
                {loading ? (
                    <div className="loading"><div className="spinner"></div></div>
                ) : (
                    <div className="news-grid">
                        {filteredNews.filter(item => activeCategory !== "Tümü" || !item.featured).map((item, index) => (
                            <NewsCard key={item.id} item={item} index={index} />
                        ))}
                    </div>
                )}
            </main>

            <footer className="footer-bottom">
                <p>© 2026 AI News • Tufan’ın Web Sitesi • Eğitim Amaçlıdır</p>
            </footer>
        </div>
    );
}

export default Home;
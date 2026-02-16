/**
 * ANA SAYFA (HAYATİ MERKEZ) BİLEŞENİ
 * -------------------------------------------------------------------------
 * 1. VERİ YÖNETİMİ: newsData.json dosyasından haberleri çeker ve tüm siteye dağıtır.
 * 2. CANLI KUR MOTORU: useEffect kullanarak her 5 saniyede bir döviz kurlarını rastgele günceller.
 * 3. FİLTRELEME SİSTEMİ: Kullanıcının seçtiği kategoriye göre haber listesini anlık olarak süzer.
 * 4. TEMA KONTROLÜ: Aydınlık/Karanlık tema değişimini 'data-theme' özelliği üzerinden yönetir.
 * 5. ORKESTRASYON: TopBar, Header ve NewsCard gibi alt bileşenleri bir araya getirerek ana yapıyı oluşturur.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from "../TopBar/TopBar";
import Header from "../Header/Header";
import NewsCard from "../NewsCard/NewsCard";
import './Home.css';

const categories = ["Tümü", "Model", "Teknoloji", "Politika", "Otonom", "Sağlık", "Hukuk", "Eğitim"];

function Home() {
    const navigate = useNavigate();
    const mainSectionRef = useRef(null);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("Tümü");
    const [theme, setTheme] = useState("dark");
    const [searchTerm, setSearchTerm] = useState("");
    const [currencies, setCurrencies] = useState({
        usd: { value: 33.45, change: 0.12 },
        eur: { value: 36.78, change: -0.08 },
        btc: { value: 98450, change: 2.34 }
    });

    // 2. Yeni Veri Çekme (Axios) ve Kaydırma Efekti
    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true); // Veri çekilmeye başlandığında yükleniyor ekranını aç
                // Axios ile JSON dosyasını sanki bir API'ymiş gibi okuyoruz
                const response = await axios.get('/src/Data/newsData.json');
                // Gelen veriyi state'e aktarıyoruz
                setNews(response.data.news);
                // Veri geldikten sonra spinner'ı kapat
                setTimeout(() => setLoading(false), 800);
            } catch (error) {
                console.error("Haberler yüklenirken hata oluştu:", error);
                setLoading(false);
            }
        };
        fetchNews();

        // Kategori değişiminde aşağı kaydırma mantığını koruyoruz
        if (activeCategory !== "Tümü" && mainSectionRef.current) {
            mainSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [activeCategory]); // activeCategory her değiştiğinde bu blok tekrar çalışır


    // 2. Senin meşhur CANLI KUR güncelleme motorun
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrencies(prev => ({
                usd: {
                    value: +(prev.usd.value + (Math.random() - 0.5) * 0.1).toFixed(2),
                    change: +(Math.random() - 0.5).toFixed(2)
                },
                eur: {
                    value: +(prev.eur.value + (Math.random() - 0.5) * 0.1).toFixed(2),
                    change: +(Math.random() - 0.5).toFixed(2)
                },
                btc: {
                    value: Math.floor(prev.btc.value + (Math.random() - 0.5) * 100),
                    change: +(Math.random() * 5 - 2.5).toFixed(2)
                }
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // 3. Tema Değiştirme Efekti
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // 4. Filtreleme ve Öne Çıkan Haber Mantığı
    const filteredNews = news.filter(item => {
        // Önce kategori kontrolü yapıyoruz
        const matchesCategory = activeCategory === "Tümü" || item.category === activeCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase());
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
                toggleTheme={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            <main className="container" style={{ marginTop: '2rem' }}>
                <section className="hero">
                    <div className="hero-grid"> {/* Bu sınıf grid yapısını sağlar */}
                        <div className="hero-content">
                            <h1>
                                Yapay Zeka Dünyasından <br />
                                <span className="gradient-text">En Son Haberler</span>
                            </h1>
                            <p>
                                AI teknolojilerindeki son gelişmeleri, yenilikleri ve trendleri takip edin.
                                Güncel haberlerle yapay zeka dünyasından haberdar olun. Her gün yeni içerikler.
                            </p>
                        </div>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <h3 className="stat-number">250+</h3>
                                <p className="stat-label">Günlük Haber</p>
                            </div>
                            <div className="stat-item">
                                <h3 className="stat-number">50K+</h3>
                                <p className="stat-label">Okuyucu</p>
                            </div>
                            <div className="stat-item">
                                <h3 className="stat-number">24/7</h3>
                                <p className="stat-label">Canlı Takip</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Öne Çıkan Haber Alanı */}
                {featuredNews && !loading && (
                    <section className="featured-section">
                        <h2 className="section-title">🔥 Öne Çıkan Haber</h2>
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
                        {filteredNews.filter(item => !item.featured || activeCategory !== "Tümü").map((item, index) => (
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
# Proje Revizyon Raporu – News-AI-Projesi

**Tarih:** 21 Şubat 2026  
**Kapsam:** Şu ana kadar yapılan değişiklikler sonrası tüm dosyaların incelenmesi ve tespit edilen tutarsızlıklar.

**Durum:** Rapor maddeleri uygulandı (ölü CSS kaldırıldı, duplicate kurallar birleştirildi, kullanılmayan import kaldırıldı, eksik sınıflar eklendi).

---

## 1. Proje Yapısı Özeti

| Kategori   | Dosyalar |
|-----------|----------|
| **Sayfalar** | Home, SearchResults, Detail, Weather |
| **Bileşenler** | Header, TopBar, NewsCard, MatchStatsWidget, EarthquakePanel |
| **Hooks** | useCurrencies, useWeather, useEarthquakes |
| **Servis** | newsDataApi.js |
| **Veri** | newsData.json, matchStatsMock.json |

**Ana akış:** `main.jsx` → `App.jsx` → Route’lar. Home sayfası: TopBar, Header, hero (başlık → Öne Çıkan Haber → Spor + Deprem panelleri), haber listesi.

---

## 2. Tespit Edilen Sorunlar

### 2.1 Kullanılmayan / Eskimiş CSS (Dead Code)

#### **Home.css**
- **`.hero-grid`**, **`.hero-content`**, **`.hero-content h1`**, **`.hero-content p`**, **`.hero-stats`**  
  Artık JSX’te kullanılmıyor. Yerine `hero-title-wrap`, `hero-panels`, `hero-panel` kullanılıyor. Bu kurallar silinebilir; yalnızca `hero-title-wrap h1` ve responsive’teki `hero-content h1` başlık için gerekli (veya hepsi `hero-title-wrap` ile tekilleştirilebilir).

- **`.stat-item`**, **`.stat-number`**, **`.stat-label`**  
  Eski “Günlük Haber / Canlı Takip” istatistik kartlarına aitti. Artık hiçbir JSX’te yok. Silinebilir.

- **Light theme kuralları:**  
  `home-page[data-theme="light"] .hero-grid .hero-stats`,  
  `home-page[data-theme="light"] .stat-item`,  
  `home-page[data-theme="light"] .hero-stats .stat-label`  
  Hepsi eski hero/stats yapısına ait. Silinebilir.

- **Responsive:**  
  `@media (max-width: 1024px)` ve `@media (max-width: 768px)` içinde hâlâ `.hero-grid`, `.hero-stats`, `.hero-content h1` geçiyor. Bunlar ya kaldırılmalı ya da sadece `.hero-title-wrap` / `.hero-panels` ile tutarlı hale getirilmeli.

**Öneri:** Eski hero + stat bloklarını ve ilgili light theme + medya sorgularını kaldırıp sadece `hero-title-wrap`, `hero-panels`, `hero-panel` ve `featured-section` ile devam edin.

---

#### **Header.css**
- **`.sidebar-earthquakes`**, **`.sidebar-earthquakes-title`**, **`.sidebar-earthquakes-list`** ve ilgili deprem item stilleri  
  Sidebar’dan “Son Depremler” kaldırıldığı için kullanılmıyor. Silinebilir.

- **`.sidebar-close`**, **`.sidebar-close:hover`**  
  Kapatma (X) butonu kaldırıldı; toggle çubuk kullanılıyor. Silinebilir.

Bu sınıflar Header.jsx’te artık yok; CSS’te bırakılması sadece dosya şişkinliği ve kafa karışıklığı yaratır.

---

#### **MatchStatsWidget.css**
- **`.match-widget-detail`**, **`.match-detail-summary`**, **`.match-detail-team`**, **`.match-detail-logo`**, **`.match-detail-logo-placeholder`**, **`.match-detail-team-name`**, **`.match-detail-center`**, **`.match-detail-status`**, **`.match-detail-score`**
- **`.match-stat-row`**, **`.match-stat-value`**, **`.match-stat-home`**, **`.match-stat-away`**, **`.match-stat-name`**, **`.match-stat-bar-wrap`**, **`.match-stat-bar`**, **`.match-stat-bar-zero`**, **`.match-stat-bar-line`**

Alta açılan “Maç istatistikleri” bölümü (seçili maç özeti + oransal barlar) kaldırıldığı için bu stiller kullanılmıyor. Silinebilir.

---

### 2.2 CSS’te Tanımlı Olmayan Sınıflar (JSX’te Kullanılıyor)

- **`featured-image-placeholder`**  
  Home.jsx’te resim hata verdiğinde `innerHTML` ile eklenen div’in class’ı. CSS’te özel bir kural yok; görsel olarak sadece emoji/fallback görünüyor. İsterseniz `.featured-image-placeholder` için (ör. metin ortala, font boyutu) bir kural eklenebilir; zorunlu değil.

- **`fav-info`**  
  Header.jsx’te favori dropdown içinde kullanılıyor. Header.css’te `.fav-info` tanımı yok. Muhtemelen üst öğe veya global stillerle şekilleniyor. İsterseniz anlamlı bir stil eklenebilir; yoksa da çalışmaya engel değil.

---

### 2.3 Tekrarlayan / Çakışan Kurallar

- **Header.css**  
  - `[data-theme="light"] .navbar` birden fazla yerde tanımlanmış olabilir; son gelen kural geçerli olur. Tek bir yerde toplamak okunabilirlik ve bakım için iyi olur.  
  - `.remove-fav-btn` iki kez tanımlıysa yine sonraki geçerli; biri silinip tek tanım bırakılabilir.

- **TopBar.css**  
  - `.top-bar`, `.currency-up`, `.currency-down` vb. birden fazla blokta geçiyorsa tekilleştirilebilir.

- **index.css / SearchResults**  
  - Global `.no-results` ile SearchResults.css’teki `.no-results` çakışabilir. Aynı sayfada ikisi de yükleniyorsa öncelik (specificity) ve yükleme sırasına dikkat edilmeli; gerekirse SearchResults’taki daha spesifik (ör. `.search-page .no-results`) yapılabilir.

---

### 2.4 Responsive Tutarsızlık (Home.css)

- **`.hero-stats`** için `@media (max-width: 768px)` içinde `grid-template-columns: 1fr` kullanılmış. Oysa `.hero-stats` normalde `display: flex`. Bu kural eski yapıya ait ve artık anlamsız; silinmeli.  
- **`.hero-grid`** için `@media (max-width: 1024px)` içinde `grid-template-columns: 1fr` var; JSX’te `.hero-grid` kullanılmadığı için bu da temizlenebilir.

Mantıklı olan: Sadece `.hero-panels` için 1024px altında `grid-template-columns: 1fr` kalsın; diğer hero medya sorguları ya kaldırılsın ya da yalnızca `hero-title-wrap` / `hero-panels` ile uyumlu olsun.

---

### 2.5 Diğer Kontroller

- **index.css / App.css – `:root`**  
  Dosyalarda `:root` (tek iki nokta üst üste) doğru yazılmış; CSS değişkenleri geçerli. `::root` (çift iki nokta üst üste) hatası yok.

- **Header.jsx – logoImg**  
  `logoImg` import edilip kullanılmıyorsa (metin “AI News” kullanılıyorsa) import kaldırılabilir; lint uyarısını azaltır.

- **Detay / Weather sayfaları**  
  Header’da yapılan sidebar/margin değişiklikleri bu sayfalarda da geçerli; `main.container` margin kuralları `home-page` ve `search-page` için ayrı yazıldığından diğer sayfalar farklı davranabilir. İstenirse Detail ve Weather için de aynı margin/padding mantığı uygulanabilir.

---

## 3. Özet Tablo

| Öncelik | Konu | Dosya | Öneri |
|--------|------|--------|--------|
| Yüksek | Eski hero/stat stilleri | Home.css | .hero-grid, .hero-content, .hero-stats, .stat-*, ilgili light theme ve medya sorgularını kaldır veya sadece hero-title-wrap/hero-panels ile uyumlu yap. |
| Yüksek | Eski deprem/sidebar-close stilleri | Header.css | .sidebar-earthquakes*, .sidebar-close* kurallarını kaldır. |
| Yüksek | Eski maç istatistik stilleri | MatchStatsWidget.css | .match-widget-detail, .match-detail-*, .match-stat-* bloklarını kaldır. |
| Orta | Responsive tutarsızlık | Home.css | .hero-stats ve .hero-grid için medya sorgularını kaldır; yalnızca .hero-panels ve .hero-title-wrap ile tutarlı kurallar bırak. |
| Orta | Duplicate / çakışan kurallar | Header.css, TopBar.css | Tekrarlayan .navbar, .remove-fav-btn, .top-bar vb. tanımları tek yerde topla. |
| Düşük | Tanımsız sınıflar | Home.jsx, Header.jsx | featured-image-placeholder ve fav-info için isteğe bağlı CSS eklenebilir. |
| Düşük | Kullanılmayan import | Header.jsx | logoImg kullanılmıyorsa import’u kaldır. |

---

## 4. Sonuç

Yapılan değişiklikler (depremi sidebar’dan alıp ana sayfaya taşıma, hero’yu başlık + öne çıkan + iki panel yapma, kategori/header düzenlemeleri) işlevsel olarak doğru; bozukluklar büyük ölçüde **eski yapıya ait CSS’in ve birkaç tekrarlayan kuralın temizlenmemiş olmasından** kaynaklanıyor.  

Yukarıdaki adımlar uygulandığında:

- Dosya boyutları küçülür,  
- Stil çakışmaları ve kafa karışıklığı azalır,  
- Responsive davranış sadece güncel yapıya göre kalır.

İstersen bir sonraki adımda bu rapora göre tek tek “hangi satırlar silinecek / nasıl birleştirilecek” patch önerisi de çıkarabilirim.

# API Bağlantıları ve Kod Sağlığı Raporu

Proje dosyaları tarandı. Aşağıda **anlam bozuklukları**, **çalışmayı etkileyebilecek noktalar** ve **sağlıksız yapılar** özetlenmiştir.

---

## 1. Kritik: Production’da veri URL’i çalışmayabilir

**Dosya:** `src/services/newsDataApi.js`  
**Satır:** `const NEWS_DATA_URL = '/src/Data/newsData.json';`

- **Durum:** Vite dev sunucusunda bu path çalışıyor olabilir; ancak **production build** (`npm run build`) sonrası `dist/` içinde `src/Data/` kopyalanmaz. Yayında bu URL isteği **404** verebilir.
- **Öneri:** JSON’u ya `public/data/newsData.json` gibi `public/` altına taşıyıp URL’i `/data/newsData.json` yapın ya da `import newsData from '../Data/newsData.json'` ile doğrudan import edip (gerekirse) bir API fonksiyonuyla Promise olarak döndürün.

---

## 2. Favori eşleşmesinde tip tutarsızlığı (potansiyel hata)

**Dosya:** `src/NewsCard/NewsCard.jsx`  
**Satır:** `const isStillFavorite = favorites.includes(item.id);`

- **Durum:** `favorites` localStorage’dan `JSON.parse` ile geliyor; `item.id` API’den sayı veya string gelebilir. `[1, 2]` ile `item.id === 1` bazen eşleşir ama `["1","2"]` ile `item.id === 1` eşleşmez. Header’da zaten `favoriteIds.map(String).includes(String(item.id))` kullanılıyor; NewsCard’da tip tutarlı değil.
- **Öneri:** `favorites.some(favId => String(favId) === String(item.id))` gibi bir karşılaştırma kullanın. Favori eklerken de `String(item.id)` ile yazmak tutarlılık sağlar.

---

## 3. Kategori listesi tutarsızlığı (anlam bozukluğu)

**Dosyalar:**  
- `src/Home/Home.jsx`: `["Tümü", "Teknoloji", "Siyaset", "Gündem", "Spor", "Ekonomi", "Eğitim"]` — **Sağlık yok.**  
- `src/SearchResults/SearchResults.jsx`: `["Tümü", "Teknoloji", "Siyaset", "Gündem", "Spor", "Ekonomi", "Sağlık", "Eğitim"]` — **Sağlık var.**

- **Durum:** Aynı uygulamada iki farklı kategori listesi; veride "Sağlık" varsa ana sayfada bu kategori seçilemez, arama sayfasında seçilebilir.
- **Öneri:** Kategorileri tek bir yerde (örn. `src/constants/categories.js`) tanımlayıp Home ve SearchResults’ta import edin.

---

## 4. Kullanılmayan / gereksiz kod

**Dosya:** `src/SearchResults/SearchResults.jsx`  
**Fonksiyon:** `handleSearch` (satır ~72–76)

- **Durum:** `handleSearch`, Enter ile aramayı yapıyor gibi görünüyor ama **hiçbir yere bağlanmıyor**. Arama input’u Header içinde ve orada `onSearchNavigate` kullanılıyor. Bu fonksiyon çağrılmıyor.
- **Öneri:** Kullanılmayacaksa kaldırın; kullanılacaksa Header’daki input’a `onKeyDown={handleSearch}` benzeri bir bağlantı yapın (Header’a prop olarak geçmek gerekir).

---

## 5. Tema state’i iki yerde (sağlıksız yapı)

**Dosyalar:** `src/App.jsx`, `src/SearchResults/SearchResults.jsx`

- **Durum:** App’te `theme` state ve `toggleTheme` var; Home’a prop olarak veriliyor. SearchResults ise **kendi içinde** `useState` ile tema tutuyor ve `toggleTheme` ile sadece kendi state’ini güncelliyor. Ayrıca App, SearchResults’a `theme={theme}` veriyor ama SearchResults bu prop’u **kullanmıyor**.
- **Sonuç:** SearchResults’ta tema değişince sadece `document.documentElement` ve yerel state güncellenir; App’in `theme` state’i güncellenmez. Ana sayfaya dönünce App’teki eski tema kullanılır, kısa süreli tutarsızlık veya yanlış tema görünebilir.
- **Öneri:** Tema tek kaynakta olsun: Ya App’teki theme’i SearchResults’a prop olarak verip `toggleTheme`’i de App’ten geçirin ya da tema state’ini Context ile tek merkezden yönetin.

---

## 6. Kullanılmayan prop’lar

**Dosya:** `src/App.jsx`

- **Durum:** `<Detail theme={theme} />` ve `<SearchResults theme={theme} />` ile `theme` prop’u geçiriliyor; ancak **Detail.jsx** ve **SearchResults.jsx** içinde `theme` prop’u kullanılmıyor (SearchResults kendi state’ini kullanıyor, Detail tema prop’u almıyor bile).
- **Öneri:** Ya bu sayfalarda theme’i prop olarak kullanın (ve SearchResults’taki yerel tema state’ini kaldırın) ya da App’ten theme prop’unu kaldırın.

---

## 7. API katmanı ve hata davranışı (bilgi)

**Dosya:** `src/services/newsDataApi.js`

- **Durum:** `getNewsData()` try/catch ile hata yakalayıp **exception fırlatmıyor**; boş/varsayılan obje döndürüyor. Bu yüzden `Detail.jsx` içindeki `.catch()` pratikte **nadiren** çalışır (sadece ağ/axios seviyesinde hata olursa).
- **Sonuç:** Proje çalışmayı bozmaz; sadece “hata durumunda kullanıcıya mesaj” göstermek istiyorsanız, getNewsData’nın hata durumunda da belirli bir şekil döndürmesi (örn. `{ error: true, message: '...' }`) veya exception fırlatması gerekir. Şu anki yapı bilinçli bir tercih olabilir.

---

## Özet tablo

| # | Önem     | Konu                          | Projeyi çalıştırmayı engeller mi? |
|---|----------|--------------------------------|-----------------------------------|
| 1 | Kritik   | Production’da JSON URL 404     | Evet (production’da)              |
| 2 | Orta     | Favori id tip tutarsızlığı     | Hayır (bazı senaryolarda yanlış görünüm) |
| 3 | Orta     | Kategori listesi farkı         | Hayır                              |
| 4 | Düşük    | Kullanılmayan handleSearch     | Hayır                              |
| 5 | Orta     | Tema state iki yerde           | Hayır (tutarsız UX)                |
| 6 | Düşük    | Kullanılmayan theme prop’ları  | Hayır                              |
| 7 | Bilgi    | getNewsData hata davranışı     | Hayır                              |

---

*Rapor oluşturulma tarihi: Proje taramasına göre derlendi.*

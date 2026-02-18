# News-AI Projesi - Frontend Taslağı

Bu proje, yapay zeka ve teknoloji dünyasından en güncel haberleri sunan, modern ve kullanıcı dostu bir haber portalı arayüzüdür. Şu anda API entegrasyonu öncesi tüm  yapısal hazırlıkları tamamlanmış durumdadır.

Son Yapılan Güncellemeler (Şubat 2026)
* **Dinamik Görsel Yönetimi:** Haber kartları ve detay sayfası için Unsplash API tabanlı dinamik görsel yapısı kuruldu.
* **Görsel Hata Yakalama (Robustness):** Resimlerin yüklenememesi durumuna karşı `onError` event'i ile otomatik "Robot Emoji" (fallback) sistemi entegre edildi.
* **Mock Veri Yapısı:** Gerçek API'den gelecek veriye tam uyumlu `newsData.json` yapısı oluşturuldu.

Kullanılan Teknolojiler
* **Framework:** React 19
* **Build Tool:** Vite
* **Styling:** CSS3 (Custom Variables & Grid/Flexbox)
* **HTTP Client:** Axios (Backend entegrasyonu için hazır)
* **Routing:** React Router Dom

Klasör Yapısı
Proje, bileşen tabanlı bir mimari ile organize edilmiştir:
- `/src/Home`: Ana sayfa bileşenleri ve stilleri
- `/src/Details`: Haber detay sayfası yönetimi
- `/src/Data`: Mock veri (JSON) deposu
- `/src/[Bileşen Adı]`: Her bileşenin (Home, Details, Header, TopBar, NewsCard) kendi JSX ve CSS dosyalarını içeren özel klasörleri

 Yerel Kurulum
Projeyi kendi bilgisayarınızda çalıştırmak için:

1. Depoyu klonlayın:
   `git clone https://github.com/Mertts0612/News-AI-Projesi.git`
2. Klasöre girin:
   `cd ai-news-projesi`
3. Bağımlılıkları yükleyin:
   `npm install`
4. Projeyi başlatın:
   `npm run dev`

---
© 2026 Tufan Çalışkan - Bilişim Sistemleri Bölümü Projesi

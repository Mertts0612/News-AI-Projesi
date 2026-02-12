News-AI-Projesi | Frontend Geliştirme
Bu dizin, projenin kullanıcı arayüzü (frontend) katmanına ait kaynak kodlarını içermektedir. Uygulama, modern web geliştirme standartlarına uygun olarak React kütüphanesi ve Vite yapılandırma aracı kullanılarak inşa edilmiştir.
Projenin bu sürümünde; dinamik arama algoritması, tema yönetim sistemi (Karanlık/Aydınlık mod) ve optimize edilmiş haber detay sayfası bileşenleri entegre edilmiştir.

🛠️ Kurulum ve Çalıştırma Talimatları
Projenin yerel çalışma ortamında sorunsuz bir şekilde ayağa kaldırılması için aşağıdaki teknik adımların sırasıyla takip edilmesi gerekmektedir:
Bağımlılıkların Yüklenmesi: Projenin ihtiyaç duyduğu kütüphanelerin kurulması için terminal üzerinden proje dizinine gidiniz ve aşağıdaki komutu çalıştırınız:
Bash npm install
Bu işlem, projenin çalışması için gerekli olan ancak veri trafiğini optimize etmek amacıyla depoya dahil edilmeyen node_modules dizinini oluşturacaktır.
Geliştirme Sunucusunun Başlatılması: Kurulum işlemi tamamlandıktan sonra, uygulamayı yerel sunucuda (local server) önizlemek için:
Bash npm run dev
Arayüze Erişim: Terminalde belirtilen yerel adresi (varsayılan: http://localhost:5173) kullanarak uygulamayı tarayıcınız üzerinden görüntüleyebilirsiniz.

📂 Teknik Dosya Yapısı
src/: Uygulamanın çekirdek kaynak kodlarını barındıran ana dizin.
src/index.css: Global stil tanımlamaları ve görsel tasarım değişkenlerinin bulunduğu CSS dosyası.
src/components/: Navigasyon çubuğu ve haber kartları gibi yeniden kullanılabilir (reusable) UI bileşenleri.
src/pages/: Ana sayfa (Home) ve Haber Detay (Detail) gibi sayfa bazlı görünümlerin yönetildiği dizin.
📝 Önemli Not
Projenin çalışma bütünlüğü için npm install adımının atlanmaması kritik önem taşımaktadır. Geliştirme sürecinde karşılaşılan teknik aksaklıklar için lütfen ilgili dal (branch) sorumlusu ile iletişime geçiniz.

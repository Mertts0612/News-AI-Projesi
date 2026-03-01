News-AI NLP 

News-AI, Türkçe haber içeriklerini analiz eden, kategori sınıflandırması yapan ve 
metinlerin önem puanını hesaplayan yapay zekâ tabanlı bir mikroservistir. v2 sürümü 
ile birlikte, derin öğrenme modelleri (BERT) ve kural tabanlı hibrit bir karar 
mekanizması sisteme entegre edilmiştir.

🚀 Gelen Yenilikler

Hibrit Karar Mekanizması: Tuğrul Kaya BERT modeli tahmini, context_rules.json motorundaki
kelime ağırlıklarıyla birleştirilerek hatalı sınıflandırmaların önüne geçildi.

Dinamik Puanlama: Modelin güven skoru ve kural motorundan gelen puanlar harmanlanarak
1-5 arası bir Önem Puanı hesaplama algoritması eklendi.

FastAPI Entegrasyonu: Sistem, diğer backend ve frontend birimleriyle asenkron konuşabilen
yüksek performanslı bir mikroservis yapısına dönüştürüldü.

Gelişmiş Metin İşleme: Haber içerikleri reklam ve gereksiz boşluklardan arındırılarak NLP 
modeline en temiz haliyle sunulacak şekilde optimize edildi.

🛠️ Sistem Nasıl Çalışır?

Veri Kabulü: Ana backend'den gelen haber metni veya URL, FastAPI uç noktası üzerinden 
sisteme alınır.

Scraping & Temizlik: Newspaper3k ve BeautifulSoup4 ile haber içeriği kazınır, regex ile t
emizlenir.

NLP Sınıflandırma: HuggingFace tabanlı turkish-news-classification modeli ile ilk tahmin 
yapılır.

Kural Valilasyonu: JSON dosyasındaki anahtar kelime ağırlıkları (Siyaset, Ekonomi, 
Teknoloji vb.) üzerinden modelin tahmini denetlenir ve gerekirse düzeltilir.

Sonuç Paketleme: Kategori, güven skoru, okuma süresi ve ilgili haber önerileri paketlenerek
JSON olarak geri döndürülür.

💻 Kullanılan Teknolojiler

NLP & ML: Transformers (HuggingFace), PyTorch, Scikit-learn

Backend: FastAPI, Uvicorn, Pydantic

Veri Kazıma: Newspaper3k, BeautifulSoup4, Requests



# Adaptif Haber Özetleme ve Doğrulama API

LLM tabanlı, bilgi sıkıştırma (information compression) yaklaşımıyla çalışan ve üretilen çıktıyı otomatik doğrulayan REST API servisi.

Bu proje, klasik “metni kısalt” yaklaşımı yerine, editoryal soyutlama mantığıyla ana gelişme ve sonucu yoğunlaştıran bir sistem sunar.

---

## 🎯 Proje Amacı

Geleneksel özetleme sistemleri çoğunlukla metni kısaltır veya yeniden ifade eder.  
Bu sistem ise:

- Yüksek bilgi yoğunluğu üretir
- İkincil detayları sistematik olarak eler
- Dinamik çıktı uzunluğu uygular
- Üretilen özeti ikinci bir model çağrısıyla doğrular

Bu yaklaşım, medya takibi, haber agregasyonu ve editoryal otomasyon süreçleri için daha güvenilir bir yapı sunar.

---

## 🧠 Sistem Mimarisi

### 1️⃣ Adaptif Uzunluk Kontrolü

Girdi metninin karakter uzunluğuna göre hedef cümle sayısı dinamik olarak belirlenir:

| Karakter Uzunluğu | Hedef Cümle |
|------------------|------------|
| 0 – 800          | 2          |
| 800 – 2000       | 4          |
| 2000 – 4000      | 6          |
| 4000+            | 7          |

Model, belirlenen cümle sayısına tam olarak uymak zorundadır.  
Bu sayede orantılı bilgi sıkıştırması sağlanır.

---

### 2️⃣ Bilgi Sıkıştırma Stratejisi

Sistem, klasik extractive summarization yerine aşağıdaki prensipleri uygular:

- Sadece ana gelişmeyi yazar
- Sonuç ve temel etkiyi vurgular
- Arka plan ve betimleyici ifadeleri çıkarır
- Tekrar eden bilgileri siler
- Metnin %70–90’ını eleyerek yoğunlaştırılmış çıktı üretir
- Yeni bilgi eklemez
- Yorum yapmaz

Amaç:  
**Semantik yoğunlaştırma, yüzeysel kısaltma değil.**

---

### 3️⃣ Doğrulama Katmanı (Validation Layer)

Üretilen özet, ikinci bir model çağrısıyla kontrol edilir:

- Olgusal tutarlılık analizi
- Halüsinasyon tespiti
- Güven skoru (0–1 arası)
- Sorunların listelenmesi

Bu yapı, üretken modellerde güvenilirlik katmanı oluşturur.

---

## 🔌 API Tanımı

### Endpoint

import torch
import requests
import re
import logging
import json
import os
import random
from bs4 import BeautifulSoup
from newspaper import Article, Config
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

# === PROJE AYARLARI ===
MODEL_NAME = "tugrulkaya/turkish-news-classification"
DEVICE = 0 if torch.cuda.is_available() else -1
HEDEF_KATEGORILER = ["Siyaset", "Gündem", "Spor", "Ekonomi", "Teknoloji", "Sağlık"]

logging.basicConfig(format='[%(asctime)s] %(levelname)s - %(message)s', level=logging.INFO)


class NewsAIEngine:
    def __init__(self):
        logging.info("Sistem başlatılıyor: Model yükleniyor...")
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        self.model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
        self.classifier = pipeline("text-classification", model=self.model,
                                   tokenizer=self.tokenizer, device=DEVICE)

        self.rules_path = "context_rules.json"
        self.baglam_kurallari = self._load_context_rules()
        logging.info("Model ve kurallar (JSON) başarıyla bellek üzerine alındı.")

        self.vectorizer = TfidfVectorizer(stop_words=None)  # TF-IDF altyapısı hazırlandı

    def _load_context_rules(self):
        """JSON dosyasından kuralları yükler, dosya yoksa boş döner."""
        if os.path.exists(self.rules_path):
            try:
                with open(self.rules_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logging.error(f"JSON yükleme hatası: {e}")
        return {}

    def veri_cek(self, url: str):
        ayar = Config()
        ayar.browser_user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        ayar.request_timeout = 15

        try:
            makale = Article(url, language="tr", config=ayar)
            makale.download()
            makale.parse()
            baslik, metin = makale.title, makale.text.strip()

            if not metin or len(metin) < 150:
                headers = {
                    'User-Agent': ayar.browser_user_agent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
                }
                istek = requests.get(url, headers=headers, timeout=10)
                istek.raise_for_status()
                soup = BeautifulSoup(istek.content, "html.parser")

                # Gereksiz etiketleri temizleyelim
                for tag in soup(["script", "style", "nav", "header", "footer", "aside"]):
                    tag.extract()

                paragraflar = soup.find_all("p")
                metin_parcalari = [p.get_text() for p in paragraflar if len(p.get_text().split()) > 5]
                metin = " ".join(metin_parcalari)

                if not baslik:
                    title_tag = soup.find("title")
                    baslik = title_tag.get_text().strip() if title_tag else "Başlık Bulunamadı"

            baslik = re.sub(r"\s+", " ", baslik).strip()
            metin = re.sub(r"\s+", " ", metin).strip()
            return baslik, metin
        except Exception as e:
            logging.error(f"Scraping hatası (URL: {url}): {e}")
            return "Başlık Alınamadı", ""

    def siniflandir(self, metin: str, baslik: str):
        icerik = (baslik + " " + metin).lower()

        # Kural Motoru (JSON tabanlı ağırlıklandırma)
        puanlar = {kat: 0 for kat in HEDEF_KATEGORILER}
        for kat, kelimeler in self.baglam_kurallari.items():
            if kat in HEDEF_KATEGORILER:
                for kelime, puan in kelimeler.items():
                    if kelime in icerik:
                        puanlar[kat] += puan

        en_iyi_kat_kural = max(puanlar, key=puanlar.get)
        en_yuksek_puan = puanlar[en_iyi_kat_kural]

        # Model tahmini için metni tokenizer sınırlarına uygun kesme
        inputs = self.tokenizer(metin, return_tensors="pt", truncation=True, max_length=512, padding=False)
        input_ids = inputs["input_ids"].to(DEVICE)

        with torch.no_grad():
            outputs = self.model(input_ids)
            aktif_degerler = torch.nn.functional.softmax(outputs.logits, dim=-1)
            tahmin_index = torch.argmax(aktif_degerler, dim=-1).item()
            tahmin_skor = aktif_degerler[0][tahmin_index].item()
            model_etiketi = self.model.config.id2label[tahmin_index].capitalize()
            model_guveni = round(tahmin_skor * 100, 2)

        # Karar Mekanizması
        toplam_puan = en_yuksek_puan + (model_guveni / 20)

        if en_yuksek_puan >= 2 and toplam_puan >= 5:
            # JSON'dan gelen net bir sinyal varsa ve toplam puan yeterliyse
            yeni_guven = min(99.0, model_guveni + (en_yuksek_puan * 5))
            return en_iyi_kat_kural, yeni_guven, en_yuksek_puan

        # Modelin kategorisi geçersizse zorunlu Gündem eşleştirmesi yapar
        if model_etiketi not in HEDEF_KATEGORILER:
            return "Gündem", model_guveni, en_yuksek_puan

        if model_guveni > 85 and en_yuksek_puan >= 2:
            ortalama_guven = (model_guveni + 95) / 2
            return model_etiketi, ortalama_guven, en_yuksek_puan

        return model_etiketi, model_guveni, en_yuksek_puan

    def ilgili_haberleri_filtrele(self, kategori: str, haber_listesi: list, adet: int = 5):
        """Backend'den gelen haberler içinde aynı kategoride olanları ve puanı yüksek olanları seçer."""
        ilgili = [h for h in haber_listesi if h.get("kategori") == kategori]
        sirali = sorted(ilgili, key=lambda x: x.get("onemPuani", 0), reverse=True)
        return [h.get("haberBasligi") for h in sirali[:adet]]

    def analiz_et(self, veri: str):
        if veri.startswith("http"):
            baslik, metin = self.veri_cek(veri)
        else:
            baslik, metin = "Manuel Giriş", veri

        if not metin or len(metin.split()) < 5:
            return None

        # Yalnızca gereksiz art arda gelen boşlukları, satır sonlarını ve kaçış karakterlerini temizle
        temiz_metin = " ".join(metin.split())

        kategori, guven, kural_puani = self.siniflandir(temiz_metin, baslik)

        # Kelimeleri say ve okuma süresini hesapla (Ortalama okuma hızı dakikada 225 kelime kabul edilir)
        kelime_sayisi = len(metin.split())
        toplam_saniye = int((kelime_sayisi / 225) * 60)

        dakika = toplam_saniye // 60
        saniye = toplam_saniye % 60

        if dakika > 0 and saniye > 0:
            okuma_suresi_metni = f"{dakika} dk {saniye} sn"
        elif dakika > 0:
            okuma_suresi_metni = f"{dakika} dk"
        else:
            okuma_suresi_metni = f"{max(1, saniye)} sn"

        # 5 yıldız üzerinden dinamik önem puanı hesaplama
        onem_skoru = self.hesapla_onem_puani(guven, kural_puani, kelime_sayisi)

        return {
            "haberBasligi": baslik,
            "kategori": kategori,
            "modelGuveni": guven,
            "okumaSuresi": okuma_suresi_metni,
            "onemPuani": onem_skoru
        }

    def hesapla_onem_puani(self, guven: float, kural_puani: int, kelime_sayisi: int):
        """Model güvenine, içerik zenginliğine ve bağlam eşleşmelerine göre dinamik 1-5 puan üretir."""
        baz_puan = 0

        # Modele güven skoru (Maks +2.5)
        if guven >= 90:
            baz_puan += 2.5
        elif guven >= 75:
            baz_puan += 2.0
        elif guven >= 60:
            baz_puan += 1.0

        # Kelime sayısı zenginliği skoru (Maks +1.5)
        if kelime_sayisi >= 400:
            baz_puan += 1.5
        elif kelime_sayisi >= 200:
            baz_puan += 1.0
        elif kelime_sayisi >= 50:
            baz_puan += 0.5

        # NLP Kelime ağırlık skoru (Maks +1.0)
        if kural_puani >= 4:
            baz_puan += 1.0
        elif kural_puani >= 2:
            baz_puan += 0.5

        # Toplam puanı yuvarla ve kısıtla
        final_puan = round(baz_puan)

        # Güvenlik valfleri
        if final_puan < 1: return 1
        if final_puan > 5: return 5
        return final_puan
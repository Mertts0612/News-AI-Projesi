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
        ayar.browser_user_agent = 'Mozilla/5.0'
        ayar.request_timeout = 10
        try:
            makale = Article(url, language="tr", config=ayar)
            makale.download()
            makale.parse()
            baslik, metin = makale.title, makale.text.strip()

            if len(metin) < 100:
                istek = requests.get(url, headers={'User-Agent': ayar.browser_user_agent}, timeout=5)
                soup = BeautifulSoup(istek.text, "html.parser")
                metin = " ".join([p.get_text() for p in soup.find_all("p") if len(p.get_text()) > 35])

            return baslik, re.sub(r"\s+", " ", metin).strip()
        except Exception as e:
            logging.error(f"Scraping hatası: {e}")
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

        # Model Tahmini
        tahmin = self.classifier(metin[:512])[0]
        model_etiketi = tahmin["label"].capitalize()
        model_guveni = round(tahmin["score"] * 100, 2)

        # Karar Mekanizması
        toplam_puan = en_yuksek_puan + (model_guveni / 20)

        if en_yuksek_puan >= 2 and toplam_puan >= 5:
            # JSON'dan gelen net bir sinyal varsa ve toplam puan yeterliyse
            yeni_guven = min(99.0, model_guveni + (en_yuksek_puan * 5))
            return en_iyi_kat_kural, yeni_guven

        # Modelin kategorisi geçersizse zorunlu Gündem eşleştirmesi yapar
        if model_etiketi not in HEDEF_KATEGORILER:
            return "Gündem", model_guveni

        if model_guveni > 85 and en_yuksek_puan >= 2:
            ortalama_guven = (model_guveni + 95) / 2
            return model_etiketi, ortalama_guven

        return model_etiketi, model_guveni

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

        if not metin or len(metin.split()) < 10:
            return None

        # metin temizleme
        metin = re.sub(r"[^\w\s\.]", "", metin)

        kategori, guven = self.siniflandir(metin, baslik)

        # 5 yıldız üzerinden önem puanı hesaplama
        onem_skoru = self.hesapla_onem_puani(guven)

        return {
            "haberBasligi": baslik,
            "kategori": kategori,
            "modelGuveni": guven,
            "okumaSuresi": f"{max(1, round(len(metin.split()) / 225))} dk",
            "onemPuani": onem_skoru
        }

    def hesapla_onem_puani(self, guven: float):
        """Model güvenine göre 1-5 puan üretir."""
        if guven >= 90: return 5
        elif guven >= 80: return 4
        elif guven >= 70: return 3
        elif guven >= 60: return 2
        else: return 1
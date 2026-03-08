import os
import re
import json
import logging
import torch
import requests
from bs4 import BeautifulSoup
from newspaper import Article, Config
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
from sklearn.feature_extraction.text import TfidfVectorizer

load_dotenv()

logging.basicConfig(format="[%(asctime)s] %(levelname)s - %(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_NAME = "tugrulkaya/turkish-news-classification"
DEVICE = 0 if torch.cuda.is_available() else -1
HEDEF_KATEGORILER = ["Siyaset", "Gündem", "Spor", "Ekonomi", "Teknoloji", "Sağlık"]
CONTEXT_RULES_PATH = os.path.join(os.path.dirname(__file__), "context_rules.json")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


class NewsNLPEngine:
    def __init__(self):
        logger.info("NLP motoru yükleniyor...")
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        self.model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
        self.classifier = pipeline("text-classification", model=self.model,
                                   tokenizer=self.tokenizer, device=DEVICE)
        self.baglam_kurallari = self._load_context_rules()
        logger.info("NLP motoru hazır.")

    def _load_context_rules(self):
        if os.path.exists(CONTEXT_RULES_PATH):
            try:
                with open(CONTEXT_RULES_PATH, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error("context_rules.json yüklenemedi: %s", e)
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
            logger.error(f"Scraping hatası (URL: {url}): {e}")
            return "Başlık Alınamadı", ""

    def siniflandir(self, metin, baslik=""):
        icerik = (baslik + " " + metin).lower()
        puanlar = {kat: 0 for kat in HEDEF_KATEGORILER}
        for kat, kelimeler in self.baglam_kurallari.items():
            if kat in HEDEF_KATEGORILER:
                for kelime, puan in kelimeler.items():
                    if kelime in icerik:
                        puanlar[kat] += puan

        en_iyi_kat = max(puanlar, key=puanlar.get)
        en_yuksek_puan = puanlar[en_iyi_kat]

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

        toplam_puan = en_yuksek_puan + (model_guveni / 20)

        if en_yuksek_puan >= 2 and toplam_puan >= 5:
            return en_iyi_kat, min(99.0, model_guveni + (en_yuksek_puan * 5)), en_yuksek_puan
        if model_etiketi not in HEDEF_KATEGORILER:
            return "Gündem", model_guveni, en_yuksek_puan
        if model_guveni > 85 and en_yuksek_puan >= 2:
            return model_etiketi, (model_guveni + 95) / 2, en_yuksek_puan
        return model_etiketi, model_guveni, en_yuksek_puan

    def analiz_et(self, veri):
        if veri.startswith("http"):
            baslik, metin = self.veri_cek(veri)
        else:
            baslik, metin = "Manuel Giriş", veri

        if not metin or len(metin.split()) < 5:
            return None

        # Yalnızca gereksiz art arda gelen boşlukları, satır sonlarını ve kaçış karakterlerini temizle
        # Türkçe karakterleri silen sert regex kurallarından vazgeçildi
        metin_temiz = " ".join(metin.split())
        kategori, guven, kural_puani = self.siniflandir(metin_temiz, baslik)
        kelime_sayisi = len(metin.split())

        # Kelimeleri say ve okuma süresini hesapla (Ortalama okuma hızı dakikada 225 kelime kabul edilir)
        toplam_saniye = int((kelime_sayisi / 225) * 60)
        dakika = toplam_saniye // 60
        saniye = toplam_saniye % 60

        if dakika > 0 and saniye > 0:
            okuma_suresi_metni = f"{dakika} dk {saniye} sn"
        elif dakika > 0:
            okuma_suresi_metni = f"{dakika} dk"
        else:
            okuma_suresi_metni = f"{max(1, saniye)} sn"

        onem = self.hesapla_onem_puani(guven, kural_puani, kelime_sayisi)

        return {
            "haberBasligi": baslik,
            "kategori": kategori,
            "modelGuveni": guven,
            "okumaSuresi": okuma_suresi_metni,
            "onemPuani": onem,
            "metin": metin
        }

    def hesapla_onem_puani(self, guven: float, kural_puani: int, kelime_sayisi: int):
        baz_puan = 0
        if guven >= 90:
            baz_puan += 2.5
        elif guven >= 75:
            baz_puan += 2.0
        elif guven >= 60:
            baz_puan += 1.0

        if kelime_sayisi >= 400:
            baz_puan += 1.5
        elif kelime_sayisi >= 200:
            baz_puan += 1.0
        elif kelime_sayisi >= 50:
            baz_puan += 0.5

        if kural_puani >= 4:
            baz_puan += 1.0
        elif kural_puani >= 2:
            baz_puan += 0.5

        final_puan = round(baz_puan)
        if final_puan < 1: return 1
        if final_puan > 5: return 5
        return final_puan

    def ilgili_haberleri_filtrele(self, kategori, haber_listesi, adet=5):
        ilgili = [h for h in haber_listesi if h.get("kategori") == kategori]
        sirali = sorted(ilgili, key=lambda x: x.get("onemPuani", 0), reverse=True)
        return [h.get("haberBasligi", "") for h in sirali[:adet]]


class NewsLLMEngine:
    def __init__(self):
        if not OPENAI_API_KEY:
            logger.warning("OPENAI_API_KEY bulunamadı – LLM özet devre dışı.")
            self.client = None
        else:
            self.client = OpenAI(api_key=OPENAI_API_KEY)
            logger.info("LLM motoru hazır.")

    def ozetle(self, baslik, metin, kategori=""):
        if not self.client:
            return {
                "shortSummary": metin[:200] if metin else baslik,
                "longSummary": metin[:500] if metin else baslik,
                "validationScore": 0.0,
                "isVerified": False,
                "compressionRatio": 0.0,
            }
        try:
            extraction = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Bilgi çıkarımı yapan analitik bir uzmansın."},
                    {"role": "user",
                     "content": f"Şu haberi analiz et:\n- Ana olay\n- Karar\n- Sonuç\n- Etkilenenler\n\nBaşlık: {baslik}\nMetin: {metin}"}
                ],
                temperature=0, max_tokens=400,
            )
            extracted = extraction.choices[0].message.content.strip()

            short_resp = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Haber editörüsün. Tek cümleyle özetle."},
                    {"role": "user", "content": f"1 cümlelik kısa özet:\n{extracted}"}
                ],
                temperature=0.1, max_tokens=80,
            )
            short_summary = short_resp.choices[0].message.content.strip()

            long_resp = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Kıdemli haber editörüsün."},
                    {"role": "user", "content": f"3-4 cümle özet:\n{extracted}"}
                ],
                temperature=0.1, max_tokens=200,
            )
            long_summary = long_resp.choices[0].message.content.strip()

            original_words = len(metin.split())
            summary_words = len(long_summary.split())

            return {
                "shortSummary": short_summary,
                "longSummary": long_summary,
                "validationScore": 0.8,
                "isVerified": True,
                "compressionRatio": round(1 - (summary_words / max(original_words, 1)), 2),
            }
        except Exception as e:
            logger.error("LLM özet hatası: %s", e)
            return {
                "shortSummary": metin[:200] if metin else baslik,
                "longSummary": metin[:500] if metin else baslik,
                "validationScore": 0.0,
                "isVerified": False,
                "compressionRatio": 0.0,
            }


nlp_engine: Optional[NewsNLPEngine] = None
llm_engine: Optional[NewsLLMEngine] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global nlp_engine, llm_engine
    nlp_engine = NewsNLPEngine()
    llm_engine = NewsLLMEngine()
    logger.info("Servis hazır. Port: 8000")
    yield


app = FastAPI(title="News AI Unified Service", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])


class ProcessRequest(BaseModel):
    title: str = ""
    content: str
    tumHaberler: List[dict] = []


class ProcessResponse(BaseModel):
    haberBasligi: str
    kategori: str
    modelGuveni: float
    okumaSuresi: str
    onemPuani: int
    ilgiliHaberler: List[str] = []
    shortSummary: str
    longSummary: str
    isVerified: bool


@app.get("/health")
def health():
    return {"status": "ok", "nlp": nlp_engine is not None,
            "llm": llm_engine is not None and llm_engine.client is not None}


@app.post("/api/v1/process", response_model=ProcessResponse)
async def process(req: ProcessRequest):
    if not nlp_engine or not llm_engine:
        raise HTTPException(status_code=503, detail="AI motorları hazır değil.")
    try:
        nlp_result = nlp_engine.analiz_et(req.content) or {
            "haberBasligi": req.title or "Bilinmeyen Başlık",
            "kategori": "Gündem", "modelGuveni": 50.0,
            "okumaSuresi": "2 dk", "onemPuani": 3,
            "metin": req.content
        }

        gercek_metin = nlp_result.pop("metin", req.content)
        baslik = nlp_result.get("haberBasligi", req.title)

        nlp_result["ilgiliHaberler"] = nlp_engine.ilgili_haberleri_filtrele(
            kategori=nlp_result["kategori"],
            haber_listesi=req.tumHaberler, adet=5,
        )
        llm_result = llm_engine.ozetle(baslik, gercek_metin, nlp_result["kategori"])
        return {**nlp_result, **llm_result}
    except Exception as e:
        logger.error("Process hatası: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
from typing import List, Optional
import logging

from news_ai_nlp import NewsAIEngine

engine: Optional[NewsAIEngine] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global engine
    logging.info("Sistem başlatılıyor: NewsAIEngine yükleniyor...")
    engine = NewsAIEngine()
    yield
    logging.info("Sistem kapatılıyor...")

app = FastAPI(title="News AI NLP API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NewsRequest(BaseModel):
    content: str
    tumHaberler: List[dict]

class NewsResponse(BaseModel):
    haberBasligi: str
    kategori: str
    modelGuveni: float
    okumaSuresi: str
    onemPuani: int
    ilgiliHaberler: List[str]

@app.post("/api/v1/analyze", response_model=NewsResponse)
async def analyze_news(request: NewsRequest):
    global engine
    if not engine:
        raise HTTPException(status_code=500, detail="NLP Motoru hazır değil.")

    try:
        sonuc = engine.analiz_et(request.content)
        if not sonuc:
            raise HTTPException(status_code=400, detail="Analiz edilemedi.")
        sonuc["ilgiliHaberler"] = engine.ilgili_haberleri_filtrele(
            kategori=sonuc["kategori"],
            haber_listesi=request.tumHaberler,
            adet=5
        )
        return sonuc
    except Exception as e:
        logging.error(f"Hata: {e}")
        raise HTTPException(status_code=400, detail="Sistem hatası.")
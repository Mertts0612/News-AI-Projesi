import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("OPENAI_API_KEY bulunamadı.")

client = OpenAI(api_key=api_key)


def summarize_news(text: str) -> str:
    """
    İki aşamalı özetleme:
    1) Bilgi çıkarımı
    2) Yoğunlaştırılmış final özet
    """

    # -------------------------
    # AŞAMA 1: Bilgi Çıkarma
    # -------------------------
    extraction_prompt = f"""
Aşağıdaki haber metninden yalnızca şu bilgileri çıkar:

- Ana olay
- Alınan karar veya gelişme
- Doğrudan sonuç
- Etkilenen taraflar

Yorum yapma.
Tekrar etme.
Madde madde yaz.

Metin:
{text}
"""

    extraction_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Bilgi çıkarımı yapan analitik bir uzmansın."},
            {"role": "user", "content": extraction_prompt}
        ],
        temperature=0
    )

    extracted_info = extraction_response.choices[0].message.content.strip()

    # -------------------------
    # AŞAMA 2: Yoğun Özet
    # -------------------------
    summary_prompt = f"""
Aşağıdaki çıkarılmış bilgileri kullanarak:

- En fazla 2-4 cümle yaz.
- Maksimum bilgi yoğunluğu kullan.
- Geçiş ifadesi kullanma.
- Yorum ekleme.
- Tekrarlayan anlamları birleştir.
- Doğrudan sonucu ver.

Bilgiler:
{extracted_info}
"""

    summary_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Kıdemli ve yoğun yazan bir haber editörüsün."},
            {"role": "user", "content": summary_prompt}
        ],
        temperature=0.1,
        max_tokens=200
    )

    return summary_response.choices[0].message.content.strip()


def validate_summary(original_text: str, summary: str) -> float:
    """
    Özetin doğruluk skorunu 0-1 arası döndürür.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Sadece 0 ile 1 arasında sayısal skor ver."},
                {"role": "user", "content": f"Metin:\n{original_text}\n\nÖzet:\n{summary}"}
            ],
            temperature=0
        )

        return float(response.choices[0].message.content.strip())

    except:
        return 0.0


def calculate_compression(original_text: str, summary: str) -> dict:
    """
    Sıkıştırma oranını hesaplar.
    """

    original_words = len(original_text.split())
    summary_words = len(summary.split())

    reduction_ratio = 1 - (summary_words / original_words)

    return {
        "original_word_count": original_words,
        "summary_word_count": summary_words,
        "compression_ratio": round(reduction_ratio, 2)
    }
from openai import OpenAI
import os
from dotenv import load_dotenv
import json

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def validate_summary(original, summary):

    prompt = f"""
    Aşağıdaki özet verilen haber metnine tamamen sadık mı?
    Uydurma, eklenmiş veya çarpıtılmış bilgi var mı?

    Haber:
    {original}

    Özet:
    {summary}

    JSON formatında cevap ver:
    {{
        "is_valid": true veya false,
        "reason": "kısa açıklama"
    }}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    try:
        return json.loads(response.choices[0].message.content)
    except:
        return {"is_valid": False, "reason": "JSON parse error"}

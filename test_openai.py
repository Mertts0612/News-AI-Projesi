from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    print("API key bulunamadı!")
    exit()

client = OpenAI(api_key=api_key)

try:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": "Merhaba, çalışıyor musun?"}
        ],
        temperature=0
    )

    print("BAĞLANTI BAŞARILI")
    print(response.choices[0].message.content)

except Exception as e:
    print("HATA VAR:")
    print(e)

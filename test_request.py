import requests
import json

# API adresi
URL = "http://localhost:5000/summarize"

# Uzun test metni
text = """Türkiye Cumhuriyet Merkez Bankası (TCMB), yılın son Para Politikası Kurulu toplantısında politika faizini 500 baz puan artırarak yüzde 45 seviyesine yükseltti. Banka, karar metninde enflasyonla mücadelede kararlı duruşun sürdürüleceğini ve fiyat istikrarı sağlanana kadar sıkı para politikasının devam edeceğini vurguladı. Açıklamada, son aylarda iç talebin güçlü seyrini koruduğu, hizmet enflasyonunda ise katılık gözlendiği belirtildi.

TCMB, enflasyon beklentilerindeki bozulmanın kontrol altına alınması amacıyla ek parasal sıkılaştırma adımlarının gündeme gelebileceğini ifade etti. Ayrıca kredi büyümesine yönelik makro ihtiyati tedbirlerin sürdürüleceği kaydedildi. Banka, para politikasındaki sıkı duruşun cari dengede iyileşmeye katkı sağladığını ve Türk lirasındaki oynaklığın azaldığını bildirdi.

Kararın ardından döviz kurlarında sınırlı bir gerileme görülürken, Borsa İstanbul’da bankacılık hisseleri öncülüğünde yükseliş yaşandı. Analistler, faiz artışının piyasa beklentileriyle büyük ölçüde uyumlu olduğunu ve Merkez Bankası’nın kredibilitesini güçlendirdiğini değerlendirdi. Uluslararası yatırım kuruluşları ise kararın yabancı sermaye girişlerini destekleyebileceğini belirtti.

Öte yandan reel sektör temsilcileri, yüksek faiz oranlarının finansman maliyetlerini artırdığını ve yatırım iştahını sınırlayabileceğini ifade etti. Sanayi odaları tarafından yapılan açıklamalarda, fiyat istikrarının önemine dikkat çekilmekle birlikte üretim tarafında dengeli bir geçiş sürecine ihtiyaç olduğu vurgulandı.

Ekonomistler, mevcut politika setinin enflasyonu orta vadede düşürme potansiyeline sahip olduğunu ancak mali disiplin ve yapısal reformlarla desteklenmesi gerektiğini dile getirdi. Yıl sonu enflasyon beklentisi yüzde 65 civarında şekillenirken, 2025 yılı için kademeli bir düşüş öngörülüyor.
"""

payload = {
    "text": text
}

try:
    response = requests.post(URL, json=payload)

    print("\nStatus Code:", response.status_code)
    print("\n------------------- RESPONSE -------------------\n")

    result = response.json()

    summary = result.get("summary", "")
    validation_score = result.get("validation_score", "N/A")

    # Compression hesaplama
    original_len = len(text.split())
    summary_len = len(summary.split())
    compression_ratio = round(summary_len / original_len, 2) if original_len > 0 else 0

    print("Summary:\n", summary)
    print("\nValidation Score:", validation_score)
    print("Compression Ratio:", compression_ratio)

except Exception as e:
    print("ERROR:", str(e))
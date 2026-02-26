from flask import Flask, request, jsonify
from summarizer import summarize_news, validate_summary, calculate_compression

app = Flask(__name__)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "ok",
        "message": "News Summarizer API aktif."
    })


@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "text alanı gerekli"}), 400

    text = data["text"]

    if not text.strip():
        return jsonify({"error": "Metin boş olamaz"}), 400

    try:
        summary = summarize_news(text)
        score = validate_summary(text, summary)
        compression = calculate_compression(text, summary)

        return jsonify({
            "summary": summary,
            "validation_score": score,
            "compression": compression
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
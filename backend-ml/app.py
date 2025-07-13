from flask import Flask, request, jsonify
"""
Flask API untuk backend ML
Digunakan untuk menerima request rekomendasi dosen dari Node.js
"""
from model import recommend_lecturers

app = Flask(__name__)

@app.route("/recommend", methods=["GET", "POST"])
    # Endpoint utama rekomendasi dosen
def recommend():
    # Ambil data judul/topik skripsi dan data dosen dari request
    try:
        data = request.get_json()
        # Ambil field judul/topik skripsi dari topic_text atau thesisTopics
        topic_text = data.get("topic_text") or data.get("thesisTopics")
        lecturers_data = data.get("lecturers")

        if not topic_text or not lecturers_data:
            # Validasi data input
            return jsonify({"error": "Missing data"}), 400

        result = recommend_lecturers(topic_text, lecturers_data)
        # Proses rekomendasi dosen dengan ML
        return jsonify({"rekomendasi": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)
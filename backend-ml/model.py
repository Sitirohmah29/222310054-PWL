from sklearn.feature_extraction.text import TfidfVectorizer
"""
Fungsi utama ML untuk rekomendasi dosen
Melakukan preprocessing, similarity, clustering, dan ranking
"""
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
import numpy as np
import re
try:
    from Sastrawi.Stemmer.Factory import StemmerFactory
    from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
    factory = StemmerFactory()
    stemmer = factory.create_stemmer()
    stop_factory = StopWordRemoverFactory()
    stopword_remover = stop_factory.create_stop_word_remover()
except ImportError:
    stemmer = None
    stopword_remover = None

# Expanded synonym mapping
SYNONYM_MAP = {
    "pembelajaran mesin": "machine learning",
    "machine learning": "machine learning",
    "kecerdasan buatan": "artificial intelligence",
    "artificial intelligence": "artificial intelligence",
    "ai": "artificial intelligence",
    "penambangan data": "data mining",
    "data mining": "data mining",
    "pembelajaran mendalam": "deep learning",
    "deep learning": "deep learning",
    "neural network": "neural network",
    "jaringan saraf": "neural network",
    "pengembangan aplikasi mobile": "mobile development",
    "pengembangan mobile": "mobile development",
    "mobile development": "mobile development",
    "aplikasi mobile": "mobile development",
    "antarmuka pengguna": "UI/UX",
    "desain antarmuka": "UI/UX",
    "ui ux": "UI/UX",
    "user interface": "UI/UX",
    "user experience": "UI/UX",
    "pengembangan flutter": "flutter",
    "flutter": "flutter",
    "pengembangan react native": "react native",
    "react native": "react native",
    "keamanan jaringan": "network security",
    "network security": "network security",
    "keamanan cyber": "cybersecurity",
    "keamanan siber": "cybersecurity",
    "cybersecurity": "cybersecurity",
    "cyber security": "cybersecurity",
    "kriptografi": "cryptography",
    "cryptography": "cryptography",
    "enkripsi": "cryptography",
    "internet benda": "internet of things",
    "internet of things": "internet of things",
    "iot": "internet of things",
    "sistem tertanam": "embedded systems",
    "embedded systems": "embedded systems",
    "arduino": "arduino",
    "mikrokontroler": "microcontroller",
    "microcontroller": "microcontroller",
    "sistem pintar": "smart systems",
    "smart systems": "smart systems",
    "pengembangan web": "web development",
    "web development": "web development",
    "aplikasi web": "web development",
    "website": "web development",
    "basis data": "database systems",
    "database systems": "database systems",
    "sistem basis data": "database systems",
    "database": "database systems",
    "sql": "database systems",
    "sistem informasi": "information systems",
    "information systems": "information systems",
    "full stack": "full stack",
    "fullstack": "full stack",
    "backend": "backend development",
    "frontend": "frontend development",
    "front end": "frontend development",
    "back end": "backend development",
    "cloud computing": "cloud computing",
    "komputasi awan": "cloud computing",
    "blockchain": "blockchain",
    "rantai blok": "blockchain",
    "big data": "big data",
    "data besar": "big data",
    "analisis data": "data analysis",
    "data analysis": "data analysis",
    "visualisasi data": "data visualization",
    "data visualization": "data visualization",
    "python": "python programming",
    "java": "java programming",
    "javascript": "javascript programming",
    "php": "php programming",
    "pemrograman": "programming",
    "programming": "programming",
    "algoritma": "algorithms",
    "algorithms": "algorithms",
    "struktur data": "data structures",
    "data structures": "data structures",
    "computer vision": "computer vision",
    "visi komputer": "computer vision",
    "pengolahan citra": "image processing",
    "image processing": "image processing",
    "natural language processing": "natural language processing",
    "nlp": "natural language processing",
    "pemrosesan bahasa alami": "natural language processing",
    "robotika": "robotics",
    "robotics": "robotics",
    "game development": "game development",
    "pengembangan game": "game development",
    "virtual reality": "virtual reality",
    "vr": "virtual reality",
    "augmented reality": "augmented reality",
    "ar": "augmented reality",
    "realitas virtual": "virtual reality",
    "realitas tertambah": "augmented reality"
}

CUSTOM_STOPWORDS = set([
    "data", "sistem", "pengembangan", "aplikasi", "teknologi", "informasi", 
    "dan", "untuk", "dengan", "pada", "dalam", "oleh", "yang", "dosen", 
    "mahasiswa", "skripsi", "penelitian", "analisis", "metode", "teknik",
    "menggunakan", "berdasarkan", "terhadap", "implementasi", "rancang",
    "bangun", "studi", "kasus", "berbasis"
])

def synonym_replace(text):
    """Replace Indonesian terms with English equivalents"""
    # Ganti istilah Indonesia dengan padanan Inggris
    # Sort by length (longest first) to avoid partial replacements
    sorted_synonyms = sorted(SYNONYM_MAP.items(), key=lambda x: len(x[0]), reverse=True)
    
    for indo, eng in sorted_synonyms:
        text = text.replace(indo, eng)
    return text

def preprocess(text, use_stemmer=True):
    """Improved preprocessing with consistent handling"""
    # Preprocessing: lowercase, synonym, stopword, stemming
    text = text.lower()
    text = synonym_replace(text)
    text = re.sub(r'[\W_]+', ' ', text)
    
    # Remove custom stopwords
    words = text.split()
    words = [w for w in words if w not in CUSTOM_STOPWORDS and len(w) > 2]
    text = ' '.join(words)
    
    # Apply Sastrawi stopword removal
    if stopword_remover:
        text = stopword_remover.remove(text)
    
    # Apply stemming
    if use_stemmer and stemmer:
        text = stemmer.stem(text)
    
    return text

def recommend_lecturers(topic_text, lecturers_data):
    """Improved recommendation with better matching"""
    # Fungsi utama rekomendasi dosen
    # 1. Preprocessing data
    # 2. Hitung similarity judul skripsi dengan profil dosen
    # 3. Clustering berdasarkan sisa kuota
    # 4. Ranking dan return hasil
    print("Input topic_text:", topic_text)
    
    # Consistent preprocessing for both topic and profiles
    use_stemming = True  # Use same setting for both
    
    def combine_profile(d):
        bidang = ' '.join(d.get('bidang_keahlian', []))
        penelitian = ' '.join(d.get('riwayat_penelitian', []))
        publikasi = ' '.join(d.get('publikasi', []))
        # Weight bidang_keahlian more heavily
        return f"{bidang} {bidang} {bidang} {penelitian} {publikasi}"

    # Process all profiles and topic consistently
    profile_list = [preprocess(combine_profile(d), use_stemmer=use_stemming) for d in lecturers_data]
    processed_topic = preprocess(topic_text, use_stemmer=use_stemming)
    
    print("Processed topic:", processed_topic)
    for idx, profile in enumerate(profile_list):
        print(f"Processed profile {idx}: {profile}")

    # Use multiple n-gram ranges for better matching
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 3),  # Include unigrams, bigrams, and trigrams
        max_features=1000,
        min_df=1,
        stop_words='english'  # Additional English stopwords
    )
    
    try:
        tfidf_matrix = vectorizer.fit_transform(profile_list + [processed_topic])
        similarities = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1]).flatten()
        
        print("TF-IDF similarities:", similarities)
        
        # If all similarities are very low, try without stemming
        if max(similarities) < 0.1:
            print("Low similarities detected, trying without stemming...")
            profile_list_no_stem = [preprocess(combine_profile(d), use_stemmer=False) for d in lecturers_data]
            processed_topic_no_stem = preprocess(topic_text, use_stemmer=False)
            
            tfidf_matrix_no_stem = vectorizer.fit_transform(profile_list_no_stem + [processed_topic_no_stem])
            similarities_no_stem = cosine_similarity(tfidf_matrix_no_stem[-1], tfidf_matrix_no_stem[:-1]).flatten()
            
            print("No-stem similarities:", similarities_no_stem)
            
            # Use the better result
            if max(similarities_no_stem) > max(similarities):
                similarities = similarities_no_stem
                print("Using no-stem results")
        
    except Exception as e:
        print(f"TF-IDF error: {e}")
        # Fallback to simple keyword matching
        similarities = []
        for profile in profile_list:
            # Simple keyword overlap
            topic_words = set(processed_topic.split())
            profile_words = set(profile.split())
            overlap = len(topic_words.intersection(profile_words))
            total_words = len(topic_words.union(profile_words))
            similarity = overlap / total_words if total_words > 0 else 0
            similarities.append(similarity)
        similarities = np.array(similarities)

    # Add similarity scores
    for i, score in enumerate(similarities):
        lecturers_data[i]['similarityScore'] = round(float(score), 4)

    # Clustering based on sisa kuota (max_bimbingan - jumlah_bimbingan_aktif)
    sisa_kuota = np.array([[d.get('max_bimbingan', 0) - d.get('jumlah_bimbingan_aktif', 0)] for d in lecturers_data])
    if len(lecturers_data) >= 3:
        kmeans = KMeans(n_clusters=3, random_state=42, n_init='auto')
        cluster_labels = kmeans.fit_predict(sisa_kuota)
        # Pastikan cluster 2 adalah yang penuh (sisa kuota paling kecil)
        cluster_means = [np.mean(sisa_kuota[cluster_labels == i]) for i in range(3)]
        sorted_idx = np.argsort(cluster_means)
        cluster_map = {sorted_idx[0]: 2, sorted_idx[1]: 1, sorted_idx[2]: 0}
        cluster_labels = [cluster_map[c] for c in cluster_labels]
    else:
        cluster_labels = [2 if s[0] <= 0 else 0 for s in sisa_kuota]

    for i, label in enumerate(cluster_labels):
        lecturers_data[i]['cluster'] = int(label)

    # Sort by similarity (highest first)
    sorted_result = sorted(lecturers_data, key=lambda x: (-x['similarityScore'], x['cluster']))

    # Ensure ID field exists
    for d in sorted_result:
        if 'id' not in d and '_id' in d:
            d['id'] = str(d['_id'])

    # Return ALL sorted results with detailed info
    all_results = []
    for index, d in enumerate(sorted_result):
        print(f"Rank {index+1} - {d.get('nama')}: {d.get('similarityScore')}")
        all_results.append({
            "lecturerId": str(d.get("id", "")),
            "nama": d.get("nama"),
            "similarityScore": d.get("similarityScore"),
            "cluster": d.get("cluster"),
            "rank": index + 1,
            "bidang_keahlian": d.get("bidang_keahlian", []),
            "debug_processed_profile": preprocess(combine_profile(d), use_stemmer=use_stemming)[:100]
        })

    return all_results
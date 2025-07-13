import React, { useState } from "react";
// Halaman rekomendasi dosen pembimbing berdasarkan judul skripsi
import { Search, BookOpen, User } from "lucide-react";
import LecturerCard from "../components/LecturerCard";
import {
  fetchLecturers,
  saveThesisTopic,
  getRecommendations,
} from "../services/recommendationService";
import { useNavigate } from "react-router-dom";

const RecommendationPage = ({ student }) => {
  // State untuk input judul skripsi
  const [thesisTitle, setThesisTitle] = useState("");
  // State untuk daftar dosen dari backend
  const [lecturers, setLecturers] = useState([]);
  // State untuk hasil rekomendasi dosen dari backend ML
  const [recommendations, setRecommendations] = useState([]);
  // State loading saat proses rekomendasi
  const [isLoading, setIsLoading] = useState(false);
  // State modal popup feedback (sukses/gagal)
  const [modal, setModal] = useState({ show: false, type: "", message: "" });
  // Untuk navigasi antar halaman
  const navigate = useNavigate();

  // Ambil data dosen saat komponen mount
  React.useEffect(() => {
    // Ambil data dosen dari backend saat komponen mount
    fetchLecturers().then(setLecturers);
  }, []);

  const handleSubmit = async (e) => {
    // Submit judul skripsi dan request rekomendasi dosen
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simpan topik skripsi
      const topicRes = await saveThesisTopic({
        // Simpan judul skripsi ke collection thesisTopics
        judul: thesisTitle,
        abstrak: thesisTitle, // bisa diganti dengan field abstrak
        kata_kunci: [],
        bidang_penelitian: "-",
      });
      // Request rekomendasi
      const recs = await getRecommendations({
        // Request rekomendasi dosen ke backend ML
        thesis_topicsId: topicRes._id,
        topic_text: thesisTitle,
        lecturers,
      });
      setRecommendations(recs);
    } catch (err) {
      alert("Gagal mendapatkan rekomendasi");
    }
    setIsLoading(false);
  };

  const handleSelectLecturer = async (lecturer) => {
    // Handler saat mahasiswa memilih dosen
    if (!lecturer.isAvailable) {
      // Validasi kuota dosen, tampilkan modal jika penuh
      setModal({
        show: true,
        type: "error",
        message:
          "Maaf, bimbingan untuk dosen ini sudah penuh. Silakan pilih dosen lain.",
      });
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/supervisions", {
        // Simpan supervisi (relasi mahasiswa-dosen-topik) ke backend
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentsId: student._id,
          lecturersId: lecturer.lecturerId?._id || lecturer.lecturerId,
          thesisTopicsId: lecturer.thesis_topicsId || lecturer.thesis_topicsId,
          status: "pending",
        }),
      });
      if (res.status === 400) {
        // Jika kuota penuh, tampilkan error dari backend
        // Tampilkan modal sukses jika berhasil memilih dosen
        const data = await res.json();
        setModal({
          show: true,
          type: "error",
          message:
            data.error ||
            "Maaf, bimbingan untuk dosen ini sudah penuh. Silakan pilih dosen lain.",
        });
        return;
      }
      setModal({
        show: true,
        type: "success",
        message: "Berhasil memilih dosen! Status bimbingan telah diperbarui.",
      });
      setTimeout(() => {
        // Setelah sukses, pindah ke halaman selected lecturer
        setModal({ show: false, type: "", message: "" });
        navigate("/selected-lecturer");
      }, 1000);
    } catch (err) {
      setModal({
        show: true,
        type: "error",
        message: "Gagal menyimpan pilihan dosen",
      });
    }
  };

  const getMatchColor = (percentage) => {
    // Fungsi untuk menentukan warna match percentage
    if (percentage >= 80) return "text-green-600 bg-green-100";
    if (percentage >= 60) return "text-blue-600 bg-blue-100";
    if (percentage >= 40) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  console.log("Hasil rekomendasi:", recommendations);

  // Mapping hasil rekomendasi ke format yang diharapkan LecturerCard
  const mappedRecommendations = recommendations.map((rec, idx) => {
    // Mapping hasil rekomendasi ke format yang diharapkan LecturerCard
    // Card disabled hanya jika jumlah bimbingan aktif >= max bimbingan
    // Card disabled hanya jika jumlah bimbingan aktif >= max bimbingan
    let maxBimbingan = Number(rec.lecturerId?.max_bimbingan || 0);
    let jumlahAktif = rec.lecturerId?.jumlah_bimbingan_aktif || 0;
    if (typeof jumlahAktif === "string")
      jumlahAktif = parseInt(jumlahAktif, 10) || 0;
    const isAvailable = jumlahAktif < maxBimbingan;
    return {
      key: rec.lecturerId?._id || rec._id || idx,
      name: rec.lecturerId?.nama || "-",
      expertise: rec.lecturerId?.bidang_keahlian || [],
      matchPercentage: Math.round((rec.similarityScore || 0) * 100),
      isAvailable,
      currentStudents: jumlahAktif,
      maxStudents: maxBimbingan,
      researchAreas: (rec.lecturerId?.bidang_keahlian || []).join(", "),
      publications: rec.lecturerId?.publikasi?.length || 0,
      photo: <User />,
      experience: rec.lecturerId?.riwayat_penelitian?.length
        ? `${rec.lecturerId.riwayat_penelitian.length} penelitian`
        : "-",
      ...rec,
    };
  });

  return (
    // Render UI utama: input judul, hasil rekomendasi, dan modal popup
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 w-full px-0">
      {/* Modal Popup */}
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2
              className={`text-xl font-bold mb-4 ${
                modal.type === "error" ? "text-red-600" : "text-green-600"
              }`}
            >
              {modal.type === "error" ? "Gagal" : "Berhasil"}
            </h2>
            <p className="text-gray-700 mb-6">{modal.message}</p>
            <button
              className={`bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg`}
              onClick={() => setModal({ show: false, type: "", message: "" })}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
      <div className="w-full max-w-none px-0">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎓 Sistem Rekomendasi Dosen Pembimbing
          </h1>
          <p className="text-gray-600 text-lg">
            Masukkan judul skripsi untuk mendapatkan rekomendasi dosen
            pembimbing yang sesuai
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col space-y-4">
            <label
              htmlFor="thesis-title"
              className="text-lg font-semibold text-gray-700"
            >
              Judul Skripsi:
            </label>
            <div className="relative">
              <textarea
                id="thesis-title"
                value={thesisTitle}
                onChange={(e) => setThesisTitle(e.target.value)}
                placeholder="Contoh: Implementasi Machine Learning untuk Deteksi Fraud pada Sistem E-Commerce"
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none h-24"
              />
              <BookOpen className="absolute top-4 right-4 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-purple-500 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Menganalisis...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Cari Rekomendasi Dosen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {mappedRecommendations.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📋 Rekomendasi Dosen Pembimbing
            </h2>

            {mappedRecommendations.map((lecturer, index) => (
              <LecturerCard
                key={lecturer.key}
                lecturer={lecturer}
                index={index}
                getMatchColor={getMatchColor}
                onSelectLecturer={handleSelectLecturer}
              />
            ))}
          </div>
        )}

        {/* Info Section */}
        {/* <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            💡 Cara Kerja Sistem
          </h3>
          <div className="text-blue-700 space-y-2">
            <p>
              • Sistem menganalisis judul skripsi menggunakan teknik NLP
              (Natural Language Processing)
            </p>
            <p>
              • Membandingkan dengan profil keahlian setiap dosen menggunakan
              TF-IDF dan Cosine Similarity
            </p>
            <p>
              • Mempertimbangkan ketersediaan dosen berdasarkan kapasitas
              mahasiswa bimbingan
            </p>
            <p>
              • Memberikan ranking berdasarkan tingkat kesesuaian dan
              ketersediaan
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default RecommendationPage;

const express = require("express");
const router = express.Router();
const axios = require("axios");
const mongoose = require("mongoose");
const Recommendation = require("../models/Recommendations");
const Lecturer = require("../models/Lecturer"); // pastikan sudah di-import

router.post("/", async (req, res) => {
  try {
    const { thesis_topicsId, topic_text } = req.body;

    // Ambil data dosen dari database
    const lecturers = await Lecturer.find();
    // Mapping agar setiap dosen punya field 'id' yang sama dengan '_id'
    const lecturersForML = lecturers.map((l) => ({
      ...l.toObject(),
      id: l._id.toString(), // penting: id = _id
    }));

    // Kirim ke Flask ML
    const response = await axios.post("http://localhost:5000/recommend", {
      thesisTopics: topic_text,
      lecturers: lecturersForML,
    });

    // Ambil hasil rekomendasi dari backend ML
    const results = response.data.rekomendasi;
    // Pastikan hasil sudah diurutkan berdasarkan similarity score tertinggi
    const sortedResults = results.sort(
      (a, b) => b.similarityScore - a.similarityScore
    );

    // Simpan ke DB
    await Recommendation.deleteMany({ thesis_topicsId: thesis_topicsId });

    const savedRecommendation = await Promise.all(
      sortedResults.map(async (item, index) => {
        const recommendation = new Recommendation({
          lecturerId: new mongoose.Types.ObjectId(item.lecturerId),
          thesis_topicsId: thesis_topicsId,
          similarityScore: item.similarityScore,
          ranking: index + 1,
          // Simpan cluster dan isAvailable jika ingin
          cluster: item.cluster,
          isAvailable: item.isAvailable,
        });
        return await recommendation.save();
      })
    );

    // Populate data dosen setelah simpan dan urutkan berdasarkan similarity score
    const populated = await Recommendation.find({
      thesis_topicsId: thesis_topicsId,
    })
      .sort({ similarityScore: -1 })
      .populate("lecturerId");

    // Pastikan semua data dosen yang dipopulate ada
    const validPopulated = populated.filter((item) => item.lecturerId !== null);

    // Tambahkan informasi tambahan untuk frontend
    const enhancedResults = validPopulated.map((item, index) => {
      const maxBimbingan = Number(item.lecturerId?.max_bimbingan ?? 0);
      let jumlahAktif = item.lecturerId?.jumlah_bimbingan_aktif ?? 0;
      // Pastikan jumlahAktif bertipe Number
      if (typeof jumlahAktif === "string")
        jumlahAktif = parseInt(jumlahAktif, 10) || 0;
      const isAvailable = jumlahAktif < maxBimbingan;
      return {
        ...item.toObject(),
        displayRank: index + 1,
        matchPercentage: Math.round(item.similarityScore * 100),
        currentStudents: jumlahAktif,
        isAvailable,
        cluster: item.cluster,
      };
    });

    console.log(`Mengembalikan ${enhancedResults.length} rekomendasi dosen`);

    res.json(enhancedResults);
  } catch (error) {
    console.error(
      "Recommendation error:",
      error?.response?.data || error.message || error
    );
    res.status(500).json({ error: "Gagal merekomendasikan dosen" });
  }
});

module.exports = router;

const express = require("express");
// Route API untuk data dosen
const router = express.Router();
const Lecturer = require("../models/Lecturer");

// Get all lecturers
router.get("/", async (req, res) => {
  // GET semua dosen
  const lecturers = await Lecturer.find();
  res.json(lecturers);
});

// POST
router.post("/", async (req, res) => {
  // POST tambah dosen baru
  const newLecturer = new Lecturer(req.body);
  await newLecturer.save();
  res.json(newLecturer);
});

// PUT - increment jumlah_bimbingan_aktif when a student selects a lecturer
router.put("/:id/increment-jumlah-bimbingan-aktif", async (req, res) => {
  // PUT - increment jumlah_bimbingan_aktif saat mahasiswa memilih dosen
  try {
    const lecturer = await Lecturer.findById(req.params.id);
    // Cari dosen berdasarkan ID
    if (!lecturer) {
      // Jika dosen tidak ditemukan
      return res.status(404).json({ message: "Lecturer not found" });
    }
    // Check if jumlah_bimbingan_aktif sudah mencapai max_bimbingan
    if (
      (lecturer.jumlah_bimbingan_aktif || 0) >= (lecturer.max_bimbingan || 0)
    ) {
      // Validasi kuota dosen, jika penuh return error
      return res
        .status(400)
        .json({ message: "Maximum student capacity reached" });
    }
    // Increment jumlah_bimbingan_aktif
    lecturer.jumlah_bimbingan_aktif =
      (lecturer.jumlah_bimbingan_aktif || 0) + 1;
    // Increment jumlah bimbingan aktif
    await lecturer.save();
    // Simpan perubahan ke database
    res.json(lecturer);
  } catch (err) {
    console.error("Error incrementing jumlah_bimbingan_aktif:", err);
    res
      .status(500)
      .json({ message: "Failed to increment jumlah_bimbingan_aktif" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  // DELETE dosen berdasarkan ID
  await Lecturer.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Supervision = require("../models/Supervisions");
const Student = require("../models/Students");
const Lecturer = require("../models/Lecturer");
const ThesisTopics = require("../models/ThesisTopics");

// GET all supervisions, filter by studentsId if provided
router.get("/", async (req, res) => {
  try {
    const { studentsId } = req.query;
    let query = {};
    if (studentsId) query.studentsId = new mongoose.Types.ObjectId(studentsId);
    const data = await Supervision.find(query)
      .populate("studentsId")
      .populate("lecturersId")
      .populate("thesisTopicsId");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new supervision
router.post("/", async (req, res) => {
  try {
    const lecturerId = req.body.lecturersId;
    const Lecturer = require("../models/Lecturer");
    let lecturer = null;
    if (lecturerId) {
      lecturer = await Lecturer.findById(lecturerId);
      if (!lecturer) {
        return res.status(404).json({ error: "Lecturer not found" });
      }
      // Pastikan tipe data Number
      let maxBimbingan = Number(lecturer.max_bimbingan || 0);
      let jumlahAktif = Number(lecturer.jumlah_bimbingan_aktif || 0);
      // Validasi kuota bimbingan
      if (jumlahAktif >= maxBimbingan) {
        return res.status(400).json({
          error:
            "Maaf, bimbingan untuk dosen ini sudah penuh. Silakan pilih dosen lain.",
        });
      }
    }

    // Simpan supervision
    const data = new Supervision(req.body);
    await data.save();

    // Update jumlah_bimbingan_aktif
    if (lecturer) {
      lecturer.jumlah_bimbingan_aktif =
        Number(lecturer.jumlah_bimbingan_aktif || 0) + 1;
      await lecturer.save();
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require("express");
// Route API untuk data topik skripsi
const router = express.Router();
const ThesisTopics = require("../models/ThesisTopics");

router.post("/", async (req, res) => {
  // POST tambah topik skripsi baru
  // Pastikan studentsId ikut tersimpan jika ada di body
  const body = { ...req.body };
  if (!body.studentsId && req.body.studentsId) {
    body.studentsId = req.body.studentsId;
  }
  // Jika studentsId belum ada, bisa ambil dari query atau session (jika ada)
  // Untuk sekarang, ambil dari body saja
  const newThesisTopics = new ThesisTopics(body);
  await newThesisTopics.save();
  res.json(newThesisTopics);
});

router.get("/", async (req, res) => {
  // GET semua topik skripsi
  const topics = await ThesisTopics.find();
  res.json(topics);
});

module.exports = router;

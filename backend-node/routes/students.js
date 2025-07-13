const express = require("express");
const router = express.Router();
const Student = require("../models/Students");

// Get all students
router.get("/", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

// POST
router.post("/", async (req, res) => {
  const newStudent = new Student(req.body);
  await newStudent.save();
  res.json(newStudent);
});

// PUT
router.put("/:id", async (req, res) => {
  const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// Login mahasiswa
router.post("/login", async (req, res) => {
  const { nim, password } = req.body;
  const student = await Student.findOne({ nim });
  if (!student)
    return res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
  if (student.password !== password)
    return res.status(401).json({ message: "Password salah" });
  res.json({ message: "Login berhasil", student });
});

module.exports = router;

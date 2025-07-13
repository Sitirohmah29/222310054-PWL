const mongoose = require("mongoose");
const LecturerSchema = new mongoose.Schema({
  nip: String,
  nama: String,
  departemen: String,
  bidang_keahlian: [String],
  riwayat_penelitian: [String],
  publikasi: [String],
  max_bimbingan: Number,
  jumlah_bimbingan_aktif: { type: Number, default: 0 },
  status: { type: String, enum: ["aktif", "nonaktif"] },
});
module.exports = mongoose.model("Lecturer", LecturerSchema);

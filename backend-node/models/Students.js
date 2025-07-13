const mongoose = require("mongoose");
const StudentsSchema = new mongoose.Schema({
  nim: String,
  nama: String,
  program_studi: String,
  angkatan: String,
  status: { type: String, enum: ["aktif", "lulus"] },
  password: { type: String, required: true }, // tambah field password
});
module.exports = mongoose.model("Students", StudentsSchema);

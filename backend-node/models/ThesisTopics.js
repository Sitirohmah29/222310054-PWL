const mongoose = require("mongoose");
const ThesisTopicsSchema = new mongoose.Schema({
  studentsId: { type: mongoose.Schema.Types.ObjectId, ref: "Students" },
  judul: { type: String, required: true },
  abstrak: { type: String, required: true },
  kata_kunci: [String],
  bidang_penelitian: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("ThesisTopics", ThesisTopicsSchema);

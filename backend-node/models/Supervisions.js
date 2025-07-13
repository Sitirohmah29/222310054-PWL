const mongoose = require("mongoose");
const SupervisionsSchema = new mongoose.Schema({
  studentsId: { type: mongoose.Schema.Types.ObjectId, ref: "Students" },
  lecturersId: { type: mongoose.Schema.Types.ObjectId, ref: "Lecturer" },
  thesisTopicsId: { type: mongoose.Schema.Types.ObjectId, ref: "ThesisTopics" },
  tanggal_mulai: { type: Date, default: Date.now },
  tanggal_selesai: { type: Date, default: null },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
});
module.exports = mongoose.model("Supervisions", SupervisionsSchema);

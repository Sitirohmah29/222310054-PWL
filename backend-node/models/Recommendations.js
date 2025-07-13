const mongoose = require("mongoose");
const RecommendationSchema = new mongoose.Schema({
  lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: "Lecturer" },
  thesis_topicsId: { type: mongoose.Schema.Types.ObjectId, ref: "ThesisTopic" },
  similarityScore: Number,
  rangking: Number,
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Recommendations", RecommendationSchema);

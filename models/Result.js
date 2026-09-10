const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  pupilId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pupil",
    required: true,
  },
  class: { type: String, required: true },
  subject: { type: String, required: true },
  caScore: { type: Number, min: 0, max: 40, default: 0 },
  examScore: { type: Number, min: 0, max: 60, default: 0 },
  total: { type: Number, min: 0, max: 100 },
  grade: { type: String, enum: ["A", "B", "C", "D", "E", "F"] },
  term: { type: String, enum: ["First", "Second", "Third"], required: true },
  session: { type: String, required: true },
  isPublished: { type: Boolean, default: false },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Result", ResultSchema);

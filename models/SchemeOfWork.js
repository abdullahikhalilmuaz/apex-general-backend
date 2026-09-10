const mongoose = require("mongoose");

const WeekSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  topic: { type: String, required: true },
  subtopics: [String],
  completed: { type: Boolean, default: false },
  completedDate: Date,
});

const SchemeOfWorkSchema = new mongoose.Schema({
  class: { type: String, required: true },
  subject: { type: String, required: true },
  term: { type: String, enum: ["First", "Second", "Third"], required: true },
  session: { type: String, required: true },
  weeks: [WeekSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Headmaster" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SchemeOfWork", SchemeOfWorkSchema);

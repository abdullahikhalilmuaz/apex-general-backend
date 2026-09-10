const mongoose = require("mongoose");

const PupilSchema = new mongoose.Schema({
  name: { type: String, required: true },
  admissionNumber: { type: String, required: true, unique: true },
  class: { type: String, required: true },
  dateOfBirth: Date,
  parentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Parent" }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Pupil", PupilSchema);

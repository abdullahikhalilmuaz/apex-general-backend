const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  pupilId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pupil",
    required: true,
  },
  class: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["present", "absent", "late"], required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  term: { type: String, enum: ["First", "Second", "Third"] },
  session: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);

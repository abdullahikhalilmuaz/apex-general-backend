const mongoose = require('mongoose');

const LessonNoteSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  class: { type: String, required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  objectives: [String],
  teachingMaterials: [String],
  introduction: String,
  presentation: String,
  evaluation: String,
  assignment: String,
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LessonNote', LessonNoteSchema);
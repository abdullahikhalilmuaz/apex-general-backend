const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['headmaster', 'teacher', 'parent'], required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  phone: String,
  profilePicture: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
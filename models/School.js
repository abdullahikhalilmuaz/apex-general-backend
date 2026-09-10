const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: String,
  email: String,
  logo: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('School', SchoolSchema);
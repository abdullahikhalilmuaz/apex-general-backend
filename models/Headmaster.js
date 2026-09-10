const mongoose = require("mongoose");

const HeadmasterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  schoolName: { type: String, required: true },
  phone: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Headmaster", HeadmasterSchema);
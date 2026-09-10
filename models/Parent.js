const mongoose = require("mongoose");

const ParentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  relationship: { type: String, enum: ["father", "mother", "guardian"] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Parent", ParentSchema);

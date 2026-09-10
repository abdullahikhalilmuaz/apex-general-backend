const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  senderModel: {
    type: String,
    enum: ["headmaster", "teacher", "parent"],
    required: true,
  },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  receiverModel: {
    type: String,
    enum: ["headmaster", "teacher", "parent"],
    required: true,
  },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);

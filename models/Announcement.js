const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  audience: {
    type: String,
    enum: ["all", "teachers", "parents"],
    default: "all",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Headmaster",
    required: true,
  },
  eventDate: { type: Date }, // when the event happens
  expiresAt: { type: Date }, // auto-delete after 48hrs past eventDate
  createdAt: { type: Date, default: Date.now },
});

// TTL index → MongoDB auto-deletes when expiresAt is reached
AnnouncementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Announcement", AnnouncementSchema);

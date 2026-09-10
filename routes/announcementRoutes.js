const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const auth = require("../middleware/auth");

// Headmaster: create
router.post("/", auth, announcementController.createAnnouncement);

// Headmaster: get own
router.get("/", auth, announcementController.getAnnouncements);

// Teacher + Parent: get filtered
router.get("/feed", auth, announcementController.getFilteredAnnouncements);

module.exports = router;

const express = require("express");
const router = express.Router();
const parentController = require("../controllers/parentController");
const auth = require("../middleware/auth");

// Public
router.post("/register", parentController.register);

// Protected
router.get("/profile", auth, parentController.getProfile);
router.get("/children", auth, parentController.getChildren);
router.get("/stats", auth, parentController.getStats);
router.get("/recipients", auth, parentController.getRecipients); // ← ADDED
router.post("/link-child", auth, parentController.linkChild);
router.delete("/unlink-child/:pupilId", auth, parentController.unlinkChild);

module.exports = router;

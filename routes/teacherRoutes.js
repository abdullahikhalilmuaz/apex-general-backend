const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const auth = require("../middleware/auth");

// Public
router.post("/register", teacherController.register);

// Protected
router.get("/profile", auth, teacherController.getProfile);
router.get("/pupils", auth, teacherController.getPupils);
router.get("/recipients", auth, teacherController.getRecipients); // ← ADDED

module.exports = router;

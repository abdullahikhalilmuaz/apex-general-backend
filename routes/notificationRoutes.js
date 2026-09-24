const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const notifController = require("../controllers/notificationController");

// Register / unregister a device token
router.post("/register", auth, notifController.registerToken);
router.delete("/unregister", auth, notifController.unregisterToken);

module.exports = router;

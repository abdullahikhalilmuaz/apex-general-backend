const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../middleware/auth");

router.get("/", auth, messageController.getMessages);
router.post("/", auth, messageController.sendMessage);
router.put("/:id/read", auth, messageController.markAsRead);
router.get("/unread/count", auth, messageController.getUnreadCount);

module.exports = router;

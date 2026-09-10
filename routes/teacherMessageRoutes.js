const express = require("express");
const router = express.Router();
const teacherMessageController = require("../controllers/teacherMessageController");
const auth = require("../middleware/auth");

router.get("/", auth, teacherMessageController.getMessages);
router.post("/", auth, teacherMessageController.sendToHeadmaster);

module.exports = router;
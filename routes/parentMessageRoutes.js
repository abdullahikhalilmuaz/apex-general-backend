const express = require("express");
const router = express.Router();
const parentMessageController = require("../controllers/parentMessageController");
const auth = require("../middleware/auth");

router.get("/", auth, parentMessageController.getMessages);
router.post("/", auth, parentMessageController.sendToHeadmaster);

module.exports = router;
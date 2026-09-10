const express = require("express");
const router = express.Router();
const headmasterMessageController = require("../controllers/headmasterMessageController");
const auth = require("../middleware/auth");

router.get("/", auth, headmasterMessageController.getMessages);
router.get("/recipients", auth, headmasterMessageController.getRecipients);
router.post("/", auth, headmasterMessageController.sendMessage);

module.exports = router;
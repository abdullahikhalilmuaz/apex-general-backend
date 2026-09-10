const express = require("express");
const router = express.Router();
const headmasterController = require("../controllers/headmasterController");
const Headmaster = require("../models/Headmaster"); // ← ADD THIS
const auth = require("../middleware/auth");
const headmasterMessageController = require("../controllers/headmasterMessageController");

// Public
router.post("/register", headmasterController.register);

// Protected
router.get("/pupils", auth, headmasterController.getPupils);
router.post("/pupils", auth, headmasterController.addPupil);
router.put("/pupils/:id", auth, headmasterController.updatePupil);
router.delete("/pupils/:id", auth, headmasterController.deletePupil);
router.get("/recipients", auth, headmasterMessageController.getRecipients);

// Get headmaster profile
router.get("/profile", auth, async (req, res) => {
  try {
    const headmaster = await Headmaster.findById(req.user.id).select(
      "-password",
    );
    if (!headmaster) {
      return res.status(404).json({ error: "Headmaster not found" });
    }
    res.json(headmaster);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

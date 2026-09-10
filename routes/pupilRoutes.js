const express = require("express");
const router = express.Router();
const pupilController = require("../controllers/pupilController");
const auth = require("../middleware/auth");

// All routes are protected
router.get("/", auth, pupilController.getPupils);
router.get("/class/:class", auth, pupilController.getPupilsByClass);
router.get("/:id", auth, pupilController.getPupilById);
router.post("/", auth, pupilController.addPupil);
router.put("/:id", auth, pupilController.updatePupil);
router.delete("/:id", auth, pupilController.deletePupil);

module.exports = router;

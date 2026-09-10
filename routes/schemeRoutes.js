const express = require("express");
const router = express.Router();
const schemeController = require("../controllers/schemeController");
const auth = require("../middleware/auth");

// All routes require authentication

// Get all schemes (Headmaster)
router.get("/", auth, schemeController.getAllSchemes);

// Get schemes by class (Teacher & Headmaster)
router.get("/class/:class", auth, schemeController.getSchemesByClass);

// Get scheme by class & subject (Teacher & Headmaster)
router.get(
  "/class/:class/subject/:subject",
  auth,
  schemeController.getSchemeByClassAndSubject,
);

// Create scheme (Headmaster only)
router.post("/", auth, schemeController.createScheme);

// Update scheme (Headmaster only)
router.put("/:id", auth, schemeController.updateScheme);

// Delete scheme (Headmaster only)
router.delete("/:id", auth, schemeController.deleteScheme);

// Teacher marks week as completed
router.put("/:id/week", auth, schemeController.markWeekCompleted);

// Get class progress (Headmaster)
router.get("/progress/:class", auth, schemeController.getClassProgress);

module.exports = router;

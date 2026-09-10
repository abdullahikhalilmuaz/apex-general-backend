const express = require("express");
const router = express.Router();
const resultController = require("../controllers/resultController");
const auth = require("../middleware/auth");

// Teacher routes
router.post("/", auth, resultController.addResult);
router.get("/teacher", auth, resultController.getTeacherResults);
router.post("/publish", auth, resultController.publishResults);

// Parent routes
router.get("/parent/children", auth, resultController.getParentResults);
router.get(
  "/parent/child/:pupilId",
  auth,
  resultController.getParentChildResults,
);

// Headmaster routes
router.get("/headmaster/class", auth, resultController.getHeadmasterResults);
router.get(
  "/headmaster/performance",
  auth,
  resultController.getClassPerformance,
);

module.exports = router;

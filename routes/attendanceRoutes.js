const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const attendanceController = require("../controllers/attendanceController");

// Teacher routes
router.post("/mark", auth, attendanceController.markAttendance);
router.get("/teacher/today", auth, attendanceController.getTeacherAttendance);
router.get(
  "/teacher/history",
  auth,
  attendanceController.getTeacherAttendanceHistory,
);

// Headmaster routes
router.get(
  "/headmaster/class",
  auth,
  attendanceController.getHeadmasterAttendance,
);
router.get(
  "/headmaster/history",
  auth,
  attendanceController.getHeadmasterAttendanceHistory,
);

// Parent routes
router.get("/parent/children", auth, attendanceController.getParentAttendance);
router.get(
  "/parent/child/:pupilId",
  auth,
  attendanceController.getParentChildAttendance,
);

module.exports = router;

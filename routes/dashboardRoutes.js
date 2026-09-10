const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Pupil = require("../models/Pupil");
const Teacher = require("../models/Teacher");
const Attendance = require("../models/Attendance");
const LessonNote = require("../models/LessonNote"); // ← ADD
const SchemeOfWork = require("../models/SchemeOfWork"); // ← ADD
const Message = require("../models/Message"); // ← ADD

// Get dashboard stats
router.get("/stats", auth, async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalPupils, totalTeachers, presentToday, absentToday] =
      await Promise.all([
        Pupil.countDocuments({ schoolId, isActive: true }),
        Teacher.countDocuments({ schoolId, isActive: true }),
        Attendance.countDocuments({
          schoolId,
          date: { $gte: today },
          status: "present",
        }),
        Attendance.countDocuments({
          schoolId,
          date: { $gte: today },
          status: "absent",
        }),
      ]);

    res.json({
      totalPupils,
      totalTeachers,
      presentToday,
      absentToday,
      classesCompleted: 12,
      announcements: 3,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get teacher monitoring
router.get("/teachers", auth, async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const teachers = await Teacher.find({ schoolId, isActive: true })
      .populate("userId", "name email")
      .lean();

    const teachersWithAttendance = await Promise.all(
      teachers.map(async (teacher) => {
        const attendance = await Attendance.findOne({
          schoolId,
          teacherId: teacher.userId._id,
          date: { $gte: today },
        });

        return {
          name: teacher.userId.name,
          class: teacher.classAssigned || "Not Assigned",
          attendanceSubmitted: !!attendance,
        };
      }),
    );

    res.json(teachersWithAttendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Teacher stats
router.get("/teacher-stats", auth, async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const teacherId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pupils, present, absent, lessons, schemes, messages] =
      await Promise.all([
        Pupil.countDocuments({
          schoolId,
          class: req.user.class,
          isActive: true,
        }),
        Attendance.countDocuments({
          schoolId,
          teacherId,
          date: { $gte: today },
          status: "present",
        }),
        Attendance.countDocuments({
          schoolId,
          teacherId,
          date: { $gte: today },
          status: "absent",
        }),
        LessonNote.countDocuments({ schoolId, teacherId }),
        SchemeOfWork.countDocuments({ schoolId, class: req.user.class }),
        Message.countDocuments({
          schoolId,
          receiverId: teacherId,
          read: false,
        }),
      ]);

    res.json({ pupils, present, absent, lessons, schemes, messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

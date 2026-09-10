const Attendance = require("../models/Attendance");
const Pupil = require("../models/Pupil");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");

// Teacher: Mark attendance
exports.markAttendance = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ error: "Only teachers can mark attendance" });
    }

    const { class: className, attendance, term, session } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Delete existing attendance for today
    await Attendance.deleteMany({
      class: className,
      date: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
    });

    // Create new attendance records
    const records = attendance.map((item) => ({
      pupilId: item.pupilId,
      class: className,
      status: item.status,
      teacherId: req.user.id,
      date: today,
      term,
      session,
    }));

    await Attendance.insertMany(records);
    res.status(201).json({ message: "Attendance saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Teacher: Get today's attendance for their class
exports.getTeacherAttendance = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ error: "Only teachers can access this" });
    }

    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      class: teacher.classAssigned,
      date: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
    }).populate("pupilId", "name admissionNumber");

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Teacher: Get attendance history for their class
exports.getTeacherAttendanceHistory = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ error: "Only teachers can access this" });
    }

    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const attendance = await Attendance.find({
      class: teacher.classAssigned,
      date: { $gte: startDate },
    })
      .populate("pupilId", "name admissionNumber")
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Headmaster: Get all attendance for a class
exports.getHeadmasterAttendance = async (req, res) => {
  try {
    if (req.user.role !== "headmaster") {
      return res.status(403).json({ error: "Only headmasters can access this" });
    }

    const { class: className, date } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      class: className,
      date: { $gte: queryDate, $lt: new Date(queryDate.getTime() + 86400000) },
    }).populate("pupilId", "name admissionNumber");

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Headmaster: Get all attendance history for a class
exports.getHeadmasterAttendanceHistory = async (req, res) => {
  try {
    if (req.user.role !== "headmaster") {
      return res.status(403).json({ error: "Only headmasters can access this" });
    }

    const { class: className, days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const attendance = await Attendance.find({
      class: className,
      date: { $gte: startDate },
    })
      .populate("pupilId", "name admissionNumber")
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Parent: Get attendance for their children
exports.getParentAttendance = async (req, res) => {
  try {
    if (req.user.role !== "parent") {
      return res.status(403).json({ error: "Only parents can access this" });
    }

    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ error: "Parent not found" });
    }

    // Get children linked to parent
    const children = await Pupil.find({
      parentIds: req.user.id,
      isActive: true,
    });

    const childIds = children.map((c) => c._id);

    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const attendance = await Attendance.find({
      pupilId: { $in: childIds },
      date: { $gte: startDate },
    })
      .populate("pupilId", "name admissionNumber class")
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Parent: Get attendance for a specific child
exports.getParentChildAttendance = async (req, res) => {
  try {
    if (req.user.role !== "parent") {
      return res.status(403).json({ error: "Only parents can access this" });
    }

    const { pupilId } = req.params;

    // Check if child is linked to parent
    const pupil = await Pupil.findOne({
      _id: pupilId,
      parentIds: req.user.id,
      isActive: true,
    });

    if (!pupil) {
      return res.status(404).json({ error: "Child not found or not linked" });
    }

    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const attendance = await Attendance.find({
      pupilId,
      date: { $gte: startDate },
    }).sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
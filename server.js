const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

// Models
const Pupil = require("./models/Pupil");
const Teacher = require("./models/Teacher");
const Parent = require("./models/Parent");
const Attendance = require("./models/Attendance");

// Routes
const authRoutes = require("./routes/authRoutes");
const headmasterRoutes = require("./routes/headmasterRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const parentRoutes = require("./routes/parentRoutes");
const pupilRoutes = require("./routes/pupilRoutes");
const messageRoutes = require("./routes/messageRoutes");
const resultRoutes = require("./routes/resultRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const auth = require("./middleware/auth");
const schemeRoutes = require("./routes/schemeRoutes");
const parentMessageRoutes = require("./routes/parentMessageRoutes");
const teacherMessageRoutes = require("./routes/teacherMessageRoutes");
const headmasterMessageRoutes = require("./routes/headmasterMessageRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const lessonNoteRoutes = require("./routes/lessonNoteRoutes");

app.use("/api/schemes", schemeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/headmaster", headmasterRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/pupils", pupilRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/parent/messages", parentMessageRoutes);
app.use("/api/teacher/messages", teacherMessageRoutes);
app.use("/api/headmaster/messages", headmasterMessageRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/lesson-notes", lessonNoteRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API running" });
});

// Headmaster - Get teachers & parents
app.get("/api/headmasters/teachers", auth, async (req, res) => {
  const teachers = await Teacher.find();
  res.json(teachers);
});

app.get("/api/headmasters/parents", auth, async (req, res) => {
  const parents = await Parent.find();
  res.json(parents);
});

// Dashboard stats
app.get("/api/dashboard/stats", auth, async (req, res) => {
  const totalPupils = await Pupil.countDocuments({ isActive: true });
  const totalTeachers = await Teacher.countDocuments();
  const presentToday = await Attendance.countDocuments({
    status: "present",
    date: { $gte: new Date().setHours(0, 0, 0, 0) },
  });
  res.json({
    totalPupils,
    totalTeachers,
    presentToday,
    absentToday: 0,
    classesCompleted: 0,
    announcements: 0,
  });
});

app.get("/api/dashboard/teacher-stats", auth, async (req, res) => {
  const teacher = await Teacher.findById(req.user.id);
  const pupils = await Pupil.countDocuments({
    class: teacher?.classAssigned,
    isActive: true,
  });
  res.json({
    pupils,
    present: 0,
    absent: 0,
    lessons: 0,
    schemes: 0,
    messages: 0,
  });
});

app.get("/api/parents/stats", auth, async (req, res) => {
  res.json({ announcements: 0, messages: 0, averageScore: 0, attendance: 0 });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const Parent = require("../models/Parent");
const Pupil = require("../models/Pupil");
const Teacher = require("../models/Teacher");
const Headmaster = require("../models/Headmaster");
const Message = require("../models/Message");
const Result = require("../models/Result");
const Attendance = require("../models/Attendance");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register Parent
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, relationship } = req.body;

    const existing = await Parent.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const parent = new Parent({
      name,
      email,
      password: hashedPassword,
      phone,
      relationship,
    });

    await parent.save();

    const token = jwt.sign(
      { id: parent._id, email: parent.email, role: "parent" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "Parent registered successfully",
      token,
      user: {
        id: parent._id,
        name: parent.name,
        email: parent.email,
        role: "parent",
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get parent's children
exports.getChildren = async (req, res) => {
  try {
    const children = await Pupil.find({
      parentIds: req.user.id,
      isActive: true,
    });
    res.json(children);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get parent stats
exports.getStats = async (req, res) => {
  try {
    const children = await Pupil.find({
      parentIds: req.user.id,
      isActive: true,
    });
    const pupilIds = children.map((c) => c._id);

    const [messages, results, attendance] = await Promise.all([
      Message.countDocuments({ receiverId: req.user.id, read: false }),
      Result.find({ pupilId: { $in: pupilIds } }),
      Attendance.find({ pupilId: { $in: pupilIds } }),
    ]);

    const avgScore =
      results.length > 0
        ? Math.round(
            results.reduce((acc, r) => acc + r.total, 0) / results.length,
          )
        : 0;

    const presentCount = attendance.filter(
      (a) => a.status === "present",
    ).length;
    const totalDays = attendance.length || 1;

    res.json({
      announcements: 0,
      messages,
      averageScore: avgScore,
      attendance: Math.round((presentCount / totalDays) * 100),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get recipients (Headmaster + Teachers of linked children)
exports.getRecipients = async (req, res) => {
  try {
    const recipients = [];

    // Add Headmaster
    const headmaster = await Headmaster.findOne();
    if (headmaster) {
      recipients.push({
        id: headmaster._id,
        model: "headmaster",
        label: "Headmaster",
      });
    }

    // Get teachers of linked children
    const children = await Pupil.find({
      parentIds: req.user.id,
      isActive: true,
    });

    const classNames = [
      ...new Set(children.map((c) => c.class).filter(Boolean)),
    ];

    const teachers = await Teacher.find({
      classAssigned: { $in: classNames },
      isActive: true,
    });

    for (const teacher of teachers) {
      recipients.push({
        id: teacher._id,
        model: "teacher",
        label: `Teacher: ${teacher.name} (${teacher.classAssigned})`,
      });
    }

    res.json(recipients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Link child by admission number
exports.linkChild = async (req, res) => {
  try {
    const { admissionNumber } = req.body;
    const parentId = req.user.id;

    const pupil = await Pupil.findOne({ admissionNumber, isActive: true });
    if (!pupil) {
      return res.status(404).json({ error: "Pupil not found" });
    }

    if (pupil.parentIds.includes(parentId)) {
      return res.status(400).json({ error: "Child already linked" });
    }

    pupil.parentIds.push(parentId);
    await pupil.save();

    res.json({ message: "Child linked successfully", pupil });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unlink child
exports.unlinkChild = async (req, res) => {
  try {
    const { pupilId } = req.params;
    const parentId = req.user.id;

    const pupil = await Pupil.findById(pupilId);
    if (!pupil) {
      return res.status(404).json({ error: "Pupil not found" });
    }

    pupil.parentIds = pupil.parentIds.filter(
      (id) => id.toString() !== parentId.toString(),
    );
    await pupil.save();

    res.json({ message: "Child unlinked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get parent profile
exports.getProfile = async (req, res) => {
  try {
    const parent = await Parent.findById(req.user.id).select("-password");
    res.json(parent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

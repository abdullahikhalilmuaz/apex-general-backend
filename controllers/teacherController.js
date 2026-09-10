const Teacher = require("../models/Teacher");
const Pupil = require("../models/Pupil");
const Headmaster = require("../models/Headmaster");
const Parent = require("../models/Parent");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register Teacher
exports.register = async (req, res) => {
  try {
    const { name, email, password, classAssigned, subjects, phone } = req.body;

    const existing = await Teacher.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = new Teacher({
      name,
      email,
      password: hashedPassword,
      classAssigned,
      subjects,
      phone,
    });

    await teacher.save();

    const token = jwt.sign(
      { id: teacher._id, email: teacher.email, role: "teacher" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "Teacher registered successfully",
      token,
      user: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: "teacher",
        classAssigned: teacher.classAssigned,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get teacher's pupils
exports.getPupils = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const pupils = await Pupil.find({
      class: teacher.classAssigned,
      isActive: true,
    });

    res.json(pupils);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get teacher profile
exports.getProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id).select("-password");
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get recipients (Headmaster + Parents of pupils in class)
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

    // Get teacher's class
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Get pupils in teacher's class
    const pupils = await Pupil.find({
      class: teacher.classAssigned,
      isActive: true,
    });

    // Get unique parents linked to these pupils
    const parentIds = [
      ...new Set(
        pupils
          .map((p) => p.parentIds)
          .flat()
          .filter(Boolean),
      ),
    ];

    const parents = await Parent.find({ _id: { $in: parentIds } });

    for (const parent of parents) {
      recipients.push({
        id: parent._id,
        model: "parent",
        label: `Parent: ${parent.name}`,
      });
    }

    res.json(recipients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

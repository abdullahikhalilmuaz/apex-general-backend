const Headmaster = require("../models/Headmaster");
const Pupil = require("../models/Pupil");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register Headmaster
exports.register = async (req, res) => {
  try {
    const { name, email, password, schoolName, phone } = req.body;

    const existing = await Headmaster.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const headmaster = new Headmaster({
      name,
      email,
      password: hashedPassword,
      schoolName,
      phone,
    });

    await headmaster.save();

    const token = jwt.sign(
      { id: headmaster._id, email: headmaster.email, role: "headmaster" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "Headmaster registered successfully",
      token,
      user: {
        id: headmaster._id,
        name: headmaster.name,
        email: headmaster.email,
        role: "headmaster",
        schoolName: headmaster.schoolName,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all pupils
exports.getPupils = async (req, res) => {
  try {
    const pupils = await Pupil.find({ isActive: true });
    res.json(pupils);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add pupil
exports.addPupil = async (req, res) => {
  try {
    const { name, admissionNumber, class: className, dateOfBirth } = req.body;

    const existing = await Pupil.findOne({ admissionNumber });
    if (existing) {
      return res.status(400).json({ error: "Admission number already exists" });
    }

    const pupil = new Pupil({
      name,
      admissionNumber,
      class: className,
      dateOfBirth,
    });

    await pupil.save();
    res.status(201).json(pupil);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update pupil
exports.updatePupil = async (req, res) => {
  try {
    const pupil = await Pupil.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      req.body,
      { new: true },
    );
    res.json(pupil);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete pupil
exports.deletePupil = async (req, res) => {
  try {
    await Pupil.findOneAndUpdate({ _id: req.params.id }, { isActive: false });
    res.json({ message: "Pupil deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get recipients (Teachers + Parents)
exports.getRecipients = async (req, res) => {
  try {
    const recipients = [];

    // Get all teachers
    const teachers = await Teacher.find({ isActive: true });
    for (const teacher of teachers) {
      recipients.push({
        id: teacher._id,
        model: "teacher",
        label: `Teacher: ${teacher.name} (${teacher.classAssigned})`,
      });
    }

    // Get all parents
    const parents = await Parent.find();
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

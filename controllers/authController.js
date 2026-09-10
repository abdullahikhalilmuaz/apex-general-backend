const Headmaster = require("../models/Headmaster");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Login for all roles
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in any role
    let user = await Headmaster.findOne({ email });
    let role = "headmaster";

    if (!user) {
      user = await Teacher.findOne({ email });
      role = "teacher";
    }

    if (!user) {
      user = await Parent.findOne({ email });
      role = "parent";
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
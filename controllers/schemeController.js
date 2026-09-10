const SchemeOfWork = require("../models/SchemeOfWork");
const Teacher = require("../models/Teacher");

// Get all schemes (Headmaster)
exports.getAllSchemes = async (req, res) => {
  try {
    const schemes = await SchemeOfWork.find().sort({ createdAt: -1 });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get schemes for a class (Teacher & Headmaster)
exports.getSchemesByClass = async (req, res) => {
  try {
    const { class: className } = req.params;
    const schemes = await SchemeOfWork.find({ class: className });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get scheme by class & subject (Teacher & Headmaster)
exports.getSchemeByClassAndSubject = async (req, res) => {
  try {
    const { class: className, subject } = req.params;
    const scheme = await SchemeOfWork.findOne({ class: className, subject });
    if (!scheme) {
      return res.status(404).json({ error: "Scheme not found" });
    }
    res.json(scheme);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create scheme (Headmaster only)
exports.createScheme = async (req, res) => {
  try {
    if (req.user.role !== "headmaster") {
      return res.status(403).json({ error: "Only headmasters can create schemes" });
    }

    const { class: className, subject, term, session, weeks } = req.body;

    // Check if scheme already exists
    const existing = await SchemeOfWork.findOne({ class: className, subject, term, session });
    if (existing) {
      return res.status(400).json({ error: "Scheme already exists for this class, subject, term, and session" });
    }

    const scheme = new SchemeOfWork({
      class: className,
      subject,
      term,
      session,
      weeks,
      createdBy: req.user.id,
    });

    await scheme.save();
    res.status(201).json({ message: "Scheme created successfully", scheme });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update scheme (Headmaster only)
exports.updateScheme = async (req, res) => {
  try {
    if (req.user.role !== "headmaster") {
      return res.status(403).json({ error: "Only headmasters can update schemes" });
    }

    const scheme = await SchemeOfWork.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!scheme) {
      return res.status(404).json({ error: "Scheme not found" });
    }

    res.json({ message: "Scheme updated successfully", scheme });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete scheme (Headmaster only)
exports.deleteScheme = async (req, res) => {
  try {
    if (req.user.role !== "headmaster") {
      return res.status(403).json({ error: "Only headmasters can delete schemes" });
    }

    const scheme = await SchemeOfWork.findByIdAndDelete(req.params.id);
    if (!scheme) {
      return res.status(404).json({ error: "Scheme not found" });
    }

    res.json({ message: "Scheme deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Teacher marks week as completed
exports.markWeekCompleted = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ error: "Only teachers can mark weeks" });
    }

    const { weekNumber } = req.body;
    const scheme = await SchemeOfWork.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({ error: "Scheme not found" });
    }

    // Check if teacher is assigned to this class
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher || teacher.classAssigned !== scheme.class) {
      return res.status(403).json({ error: "You are not assigned to this class" });
    }

    const week = scheme.weeks.find((w) => w.weekNumber === weekNumber);
    if (!week) {
      return res.status(404).json({ error: "Week not found" });
    }

    week.completed = !week.completed;
    week.completedDate = week.completed ? new Date() : null;
    scheme.updatedAt = new Date();
    await scheme.save();

    res.json({ message: "Week updated successfully", scheme });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Teacher marks week as completed (Alternative)
exports.updateSchemeWeeks = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ error: "Only teachers can update weeks" });
    }

    const scheme = await SchemeOfWork.findByIdAndUpdate(
      req.params.id,
      { weeks: req.body.weeks, updatedAt: new Date() },
      { new: true }
    );

    if (!scheme) {
      return res.status(404).json({ error: "Scheme not found" });
    }

    res.json({ message: "Scheme updated successfully", scheme });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get progress for a class (Headmaster)
exports.getClassProgress = async (req, res) => {
  try {
    if (req.user.role !== "headmaster") {
      return res.status(403).json({ error: "Only headmasters can view progress" });
    }

    const { class: className } = req.params;
    const schemes = await SchemeOfWork.find({ class: className });

    const progress = schemes.map((scheme) => {
      const totalWeeks = scheme.weeks.length;
      const completedWeeks = scheme.weeks.filter((w) => w.completed).length;
      return {
        subject: scheme.subject,
        totalWeeks,
        completedWeeks,
        progress: totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0,
      };
    });

    res.json({ class: className, progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
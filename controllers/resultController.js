const Result = require("../models/Result");
const Pupil = require("../models/Pupil");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");

// Calculate grade based on total
const calculateGrade = (total) => {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 40) return "D";
  if (total >= 30) return "E";
  return "F";
};

// Teacher: Add/Update result
exports.addResult = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ error: "Only teachers can add results" });
    }

    const { pupilId, subject, caScore, examScore, term, session } = req.body;

    // Check if pupil exists
    const pupil = await Pupil.findById(pupilId);
    if (!pupil) {
      return res.status(404).json({ error: "Pupil not found" });
    }

    // Check if teacher is assigned to this class
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher || teacher.classAssigned !== pupil.class) {
      return res
        .status(403)
        .json({ error: "You are not assigned to this class" });
    }

    const total = (caScore || 0) + (examScore || 0);
    const grade = calculateGrade(total);

    const result = await Result.findOneAndUpdate(
      { pupilId, subject, term, session },
      {
        pupilId,
        class: pupil.class,
        subject,
        caScore: caScore || 0,
        examScore: examScore || 0,
        total,
        grade,
        term,
        session,
        teacherId: req.user.id,
        isPublished: false,
        updatedAt: new Date(),
      },
      { new: true, upsert: true },
    );

    res.status(201).json({ message: "Result saved successfully", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Teacher: Get results for their class
exports.getTeacherResults = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ error: "Only teachers can access this" });
    }

    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const { subject, term, session } = req.query;

    const query = {
      class: teacher.classAssigned,
      term: term || "First",
      session: session || "2024/2025",
    };

    if (subject) query.subject = subject;

    const results = await Result.find(query).populate(
      "pupilId",
      "name admissionNumber",
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Teacher: Publish results for a class
exports.publishResults = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ error: "Only teachers can publish results" });
    }

    const { subject, term, session } = req.body;

    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const query = {
      class: teacher.classAssigned,
      term: term || "First",
      session: session || "2024/2025",
    };

    if (subject) query.subject = subject;

    const results = await Result.updateMany(query, { isPublished: true });

    res.json({
      message: "Results published successfully",
      updatedCount: results.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Parent: Get results for their children
exports.getParentResults = async (req, res) => {
  try {
    if (req.user.role !== "parent") {
      return res.status(403).json({ error: "Only parents can access this" });
    }

    const children = await Pupil.find({
      parentIds: req.user.id,
      isActive: true,
    });

    const pupilIds = children.map((c) => c._id);

    const { term, session } = req.query;

    const query = {
      pupilId: { $in: pupilIds },
      isPublished: true,
      term: term || "First",
      session: session || "2024/2025",
    };

    const results = await Result.find(query).populate(
      "pupilId",
      "name admissionNumber class",
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Parent: Get results for a specific child
exports.getParentChildResults = async (req, res) => {
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

    const { term, session } = req.query;

    const query = {
      pupilId,
      isPublished: true,
      term: term || "First",
      session: session || "2024/2025",
    };

    const results = await Result.find(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Headmaster: Get all results for a class
exports.getHeadmasterResults = async (req, res) => {
  try {
    if (req.user.role !== "headmaster") {
      return res
        .status(403)
        .json({ error: "Only headmasters can access this" });
    }

    const { class: className, subject, term, session } = req.query;

    const query = {
      class: className,
      term: term || "First",
      session: session || "2024/2025",
    };

    if (subject) query.subject = subject;

    const results = await Result.find(query).populate(
      "pupilId",
      "name admissionNumber",
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Headmaster: Get class performance summary
exports.getClassPerformance = async (req, res) => {
  try {
    if (req.user.role !== "headmaster") {
      return res
        .status(403)
        .json({ error: "Only headmasters can access this" });
    }

    const { class: className, term, session } = req.query;

    const query = {
      class: className,
      term: term || "First",
      session: session || "2024/2025",
    };

    const results = await Result.find(query);

    // Group by subject
    const subjects = {};
    results.forEach((r) => {
      if (!subjects[r.subject]) {
        subjects[r.subject] = { total: 0, count: 0, grades: {} };
      }
      subjects[r.subject].total += r.total;
      subjects[r.subject].count += 1;
      subjects[r.subject].grades[r.grade] =
        (subjects[r.subject].grades[r.grade] || 0) + 1;
    });

    const performance = Object.keys(subjects).map((subject) => ({
      subject,
      average: Math.round(subjects[subject].total / subjects[subject].count),
      studentCount: subjects[subject].count,
      gradeDistribution: subjects[subject].grades,
    }));

    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

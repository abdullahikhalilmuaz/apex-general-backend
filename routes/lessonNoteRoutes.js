const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const LessonNote = require("../models/LessonNote");
const Teacher = require("../models/Teacher");

// Get teacher's own lesson notes
router.get("/", auth, async (req, res) => {
  try {
    const notes = await LessonNote.find({
      teacherId: req.user.id,
    }).sort({ date: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all lesson notes (Headmaster only)
router.get("/all", auth, async (req, res) => {
  try {
    if (req.user.role !== "headmaster") {
      return res
        .status(403)
        .json({ error: "Only headmasters can view all notes" });
    }

    const notes = await LessonNote.find()
      .populate({
        path: "teacherId",
        select: "name classAssigned",
      })
      .sort({ date: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lesson notes by class (Headmaster only)
router.get("/class/:class", auth, async (req, res) => {
  try {
    if (req.user.role !== "headmaster") {
      return res
        .status(403)
        .json({ error: "Only headmasters can view all notes" });
    }

    const notes = await LessonNote.find({
      class: req.params.class,
    })
      .populate({
        path: "teacherId",
        select: "name classAssigned",
      })
      .sort({ date: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create lesson note (Teacher only) - auto-assigns class from teacher profile
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ error: "Only teachers can create lesson notes" });
    }

    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const {
      subject,
      topic,
      objectives,
      teachingMaterials,
      introduction,
      presentation,
      evaluation,
      assignment,
    } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ error: "Subject and topic are required" });
    }

    const note = new LessonNote({
      teacherId: req.user.id,
      class: teacher.classAssigned,
      subject,
      topic,
      objectives: objectives || [],
      teachingMaterials: teachingMaterials || [],
      introduction: introduction || "",
      presentation: presentation || "",
      evaluation: evaluation || "",
      assignment: assignment || "",
      date: new Date(),
    });

    await note.save();

    const populated = await note.populate({
      path: "teacherId",
      select: "name classAssigned",
    });

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating lesson note:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update lesson note
router.put("/:id", auth, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const {
      subject,
      topic,
      objectives,
      teachingMaterials,
      introduction,
      presentation,
      evaluation,
      assignment,
    } = req.body;

    const note = await LessonNote.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user.id },
      {
        class: teacher.classAssigned,
        subject,
        topic,
        objectives: objectives || [],
        teachingMaterials: teachingMaterials || [],
        introduction: introduction || "",
        presentation: presentation || "",
        evaluation: evaluation || "",
        assignment: assignment || "",
        updatedAt: new Date(),
      },
      { new: true },
    ).populate({
      path: "teacherId",
      select: "name classAssigned",
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found or no permission" });
    }

    res.json(note);
  } catch (error) {
    console.error("Error updating lesson note:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete lesson note
router.delete("/:id", auth, async (req, res) => {
  try {
    const note = await LessonNote.findOneAndDelete({
      _id: req.params.id,
      teacherId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found or no permission" });
    }

    res.json({ message: "Lesson note deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson note:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

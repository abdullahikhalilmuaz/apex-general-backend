const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LessonNote = require('../models/LessonNote');

// Get teacher's lesson notes
router.get('/', auth, async (req, res) => {
  try {
    const notes = await LessonNote.find({
      schoolId: req.user.schoolId,
      teacherId: req.user.userId
    }).sort({ date: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create lesson note
router.post('/', auth, async (req, res) => {
  try {
    const note = new LessonNote({
      ...req.body,
      schoolId: req.user.schoolId,
      teacherId: req.user.userId
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update lesson note
router.put('/:id', auth, async (req, res) => {
  try {
    const note = await LessonNote.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user.userId },
      req.body,
      { new: true }
    );
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
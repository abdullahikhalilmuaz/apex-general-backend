const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LessonNote = require('../models/LessonNote');
const Teacher = require('../models/Teacher');

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

// Get all lesson notes (Headmaster only)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'headmaster') {
      return res.status(403).json({ error: 'Only headmasters can view all notes' });
    }
    
    const notes = await LessonNote.find({
      schoolId: req.user.schoolId
    })
    .populate({
      path: 'teacherId',
      populate: { path: 'userId', select: 'name' }
    })
    .sort({ date: -1 });
    
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lesson notes by class (Headmaster only)
router.get('/class/:class', auth, async (req, res) => {
  try {
    if (req.user.role !== 'headmaster') {
      return res.status(403).json({ error: 'Only headmasters can view all notes' });
    }
    
    const notes = await LessonNote.find({
      schoolId: req.user.schoolId,
      class: req.params.class
    })
    .populate({
      path: 'teacherId',
      populate: { path: 'userId', select: 'name' }
    })
    .sort({ date: -1 });
    
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create lesson note
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can create lesson notes' });
    }

    const { class: className, subject, topic, objectives, teachingMaterials, introduction, presentation, evaluation, assignment } = req.body;

    // Validate required fields
    if (!className || !subject || !topic) {
      return res.status(400).json({ error: 'Class, subject, and topic are required' });
    }

    const note = new LessonNote({
      schoolId: req.user.schoolId,
      teacherId: req.user.userId,
      class: className,
      subject,
      topic,
      objectives: objectives || [],
      teachingMaterials: teachingMaterials || [],
      introduction: introduction || '',
      presentation: presentation || '',
      evaluation: evaluation || '',
      assignment: assignment || '',
      date: new Date()
    });
    await note.save();

    const populatedNote = await note.populate({
      path: 'teacherId',
      populate: { path: 'userId', select: 'name' }
    });

    res.status(201).json(populatedNote);
  } catch (error) {
    console.error('Error creating lesson note:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update lesson note
router.put('/:id', auth, async (req, res) => {
  try {
    const { class: className, subject, topic, objectives, teachingMaterials, introduction, presentation, evaluation, assignment } = req.body;

    const note = await LessonNote.findOneAndUpdate(
      { 
        _id: req.params.id, 
        schoolId: req.user.schoolId,
        teacherId: req.user.userId
      },
      {
        class: className,
        subject,
        topic,
        objectives: objectives || [],
        teachingMaterials: teachingMaterials || [],
        introduction: introduction || '',
        presentation: presentation || '',
        evaluation: evaluation || '',
        assignment: assignment || '',
        updatedAt: new Date()
      },
      { new: true }
    ).populate({
      path: 'teacherId',
      populate: { path: 'userId', select: 'name' }
    });

    if (!note) {
      return res.status(404).json({ error: 'Lesson note not found or you do not have permission' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error updating lesson note:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete lesson note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await LessonNote.findOneAndDelete({
      _id: req.params.id,
      schoolId: req.user.schoolId,
      teacherId: req.user.userId
    });

    if (!note) {
      return res.status(404).json({ error: 'Lesson note not found or you do not have permission' });
    }

    res.json({ message: 'Lesson note deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson note:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single lesson note
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await LessonNote.findOne({
      _id: req.params.id,
      schoolId: req.user.schoolId
    }).populate({
      path: 'teacherId',
      populate: { path: 'userId', select: 'name' }
    });

    if (!note) {
      return res.status(404).json({ error: 'Lesson note not found' });
    }

    // Check if user has permission (teacher owns it or headmaster)
    if (req.user.role !== 'headmaster' && note.teacherId._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You do not have permission to view this note' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error fetching lesson note:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
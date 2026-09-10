const Pupil = require("../models/Pupil");

// Get all pupils
exports.getPupils = async (req, res) => {
  try {
    const pupils = await Pupil.find({ isActive: true });
    res.json(pupils);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get pupils by class
exports.getPupilsByClass = async (req, res) => {
  try {
    const pupils = await Pupil.find({
      class: req.params.class,
      isActive: true,
    });
    res.json(pupils);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single pupil
exports.getPupilById = async (req, res) => {
  try {
    const pupil = await Pupil.findById(req.params.id);
    if (!pupil) {
      return res.status(404).json({ error: "Pupil not found" });
    }
    res.json(pupil);
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
    res.status(201).json({
      message: "Pupil added successfully",
      pupil,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update pupil
exports.updatePupil = async (req, res) => {
  try {
    const { name, admissionNumber, class: className, dateOfBirth } = req.body;

    const pupil = await Pupil.findByIdAndUpdate(
      req.params.id,
      { name, admissionNumber, class: className, dateOfBirth },
      { new: true, runValidators: true }
    );

    if (!pupil) {
      return res.status(404).json({ error: "Pupil not found" });
    }

    res.json({
      message: "Pupil updated successfully",
      pupil,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete pupil (soft delete)
exports.deletePupil = async (req, res) => {
  try {
    const pupil = await Pupil.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!pupil) {
      return res.status(404).json({ error: "Pupil not found" });
    }

    res.json({ message: "Pupil deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
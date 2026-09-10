const Announcement = require("../models/Announcement");

// Create announcement (Headmaster only)
exports.createAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== "headmaster") {
      return res
        .status(403)
        .json({ error: "Only headmasters can create announcements" });
    }

    const { title, content, audience, eventDate } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    let expiresAt = null;
    if (eventDate) {
      const event = new Date(eventDate);
      expiresAt = new Date(event.getTime() + 48 * 60 * 60 * 1000);
    }

    const announcement = new Announcement({
      title,
      content,
      audience: audience || "all",
      eventDate: eventDate ? new Date(eventDate) : null,
      expiresAt,
      createdBy: req.user.id,
    });

    await announcement.save();
    res
      .status(201)
      .json({ message: "Announcement created", data: announcement });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get announcements for Headmaster
exports.getAnnouncements = async (req, res) => {
  try {
    if (req.user.role !== "headmaster") {
      return res
        .status(403)
        .json({ error: "Only headmasters can view announcements" });
    }

    const announcements = await Announcement.find({
      createdBy: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get announcements filtered by role (Teacher + Parent)
exports.getFilteredAnnouncements = async (req, res) => {
  try {
    let audienceFilter = [];

    if (req.user.role === "teacher") {
      audienceFilter = ["all", "teachers"];
    } else if (req.user.role === "parent") {
      audienceFilter = ["all", "parents"];
    } else {
      return res
        .status(403)
        .json({ error: "Only teachers and parents can access this" });
    }

    const announcements = await Announcement.find({
      audience: { $in: audienceFilter },
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ error: error.message });
  }
};

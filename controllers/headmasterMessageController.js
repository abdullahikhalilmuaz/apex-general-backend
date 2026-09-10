const Message = require("../models/Message");
const Parent = require("../models/Parent");
const Teacher = require("../models/Teacher");
const Pupil = require("../models/Pupil");

// Get all messages for Headmaster with child info
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      receiverId: req.user.id,
      receiverModel: "headmaster",
    })
      .populate("senderId", "name")
      .populate("receiverId", "name")
      .sort({ createdAt: -1 })
      .lean();

    // For each message from a parent, get the child name
    for (let msg of messages) {
      if (msg.senderModel === "parent") {
        // Find the parent's linked children
        const pupil = await Pupil.findOne({
          parentIds: msg.senderId._id,
          isActive: true,
        });
        msg.childName = pupil?.name || null;
      }
    }

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get recipients (Parents + Teachers)
exports.getRecipients = async (req, res) => {
  try {
    const recipients = [];

    // Get all parents
    const parents = await Parent.find();
    for (const parent of parents) {
      recipients.push({
        id: parent._id,
        model: "parent",
        label: `Parent: ${parent.name}`,
      });
    }

    // Get all teachers
    const teachers = await Teacher.find();
    for (const teacher of teachers) {
      recipients.push({
        id: teacher._id,
        model: "teacher",
        label: `Teacher: ${teacher.name}`,
      });
    }

    res.json(recipients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send message to Parent or Teacher
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, receiverModel, content } = req.body;

    const message = new Message({
      senderId: req.user.id,
      senderModel: "headmaster",
      receiverId,
      receiverModel,
      content,
    });

    await message.save();
    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

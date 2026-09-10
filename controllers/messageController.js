const Message = require("../models/Message");
const Headmaster = require("../models/Headmaster");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");

// Get all messages for a user
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, senderModel: req.user.role },
        { receiverId: req.user.id, receiverModel: req.user.role },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    for (let msg of messages) {
      let sender = null;
      let receiver = null;

      if (msg.senderModel === "headmaster") {
        sender = await Headmaster.findById(msg.senderId).select("name");
      } else if (msg.senderModel === "teacher") {
        sender = await Teacher.findById(msg.senderId).select("name");
      } else if (msg.senderModel === "parent") {
        sender = await Parent.findById(msg.senderId).select("name");
      }

      if (msg.receiverModel === "headmaster") {
        receiver = await Headmaster.findById(msg.receiverId).select("name");
      } else if (msg.receiverModel === "teacher") {
        receiver = await Teacher.findById(msg.receiverId).select("name");
      } else if (msg.receiverModel === "parent") {
        receiver = await Parent.findById(msg.receiverId).select("name");
      }

      msg.senderName = sender?.name || "Unknown";
      msg.receiverName = receiver?.name || "Unknown";
    }

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: error.message });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, receiverModel, content } = req.body;

    let receiver = null;
    if (receiverModel === "headmaster") {
      receiver = await Headmaster.findById(receiverId);
    } else if (receiverModel === "teacher") {
      receiver = await Teacher.findById(receiverId);
    } else if (receiverModel === "parent") {
      receiver = await Parent.findById(receiverId);
    }

    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    const message = new Message({
      senderId: req.user.id,
      senderModel: req.user.role,
      receiverId,
      receiverModel,
      content,
    });

    await message.save();
    res
      .status(201)
      .json({ message: "Message sent successfully", data: message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true },
    );
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ message: "Message marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user.id,
      receiverModel: req.user.role,
      read: false,
    });
    res.json({ unread: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

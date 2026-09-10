const Message = require("../models/Message");
const Headmaster = require("../models/Headmaster");

// Get teacher's messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      receiverId: req.user.id,
      receiverModel: "teacher",
    })
      .populate("senderId", "name")
      .populate("receiverId", "name")
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send message to Headmaster
exports.sendToHeadmaster = async (req, res) => {
  try {
    const { content } = req.body;

    const headmaster = await Headmaster.findOne();
    if (!headmaster) {
      return res.status(404).json({ error: "Headmaster not found" });
    }

    const message = new Message({
      senderId: req.user.id,
      senderModel: "teacher",
      receiverId: headmaster._id,
      receiverModel: "headmaster",
      content,
    });

    await message.save();
    res
      .status(201)
      .json({ message: "Message sent to Headmaster", data: message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const PushToken = require("../models/PushToken");
const { sendPushNotifications } = require("../lib/expoPush");

// POST /api/notifications/register
exports.registerToken = async (req, res) => {
  try {
    const { token, device } = req.body;
    if (!token) {
      return res.status(400).json({ error: "token required" });
    }

    // Upsert: if token exists, update userId/role (user might have logged into different account)
    const existing = await PushToken.findOne({ token });
    if (existing) {
      existing.userId = req.user.id;
      existing.role = req.user.role;
      existing.device = device || existing.device;
      existing.updatedAt = new Date();
      await existing.save();
      return res.json({ message: "Token updated", token: existing });
    }

    const newToken = await PushToken.create({
      userId: req.user.id,
      role: req.user.role,
      token,
      device: device || "unknown",
    });

    res.status(201).json({ message: "Token registered", token: newToken });
  } catch (error) {
    console.error("registerToken error:", error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/notifications/unregister
exports.unregisterToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "token required" });

    await PushToken.deleteOne({ token });
    res.json({ message: "Token removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/notifications/send-to-user  (internal / admin use)
exports.sendToUser = async (userId, title, body, data = {}) => {
  const tokens = await PushToken.find({ userId });
  if (tokens.length === 0) return { sent: 0 };

  const messages = tokens.map((t) => ({
    to: t.token,
    sound: "default",
    title,
    body,
    data,
  }));

  return await sendPushNotifications(messages);
};

// POST /api/notifications/send-to-role
exports.sendToRole = async (role, title, body, data = {}) => {
  const tokens = await PushToken.find({ role });
  if (tokens.length === 0) return { sent: 0 };

  const messages = tokens.map((t) => ({
    to: t.token,
    sound: "default",
    title,
    body,
    data,
  }));

  return await sendPushNotifications(messages);
};

// POST /api/notifications/send-to-many (bulk by userIds)
exports.sendToUsers = async (userIds, title, body, data = {}) => {
  const tokens = await PushToken.find({ userId: { $in: userIds } });
  if (tokens.length === 0) return { sent: 0 };

  const messages = tokens.map((t) => ({
    to: t.token,
    sound: "default",
    title,
    body,
    data,
  }));

  return await sendPushNotifications(messages);
};

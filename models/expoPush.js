const axios = require("axios");

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Send push notifications via Expo Push API.
 * @param {Array<{to: string, title: string, body: string, data?: object}>} messages
 */
async function sendPushNotifications(messages) {
  if (!messages || messages.length === 0) return { sent: 0 };

  // Expo accepts max 100 per request
  const chunks = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  const results = [];
  for (const chunk of chunks) {
    try {
      const res = await axios.post(EXPO_PUSH_URL, chunk, {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
      });
      results.push(res.data);
    } catch (err) {
      console.error("Expo push error:", err.response?.data || err.message);
      results.push({ error: err.message });
    }
  }

  return { sent: messages.length, results };
}

module.exports = { sendPushNotifications };

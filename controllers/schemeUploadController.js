const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const SchemeOfWork = require("../models/SchemeOfWork");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.uploadScheme = async (req, res) => {
  try {
    if (req.user.role !== "headmaster") {
      return res.status(403).json({ error: "Only headmasters can upload schemes" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No PDF uploaded" });
    }

    const { class: className, subject, term, session } = req.body;
    if (!className || !subject || !term || !session) {
      return res.status(400).json({ error: "class, subject, term, session required" });
    }

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;

    if (!text || text.length < 50) {
      return res.status(400).json({ error: "PDF has no readable text" });
    }

    // Send to Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `Extract the Scheme of Work table from this text and return ONLY valid JSON in this exact format:

{
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "Speech",
      "topic": "Intonation pattern",
      "teacherActivities": "...",
      "pupilActivities": "...",
      "learningResources": "..."
    }
  ]
}

Rules:
- Each row in the PDF = one object in weeks[].
- weekNumber = number from WEEK column.
- theme = bold heading (Speech, Grammatical Accuracy, Reading, Writing etc).
- topic = topic line under the theme.
- teacherActivities / pupilActivities / learningResources = full text from those columns.
- If a week has multiple themes, output multiple objects with same weekNumber.
- Output ONLY JSON, no markdown, no explanation.

Text:
${text}`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    // Clean markdown if present
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      return res.status(500).json({ error: "AI returned invalid JSON", raw: responseText.substring(0, 500) });
    }

    if (!parsed.weeks || !Array.isArray(parsed.weeks)) {
      return res.status(500).json({ error: "AI response missing weeks array" });
    }

    // Check if scheme already exists
    const existing = await SchemeOfWork.findOne({ class: className, subject, term, session });
    if (existing) {
      return res.status(400).json({ error: "Scheme already exists. Delete it first or use a different term/session." });
    }

    // Save
    const scheme = new SchemeOfWork({
      class: className,
      subject,
      term,
      session,
      weeks: parsed.weeks,
      createdBy: req.user.id,
    });

    await scheme.save();

    res.status(201).json({
      message: "Scheme uploaded successfully",
      totalEntries: parsed.weeks.length,
      scheme,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
};
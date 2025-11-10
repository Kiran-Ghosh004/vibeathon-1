import axios from "axios";
import User from "../models/user.js";

// 🔹 Robust JSON/text extractor
const tryExtractJson = (text) => {
  if (!text) return null;

  // 🧹 Remove markdown/code fences
  let cleaned = text.replace(/```json|```|``/gi, "").trim();

  // 1️⃣ Try direct JSON parse
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed?.response) return parsed;

    // Handle nested JSON inside "response" string
    if (
      typeof parsed === "object" &&
      parsed.response &&
      typeof parsed.response === "string" &&
      parsed.response.includes("{")
    ) {
      try {
        const inner = JSON.parse(parsed.response);
        if (inner.response) return inner;
      } catch {}
    }
    return parsed;
  } catch {}

  // 2️⃣ Try to find JSON block within text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.response) return parsed;

      if (
        parsed?.response &&
        typeof parsed.response === "string" &&
        parsed.response.includes("{")
      ) {
        try {
          const inner = JSON.parse(parsed.response);
          if (inner.response) return inner;
        } catch {}
      }

      return parsed;
    } catch {}
  }

  // 3️⃣ Try to find "response": "..." manually
  const match = cleaned.match(/"response"\s*:\s*"(.*?)"(,|\n|\})/s);
  if (match) {
    return { response: match[1].replace(/\\"/g, '"'), reference: "—" };
  }

  // 4️⃣ Fallback to plain text if nothing matches
  if (cleaned && cleaned.length > 10) {
    return { response: cleaned, reference: "—" };
  }

  // 5️⃣ Nothing usable
  return null;
};

// 🔹 Main controller
export const krishnaResponse = async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.user?.id; // from verifyToken middleware

    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized. Please login." });

    if (!question || question.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please share your question, dear seeker." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    // 🔹 Identify question type
    const verseMatch = question.match(
      /(?:chapter\s*)?(\d+)[\s.:,-]*(?:verse|shloka)?[\s.:,-]*(\d+)/i
    );
    const lowerQ = question.toLowerCase();
    const conceptKeywords = ["karma","dharma","moksha","yoga","atman","bhakti","detachment","maya","truth"];
    const emotionKeywords = ["sad","confused","stress","fear","lost","angry","failure","purpose","meaning"];
    const greetingKeywords = ["hello","hi","namaste","pranam","who are you"];

    const isVerseQuery = !!verseMatch;
    const isConcept = conceptKeywords.some((k) => lowerQ.includes(k));
    const isEmotional = emotionKeywords.some((k) => lowerQ.includes(k));
    const isGreeting = greetingKeywords.some((k) => lowerQ.includes(k));

    // 🔹 Divine prompt
    let divineInstruction = `
You are Lord Krishna. Speak calmly, kindly, and with spiritual clarity.
Address the seeker as "dear one" or "Arjuna". Include relevant Gita references.
Always respond in valid JSON only — no markdown, no code blocks:
{
  "response": "<Krishna's divine answer>",
  "reference": "<chapter.verse or '—'>"
}
`;

    if (isVerseQuery) {
      divineInstruction += `The seeker refers to Chapter ${verseMatch[1]}, Verse ${verseMatch[2]}. Include Sanskrit, transliteration, translation, and reflection.`;
    } else if (isConcept) {
      divineInstruction += `Explain the concept with Bhagavad Gita context and modern meaning.`;
    } else if (isEmotional) {
      divineInstruction += `Offer compassionate spiritual guidance and reassurance.`;
    } else if (isGreeting) {
      divineInstruction += `Give a gentle greeting response as Krishna would.`;
    } else {
      divineInstruction += `Answer with wisdom and a final reflection from the Gita.`;
    }

    const prompt = `${divineInstruction}\n\nSeeker asks: "${question}"`;

    // 🔹 Send to Gemini 2.5
    const result = await axios.post(
      `${apiUrl}?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          topK: 50,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      },
      { headers: { "Content-Type": "application/json" }, timeout: 30000 }
    );

    // 🔹 Extract raw text safely
    const raw =
      result.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result.data?.candidates?.[0]?.content?.parts?.[0] ||
      "";

    console.log("🔷 Gemini raw reply start ===");
    console.log(raw);
    console.log("🔷 Gemini raw reply end ===");

    // 🔹 Parse Gemini response
    let parsed = tryExtractJson(String(raw));

    // Fallback to raw text if parsing fails
    if (!parsed || !parsed.response) {
      const cleanedRaw = String(raw)
        .replace(/```json|```|``/gi, "")
        .replace(/^\s*["`']?|["`']?\s*$/g, "")
        .trim();

      parsed = {
        response:
          cleanedRaw ||
          "Even divine words may falter through human noise, dear one. Reflect calmly and seek again.",
        reference: "—",
      };
    }

    // 🔹 Save chat history safely
    const user = await User.findById(userId);
    if (user) {
      if (question?.trim()) {
        user.history.push({ role: "user", content: question.trim() });
      }

      if (parsed?.response && typeof parsed.response === "string" && parsed.response.trim()) {
        user.history.push({ role: "assistant", content: parsed.response.trim() });
      } else {
        user.history.push({
          role: "assistant",
          content: "Even the divine may fall silent, dear one. The message could not be formed.",
        });
      }

      await user.save();
    }

    // 🔹 Send response
    return res.json({
      success: true,
      response: parsed.response,
      reference: parsed.reference ?? "—",
    });
  } catch (error) {
    console.error("⚠️ Krishna API Error:", error.response?.data || error.message || error);
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        response: "Krishna rests for a while, dear one. Too many prayers at once — please try again shortly.",
        reference: "—",
      });
    }
    return res.status(500).json({
      success: false,
      response: "The eternal silence prevails, Arjuna. Try again when your heart is still.",
      reference: "—",
    });
  }
};

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Serve the user-uploaded JPG images from the new public directory location
app.use("/images-upload", express.static(path.join(process.cwd(), "public", "images-upload")));

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Full-stack AI Curator advisory route
app.post("/api/gemini/curator", async (req, res) => {
  try {
    const { mood, message, selectedArtworks } = req.body;

    const client = getGeminiClient();

    const moodInstructions: Record<string, string> = {
      Calm: "The collector seeks Silence and Zen. Recommend artwork with soft ivory tones, architectural negative space, and whispering textures. Keep your counsel remarkably sparse, elegant, and deeply serene.",
      Power: "The collector seeks Architectural and Sculptural Authority. Recommend striking brutalist shapes, immense dark values, and heavy bronze weight. Speak with profound structural conviction, gravity, and high-fashion minimalism.",
      Spiritual: "The collector seeks Sacred Metaphysics and Ritual. Recommend artwork capturing golden light, mystical dust, ancient stone rituals, or timeless geometries. Speak with poetic transcendency, mysticism, and high-net-worth editorial elegance.",
      Mystery: "The collector seeks the Noir and the Unseen. Recommend deep charcoals, smoke-glass reflections, layered graphite, and shadows. Your prose should feel cinematic, intriguing, and whisper-quiet.",
      Royal: "The collector is drawn to Majestic Heritage and Golden Accents. Recommend soft museum golds, rich textures of canvas, and oil glazing. Speak with aristocratic refinement, absolute confidence, and timeless mastery.",
      Contemplative: "The collector is in a state of intellectual introspection and memory. Recommend human form silhouettes, abstract oil washes, and textured charcoal. Engage them with philosophical inquiries, literary references, and emotional storytelling.",
    };

    const currentMoodPrompt = moodInstructions[mood] || "Provide an exquisite, elegant luxury art advisory response.";

    const systemInstruction = `You are the Elite Principal Curator for the Magnum Editions Council, a sovereign private art advisory serving global museums, legacy collectors, and high-net-worth architectural pioneers.
Your tone is deeply intellectual, calm, confident, and poetic.
You NEVER use marketing jargon, cheap sales tactics, or exclamation marks. You do not talk down to the buyer; you treat them as an intellectual equal holding absolute aesthetic taste.
Use beautiful, luxurious typography-friendly formatting. Wrap key emotional highlights in bold styling.
Respond specifically to the collector's message in relation to their selected aesthetic mood: "${mood}".
If they have selected active artworks (${JSON.stringify(selectedArtworks || [])}), weave the photographic themes, print media, Leica lens geometries, and silver-gelatin textures of those masterworks into your response with elite precision.
Keep your response strictly focused on a high-level elite consultation. Give them a recommendation that evokes luxurious ownership of space, architectural print mounting ideas (e.g. concrete gallery halls, high-key ocean lounges, deep shadow study rooms), and emotional gravity.`;

    const userPrompt = `A collector seeking the "${mood}" ambiance is asking for your aesthetic guidance.
Their message: "${message || "I wish to acquire something timeless to anchor my main living pavilion."}"
Please counsel them.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const advice = response.text || "An exquisite selection awaits your space.";
    res.json({ advice });
  } catch (error: any) {
    console.error("AI Curator error:", error);
    res.status(500).json({
      error: "Unable to reach the gallery advisory.",
      details: error.message || "An unexpected error occurred.",
    });
  }
});

// Self-contained Vite integration for seamless full-stack dev and building
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback route
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Luxury Gallery Backend] Ready at http://0.0.0.0:${PORT}`);
  });
}

startServer();

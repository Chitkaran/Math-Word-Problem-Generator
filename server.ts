import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Schema for structured word problems output
const problemDetailSchema = {
  type: Type.OBJECT,
  properties: {
    problemText: { type: Type.STRING, description: "The core, student-friendly word problem." },
    stepByStepHints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of strings, with each string being a distinct step to guide the student. Omit or leave empty if not requested."
    },
    workspacePrompt: { type: Type.STRING, description: "A generic prompt for students to show their mathematical thinking." },
  },
  required: ['problemText', 'workspacePrompt']
};

const teacherKeyDetailSchema = {
  type: Type.OBJECT,
  properties: {
    completeSolution: { type: Type.STRING, description: "A complete solution to the problem." },
    multipleStrategies: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggestions for multiple strategies to solve the problem." },
    commonMisconceptions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of common misconceptions students might have." },
    successCriteria: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of success criteria for assessment." },
  },
  required: ['completeSolution', 'multipleStrategies', 'commonMisconceptions', 'successCriteria']
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    studentWorksheet: {
      type: Type.OBJECT,
      properties: {
        scaffolded: { type: Type.ARRAY, items: problemDetailSchema },
        onLevel: { type: Type.ARRAY, items: problemDetailSchema },
        challenge: { type: Type.ARRAY, items: problemDetailSchema },
      },
    },
    teacherKey: {
      type: Type.OBJECT,
      properties: {
        scaffolded: { type: Type.ARRAY, items: teacherKeyDetailSchema },
        onLevel: { type: Type.ARRAY, items: teacherKeyDetailSchema },
        challenge: { type: Type.ARRAY, items: teacherKeyDetailSchema },
      },
    }
  },
  required: ['studentWorksheet', 'teacherKey']
};

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Basic middleware
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Server-side Gemini API Word Problem Generator
  app.post("/api/generate-problems", async (req, res) => {
    const settings = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(500).json({
        error: "GEMINI_API_KEY is not configured on the server. Please check your environment variables."
      });
      return;
    }

    const selectedLevels = Object.entries(settings.differentiation || {})
      .filter(([, value]) => value)
      .map(([key]) => key);

    if (selectedLevels.length === 0) {
      res.status(400).json({ error: "Please select at least one differentiation level." });
      return;
    }

    const numQuestions = settings.numberOfQuestions || 5;
    const prompt = `
    You are an expert curriculum designer and math teacher specializing in creating differentiated, inclusive, and curriculum-aligned math word problems for K-12 students. Your response will be a JSON object containing a student worksheet and a teacher key.

    **Primary Objective:** Generate exactly ${numQuestions} unique math word problems for EACH of the following differentiation levels: ${selectedLevels.join(', ')}.
    
    **CRITICAL REQUIREMENTS:**
    1.  **Exact Count:** You MUST generate exactly ${numQuestions} problems for EACH level requested. 
        - If 'scaffolded' is requested, generate ${numQuestions} scaffolded problems.
        - If 'onLevel' is requested, generate ${numQuestions} on-level problems.
        - If 'challenge' is requested, generate ${numQuestions} challenge problems.
    2.  **No Skipping:** Do NOT skip any level. If 3 levels are selected and ${numQuestions} is 10, you MUST return a total of 30 problems (10 per level).
    3.  **Unique Content:** Every problem must be unique, even across levels.

    **Generation Criteria:**
    - Math Concept: ${settings.mathConcept || 'General Math'}
    - Topic / Strand: ${settings.mathStrand || 'Numbers & Operations'}
    - Grade Level: ${settings.gradeLevel || '6'}
    - Context/Theme: ${settings.context || 'Real Life'}

    **Output Structure:**
    Your response MUST be a single JSON object matching the provided schema. For each problem generated, you must provide:
    1.  'studentWorksheet' content: student-friendly problem text, optional step-by-step hints, and a workspace prompt.
    2.  'teacherKey' content: a complete solution, multiple strategies, common misconceptions, and success criteria.

    Ensure all content is inclusive, classroom-appropriate, and aligns with Universal Design for Learning (UDL) principles.
    `;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    try {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Cache-Control', 'no-cache');

      let stream;
      try {
        stream = await ai.models.generateContentStream({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.7,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          }
        });
      } catch (err: any) {
        console.warn('gemini-2.5-flash stream failed, attempting gemini-3-flash-preview fallback:', err?.message);
        stream = await ai.models.generateContentStream({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            temperature: 0.7,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          }
        });
      }

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          res.write(text);
        }
      }
      res.end();
    } catch (error: any) {
      console.error("Error generating word problems on server:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error?.message || "Failed to generate word problems. Please try again." });
      } else {
        res.end();
      }
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0" },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    // Express v5 uses '*all' instead of '*' for wildcard routing
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

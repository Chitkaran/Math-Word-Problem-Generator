import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Schema definitions for math problems
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
    required: ["problemText", "workspacePrompt"]
  };

  const teacherKeyDetailSchema = {
    type: Type.OBJECT,
    properties: {
      completeSolution: { type: Type.STRING, description: "A complete solution to the problem." },
      multipleStrategies: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggestions for multiple strategies to solve the problem." },
      commonMisconceptions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of common misconceptions students might have." },
      successCriteria: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of success criteria for assessment." },
    },
    required: ["completeSolution", "multipleStrategies", "commonMisconceptions", "successCriteria"]
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
    required: ["studentWorksheet", "teacherKey"]
  };

  // API route for generating word problems using Gemini
  app.post("/api/generate", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured.");
      res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
      return;
    }

    const settings = req.body;
    const selectedLevels = Object.entries(settings.differentiation || {})
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key);

    if (selectedLevels.length === 0) {
      res.status(400).json({ error: "Please select at least one differentiation level." });
      return;
    }

    const prompt = `
      You are an expert curriculum designer and math teacher specializing in creating differentiated, inclusive, and curriculum-aligned math word problems for K-12 students. Your response will be a JSON object containing a student worksheet and a teacher key.

      **Primary Objective:** Generate exactly ${settings.numberOfQuestions} unique math word problems for EACH of the following differentiation levels: ${selectedLevels.join(', ')}.
      
      **CRITICAL REQUIREMENTS:**
      1.  **Exact Count:** You MUST generate exactly ${settings.numberOfQuestions} problems for EACH level requested. 
          - If 'scaffolded' is requested, generate ${settings.numberOfQuestions} scaffolded problems.
          - If 'onLevel' is requested, generate ${settings.numberOfQuestions} on-level problems.
          - If 'challenge' is requested, generate ${settings.numberOfQuestions} challenge problems.
      2.  **No Skipping:** Do NOT skip any level. If 3 levels are selected and ${settings.numberOfQuestions} is 10, you MUST return a total of 30 problems (10 per level).
      3.  **Unique Content:** Every problem must be unique, even across levels.

      **Generation Criteria:**
      - Math Concept: ${settings.mathConcept}
      - Topic / Strand: ${settings.mathStrand}
      - Grade Level: ${settings.gradeLevel}
      - Context/Theme: ${settings.context}

      **Output Structure:**
      Your response MUST be a single JSON object matching the provided schema. For each problem generated, you must provide:
      1.  'studentWorksheet' content: student-friendly problem text, optional step-by-step hints, and a workspace prompt.
      2.  'teacherKey' content: a complete solution, multiple strategies, common misconceptions, and success criteria.

      Ensure all content is inclusive, classroom-appropriate, and aligns with Universal Design for Learning (UDL) principles.
    `;

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      let lastError: any = null;

      for (const model of modelsToTry) {
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            console.log(`[Gemini] Attempting generation with model ${model} (attempt ${attempt})...`);
            const responseStream = await ai.models.generateContentStream({
              model,
              contents: prompt,
              config: {
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
              }
            });

            // Fetch the first chunk to ensure the model isn't immediately throwing 503
            const iterator = responseStream[Symbol.asyncIterator]();
            const first = await iterator.next();

            // Establish SSE headers once stream connection is proven
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            if (first.value?.text) {
              res.write(`data: ${JSON.stringify({ text: first.value.text })}\n\n`);
            }

            let nextChunk = await iterator.next();
            while (!nextChunk.done) {
              if (nextChunk.value?.text) {
                res.write(`data: ${JSON.stringify({ text: nextChunk.value.text })}\n\n`);
              }
              nextChunk = await iterator.next();
            }

            res.write(`data: [DONE]\n\n`);
            res.end();
            return;
          } catch (modelError: any) {
            lastError = modelError;
            const errStr = String(modelError?.message || modelError);
            const isTransient = 
              errStr.includes("503") || 
              errStr.includes("high demand") || 
              errStr.includes("UNAVAILABLE") || 
              errStr.includes("ResourceExhausted") ||
              errStr.includes("RESOURCE_EXHAUSTED");

            console.warn(`[Gemini] Model ${model} attempt ${attempt} failed: ${errStr}`);

            if (isTransient) {
              // Wait briefly before retrying or switching models
              await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
              continue;
            } else {
              // Non-capacity error; do not repeat on the same model
              break;
            }
          }
        }
      }

      // If all candidate models and retries were exhausted
      console.error("[Gemini] All candidate models exhausted:", lastError);
      if (!res.headersSent) {
        res.status(503).json({
          error: "The AI service is currently experiencing high demand. Automatic retries completed. Please try again in a few moments."
        });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Service temporarily unavailable due to high demand. Please try again." })}\n\n`);
        res.end();
      }
    } catch (error: any) {
      console.error("Gemini route fatal error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Failed to generate word problems." });
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message || "Streaming error" })}\n\n`);
        res.end();
      }
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

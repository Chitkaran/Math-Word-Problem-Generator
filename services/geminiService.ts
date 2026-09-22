
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import type { FormState, GeneratedProblem } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// FIX: Define a schema for the expected JSON response to ensure type safety and valid output.
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


export async function generateWordProblemsStream(settings: FormState) {
  const selectedLevels = Object.entries(settings.differentiation)
    .filter(([, value]) => value)
    .map(([key]) => key);

  if (selectedLevels.length === 0) {
    throw new Error("Please select at least one differentiation level.");
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
    const response = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            temperature: 0.7,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            thinkingConfig: {
                thinkingLevel: ThinkingLevel.MINIMAL
            }
        }
    });
    
    return response;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate word problems. Please check your API key and try again.");
  }
}

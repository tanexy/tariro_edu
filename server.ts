/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
// @ts-ignore
import officeParser from "officeparser";
import { dbManager } from "./src/db";
import { UserTier, TutorMessage, QuizQuestion, Flashcard } from "./src/types";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase request size limits for uploading folders containing multiple files
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini Client safely
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const DEFAULT_USER_ID = "user-clive-tariro";

// Ensure we have a valid API Key check
const verifyApiKeyPresent = () => {
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.warn("⚠️ WARNING: GEMINI_API_KEY is not defined or is placeholder. AI core operations will fail.");
    return false;
  }
  return true;
};

// Helper to parse Office files (.docx, .pptx, .xlsx, etc.) buffer to plain text
async function parseOfficeBuffer(buffer: Buffer): Promise<string> {
  let parser: any = officeParser;
  if (!parser && typeof require !== "undefined") {
    try {
      parser = require("officeparser");
    } catch (e) {}
  }
  
  if (parser && typeof parser.parseBufferAsync === "function") {
    return await parser.parseBufferAsync(buffer);
  } else if (parser && typeof parser.parseBuffer === "function") {
    return new Promise((resolve, reject) => {
      parser.parseBuffer(buffer, (data: any, err: any) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  } else if (parser && typeof (parser as any).default?.parseBufferAsync === "function") {
    return await (parser as any).default.parseBufferAsync(buffer);
  } else if (parser && typeof (parser as any).default?.parseBuffer === "function") {
    return new Promise((resolve, reject) => {
      (parser as any).default.parseBuffer(buffer, (data: any, err: any) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }
  throw new Error("officeparser does not expose expected parse functions");
}

// Resilient wrapper around Gemini model generative calls to gracefully handle rate-limit (429) errors
async function generateContentWithRetry(params: any, retriesLeft = 5, delayMs = 15000): Promise<any> {
  try {
    return await ai.models.generateContent(params);
  } catch (error: any) {
    const isRateLimit = 
      error?.status === "RESOURCE_EXHAUSTED" || 
      error?.code === 429 || 
      String(error).includes("429") ||
      String(error).includes("RESOURCE_EXHAUSTED") ||
      String(error).includes("quota");

    if (isRateLimit && retriesLeft > 0) {
      let waitTime = delayMs;
      const errMsg = error?.message || String(error);
      const match = errMsg.match(/retry in (\d+\.?\d*)s/i);
      if (match && match[1]) {
        const seconds = parseFloat(match[1]);
        waitTime = Math.ceil(seconds * 1000) + 1500;
      }
      console.warn(`[Gemini Quota] 429 Resource Exhausted for ${params.model || "Gemini"}. Retrying in ${waitTime / 1000}s... (${retriesLeft} retries left)`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return generateContentWithRetry(params, retriesLeft - 1, waitTime * 1.5);
    }
    throw error;
  }
}

// -------------------------------------------------------------
// --- Express API Routes ---
// -------------------------------------------------------------

// User Profiles
app.get("/api/user", (req, res) => {
  const user = dbManager.getUser(DEFAULT_USER_ID);
  res.json(user);
});

app.post("/api/user/tier", (req, res) => {
  const { tier } = req.body;
  if (![UserTier.FREE, UserTier.PRO, UserTier.ENTERPRISE].includes(tier)) {
    return res.status(400).json({ error: "Invalid subscription tier" });
  }
  const updated = dbManager.updateUserTier(DEFAULT_USER_ID, tier as UserTier);
  dbManager.addActivity(DEFAULT_USER_ID, "workspace", "Subscription Upgraded", `Switched billing to ${tier} Tier`);
  res.json(updated);
});

// Workspaces
app.get("/api/workspaces", (req, res) => {
  const workspaces = dbManager.getWorkspaces(DEFAULT_USER_ID);
  res.json(workspaces);
});

app.post("/api/workspaces", (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Workspace name is required" });
  }
  const workspace = dbManager.createWorkspace(name.trim(), DEFAULT_USER_ID);
  res.json(workspace);
});

// Learning Spaces
app.get("/api/learning-spaces", (req, res) => {
  const { workspaceId } = req.query;
  if (!workspaceId) {
    return res.status(400).json({ error: "workspaceId is required" });
  }
  const spaces = dbManager.getLearningSpaces(workspaceId as string);
  res.json(spaces);
});

app.get("/api/learning-spaces/:id", (req, res) => {
  const space = dbManager.getLearningSpace(req.params.id);
  if (!space) {
    return res.status(404).json({ error: "Learning space not found" });
  }
  res.json(space);
});

// Documents inside a learning space
app.get("/api/learning-spaces/:id/documents", (req, res) => {
  const docs = dbManager.getDocuments(req.params.id);
  res.json(docs);
});

// Learning Resources (overview, study guide, flashcards, assessments, mindmap)
app.get("/api/learning-spaces/:id/resources", (req, res) => {
  const resources = dbManager.getLearningResources(req.params.id);
  if (!resources) {
    return res.status(404).json({ error: "Learning resources not generated yet" });
  }
  res.json(resources);
});

// Folder Processing and Learning Space Generation Pipeline
app.post("/api/learning-spaces/upload-folder", async (req, res) => {
  let { workspaceId, folderName, files } = req.body;

  if (!folderName || !files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: "Missing folderName, or files payload" });
  }

  // Handle dynamic initialization of Workspace if none specified or present
  if (!workspaceId) {
    const userWorkspaces = dbManager.getWorkspaces(DEFAULT_USER_ID);
    if (userWorkspaces.length > 0) {
      workspaceId = userWorkspaces[0].id;
    } else {
      const defaultWorkspace = dbManager.createWorkspace("Personal Workspace", DEFAULT_USER_ID);
      workspaceId = defaultWorkspace.id;
    }
  }

  const user = dbManager.getUser(DEFAULT_USER_ID);

  // Storage Limit checks
  let totalUploadedSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
  if (user.storageUsed + totalUploadedSize > user.storageLimit) {
    return res.status(403).json({ 
      error: "SaaS Storage Quota Exceeded. Upgrade to Pro or Enterprise for higher limits." 
    });
  }

  // Create immediate Learning Space
  const space = dbManager.createLearningSpace(workspaceId, folderName, folderName);

  dbManager.addActivity(
    DEFAULT_USER_ID, 
    "upload", 
    "Processing folder upload", 
    `Analyzing path '${folderName}' with ${files.length} documents.`
  );

  res.json({ status: "processing", message: "Folder accepted. Extracting and analyzing...", learningSpaceId: space.id });

  // RUN Background Document Processing to prevent API timeout on long folders!
  (async () => {
    try {
      const isApiKeyAvailable = verifyApiKeyPresent();
      const documentRecords = [];

      for (const file of files) {
        let extractedContent = "";

        const isPlainText = 
          file.name.endsWith(".txt") || 
          file.name.endsWith(".md") || 
          file.name.endsWith(".csv") ||
          file.name.endsWith(".json");

        const isOfficeDoc = 
          file.name.endsWith(".docx") || 
          file.name.endsWith(".pptx") || 
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".odt") ||
          file.name.endsWith(".odp") ||
          file.name.endsWith(".ods");

        if (isPlainText && file.text) {
          extractedContent = file.text;
        } else if (isOfficeDoc && file.base64) {
          try {
            console.log(`Extracting text from Office file via officeparser: ${file.name}`);
            const buffer = Buffer.from(file.base64, "base64");
            extractedContent = await parseOfficeBuffer(buffer);
            console.log(`Successfully extracted ${extractedContent.length} chars from ${file.name}`);
          } catch (officeErr) {
            console.error(`officeparser failed to parse ${file.name}:`, officeErr);
            extractedContent = `[Office Extraction Error on ${file.name}: ${officeErr instanceof Error ? officeErr.message : String(officeErr)}]`;
          }
        } else if (isApiKeyAvailable && file.base64) {
          // Multimodal extraction with gemini-3.5-flash with rate-limit retries
          try {
            console.log(`Extracting text from binary file via Gemini with Rate-Limit Resilience: ${file.name}`);
            const prompt = `You are a professional document scanning agent. Fully transcribe and extract all textual contents, tables, lists, and main heading headers from this document. Deliver only the raw structured text. Do not comment. Document title: ${file.name}`;
            
            const extractResponse = await generateContentWithRetry({
              model: "gemini-3.5-flash",
              contents: [
                {
                  inlineData: {
                    mimeType: file.type || "application/pdf",
                    data: file.base64
                  }
                },
                prompt
              ]
            });
            extractedContent = extractResponse.text || `[Empty transcribed document: ${file.name}]`;
          } catch (apiError) {
            console.error(`Gemini failed to parse ${file.name}:`, apiError);
            extractedContent = `[Extraction Error on ${file.name}: ${apiError instanceof Error ? apiError.message : String(apiError)}]`;
          }
        } else {
          extractedContent = `[Unable to extract content of binary file: ${file.name}. Ensure valid Gemini API connection is available.]`;
        }

        // Save doc
        const savedDoc = dbManager.createDocument(
          space.id,
          file.name,
          file.path || file.name,
          extractedContent,
          file.type || "application/octet-stream",
          file.size || 1024
        );
        documentRecords.push(savedDoc);
      }

      // Generate Learning Resources (Overview, 5-Day Study Plan, Quizzes, Flashcards, Mind Map)
      if (isApiKeyAvailable && documentRecords.length > 0) {
        console.log(`Generating Learning Space resources using Gemini for space: ${space.name}`);
        
        // Collate standard context
        const documentSummaryContext = documentRecords
          .map(doc => `--- DOCUMENT NAME: ${doc.title} ---\n${doc.content.substring(0, 4000)}`)
          .join("\n\n");

        const resourceGeneratorPrompt = `You are Tariro, a master cognitive educational processor. Analyze the following uploaded knowledge core text and build a customized, highly engaging interactive learning package in robust JSON.

${documentSummaryContext}

Generate the exact JSON response adhering to this schema:
{
  "overview": "A warm welcome to this Learning Space, summarizing what they will study, the distinct files, and core theme outline.",
  "studyPlan": "A thorough, step-by-step Day-by-Day (Day 1 to 5) study list in Markdown format. Tell them exactly which files to explore and what core concepts to target of the documents.",
  "flashcards": [
    {
      "question": "A stimulating spaced-repetition testing question based on the content...",
      "answer": "Complete, comprehensive reveal answer...",
      "category": "Topic category",
      "difficulty": "easy" or "medium" or "hard"
    }
  ],
  "quizzes": [
    {
      "question": "An interactive assessment question...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Why this key is correct based on the retrieved information.",
      "type": "multiple-choice" or "short-answer" or "scenario"
    }
  ],
  "mindMap": {
    "nodes": [
      { "id": "1", "label": "Main Core Hub (Space Name)", "type": "root", "description": "Hub summary" },
      { "id": "2", "label": "Primary Topic", "type": "topic", "parentId": "1" },
      { "id": "3", "label": "Sub concept detail", "type": "concept", "parentId": "2" }
    ]
  }
}

Guidelines:
1. Ensure flashcards contains at least 3-6 high-quality testing questions.
2. Ensure quizzes contains at least 3-6 varied multiple choice / scenario questions.
3. Ensure mindMap has a correct node hierarchy with root, topic, and concept structures.
4. Keep the output strictly structure verified JSON.`;

        try {
          const runRes = await generateContentWithRetry({
            model: "gemini-3.5-flash",
            contents: resourceGeneratorPrompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  overview: { type: Type.STRING },
                  studyPlan: { type: Type.STRING },
                  flashcards: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        question: { type: Type.STRING },
                        answer: { type: Type.STRING },
                        category: { type: Type.STRING },
                        difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
                      },
                      required: ["question", "answer", "category", "difficulty"]
                    }
                  },
                  quizzes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ["multiple-choice", "short-answer", "scenario"] }
                      },
                      required: ["question", "options", "correctAnswer", "explanation", "type"]
                    }
                  },
                  mindMap: {
                    type: Type.OBJECT,
                    properties: {
                      nodes: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            label: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ["root", "topic", "concept", "detail"] },
                            parentId: { type: Type.STRING },
                            description: { type: Type.STRING }
                          },
                          required: ["id", "label", "type"]
                        }
                      }
                    },
                    required: ["nodes"]
                  }
                },
                required: ["overview", "studyPlan", "flashcards", "quizzes", "mindMap"]
              }
            }
          });

          const resJson = JSON.parse(runRes.text || "{}");

          // -----------------------------------------------------------------
          // 1. High-Scale Iterative Flashcard Generation Segment (Per-Chunk)
          // -----------------------------------------------------------------
          let scaleFlashcards: Flashcard[] = [];
          try {
            const chunks = buildChunksFromDocuments(documentRecords);
            console.log(`[Flashcard Scale System] Semantic chunks built: ${chunks.length} for ${space.name}`);
            
            for (let i = 0; i < chunks.length; i++) {
              const chunkText = chunks[i];
              console.log(`[Flashcard Scale System] Querying Gemini for chunk ${i + 1}/${chunks.length} (${chunkText.length} chars)`);
              
              const chunkPrompt = `You are a master spaced-repetition exam designer. Analyze this specific section of the learning material and extract ALL core terminologies, comparative definitions, processes, and potential exam targets. 
              
Construct 8 to 15 highly granular, distinct flashcards based only on high-yield concepts in this section.

Content Block:
"""
${chunkText}
"""

Ensure you generate a rich spread of:
- Memory definitions
- Contrasting concepts (e.g., Difference between A & B)
- Process guidelines / Sequential stages
- Real-world case study scenario puzzles ("What happens if...", "How do we resolve...")
- Exam-relevant facts

Return EXACT JSON adhering to this schema:
{
  "flashcards": [
    {
      "question": "A focused, clear question, targeting a single specific concept, comparison, fact, or case study scenario from the block.",
      "answer": "Thorough, explicit, highly educational answer provide complete explanation and contextual details.",
      "category": "Topic subgroup",
      "difficulty": "easy" or "medium" or "hard"
    }
  ]
}`;

              try {
                const chunkResponse = await generateContentWithRetry({
                  model: "gemini-3.5-flash",
                  contents: chunkPrompt,
                  config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                        flashcards: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              question: { type: Type.STRING },
                              answer: { type: Type.STRING },
                              category: { type: Type.STRING },
                              difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
                            },
                            required: ["question", "answer", "category", "difficulty"]
                          }
                        }
                      },
                      required: ["flashcards"]
                    }
                  }
                });

                const parsedChunk = JSON.parse(chunkResponse.text || "{}");
                const cards = parsedChunk.flashcards || [];
                console.log(`[Flashcard Scale System] Generated ${cards.length} cards from chunk ${i + 1}`);
                scaleFlashcards = scaleFlashcards.concat(cards);
              } catch (chunkErr) {
                console.error(`[Flashcard Scale System] Failed on chunk ${i + 1}:`, chunkErr);
              }
            }
          } catch (chunkBuildingErr) {
            console.error("[Flashcard Scale System] Builder error building chunks:", chunkBuildingErr);
          }

          // -----------------------------------------------------------------
          // 2. Refined Expander fallback if flashcards < 10 after loop
          // -----------------------------------------------------------------
          if (scaleFlashcards.length < 10) {
            console.warn(`[Flashcard Scale System] Insufficient scale detected (${scaleFlashcards.length} cards). Initiating automatic refined prompt expansion...`);
            const fullContentCombined = documentRecords.map(doc => `--- FILE: ${doc.title} ---\n${doc.content}`).join("\n\n").substring(0, 16000);
            
            const expansionPrompt = `You are Tariro's master exam preparer and educational assessor. Even though the uploaded materials are brief, we must build a rich, exhaustive academic study deck of AT LEAST 30 detailed, comprehensive flashcards.
            
Exhaustively list core concepts, vocabulary terms, underlying mechanics, step-by-step processes, scenario applications, and key facts. Expand on the implicit assumptions and real-world implementations.

Knowledge Core:
"""
${fullContentCombined}
"""

Please generate exactly 30 premium flashcards to ensure high coverage and spaced repetition utility.

Return EXACT JSON adhering to this schema:
{
  "flashcards": [
    {
      "question": "A focused, detailed testing question or scenario-based query...",
      "answer": "Thorough explanation, logic, or step-by-step answer...",
      "category": "Domain core",
      "difficulty": "medium"
    }
  ]
}`;

            try {
              const expansionResponse = await generateContentWithRetry({
                model: "gemini-3.5-flash",
                contents: expansionPrompt,
                config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      flashcards: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            question: { type: Type.STRING },
                            answer: { type: Type.STRING },
                            category: { type: Type.STRING },
                            difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
                          },
                          required: ["question", "answer", "category", "difficulty"]
                        }
                      }
                    },
                    required: ["flashcards"]
                  }
                }
              });

              const parsedExp = JSON.parse(expansionResponse.text || "{}");
              const expCards = parsedExp.flashcards || [];
              console.log(`[Flashcard Scale System] Fallback expansion generated ${expCards.length} additional cards`);
              scaleFlashcards = scaleFlashcards.concat(expCards);
            } catch (expansionErr) {
              console.error("[Flashcard Scale System] Deep expansion pipeline failed:", expansionErr);
            }
          }

          // Ensure robust mapped structure with unique IDs
          const mappedFlashcards: Flashcard[] = scaleFlashcards.map((card, idx) => ({
            id: `fc-${space.id}-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
            question: card.question || "Undefined recall question",
            answer: card.answer || "Undefined answer details",
            category: card.category || "General Context",
            difficulty: card.difficulty || "medium"
          }));

          // Clean mapped quizzes
          const rawQuizzes = resJson.quizzes || [];
          const mappedQuizzes = rawQuizzes.map((quiz: any, idx: number) => ({
            id: `quiz-q-${space.id}-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
            question: quiz.question || "Undefined assessment query",
            options: Array.isArray(quiz.options) ? quiz.options : ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: quiz.correctAnswer || "",
            explanation: quiz.explanation || "No explanation provided.",
            type: quiz.type || "multiple-choice"
          }));

          // Generate Past Exam Intelligence Report
          console.log(`[Exam Intel System] Automatically analyzing exam patterns for ${space.name}...`);
          let examIntelReport = null;
          try {
            examIntelReport = await generateExamIntelligenceReport(space.name, documentRecords);
          } catch (intelErr) {
            console.error("[Exam Intel System] Failed to extract automatically:", intelErr);
            examIntelReport = generateFallbackExamIntelReport(space.name, documentRecords);
          }

          dbManager.saveLearningResources({
            id: "resources-" + space.id,
            learningSpaceId: space.id,
            overview: resJson.overview || "Your space overview is ready.",
            studyPlan: resJson.studyPlan || "Your study guide has been prepared.",
            flashcards: mappedFlashcards,
            quizzes: mappedQuizzes,
            mindMap: resJson.mindMap || { nodes: [] },
            examIntelligence: examIntelReport,
            createdAt: new Date().toISOString()
          });

          // Log complete activity
          dbManager.addActivity(
            DEFAULT_USER_ID, 
            "upload", 
            "Learning resources processed!", 
            `Constructed study guides, scale-generated ${mappedFlashcards.length} flashcards, quizzes & visual mind map for ${space.name}!`
          );

          console.log(`Processing complete for: ${space.name}`);
        } catch (resGenErr) {
          console.error("Failed to generate dynamic resources:", resGenErr);
          // Fallback static resource generation to avoid breaking page
          const fallbackResources = generateFallbackResources(space.id, space.name, documentRecords);
          dbManager.saveLearningResources(fallbackResources);
        }
      } else {
        // Fallback resources if no API key is set
        const fallbackResources = generateFallbackResources(space.id, space.name, documentRecords);
        dbManager.saveLearningResources(fallbackResources);
      }

    } catch (procErr) {
      console.error("Critical failure during document extraction pipeline:", procErr);
      dbManager.addActivity(DEFAULT_USER_ID, "upload", "Processing Failed", `Error processing space: ${space.name}`);
    }
  })();
});

// Semantic chunk builder for robust high-scale processing
function buildChunksFromDocuments(docs: any[]): string[] {
  const chunks: string[] = [];
  const chunkSizeLimit = 3000;
  
  for (const doc of docs) {
    if (!doc || !doc.content) continue;
    const paragraphs = doc.content.split(/\n+/);
    let currentChunk = `--- DOCUMENT: ${doc.title || "Untitled"} ---\n`;
    
    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (!trimmed) continue;
      
      if (currentChunk.length + trimmed.length > chunkSizeLimit) {
        chunks.push(currentChunk);
        currentChunk = `--- DOCUMENT (Continued): ${doc.title || "Untitled"} ---\n${trimmed}\n`;
      } else {
        currentChunk += `${trimmed}\n`;
      }
    }
    if (currentChunk.trim().length > (doc.title ? doc.title.length + 18 : 0)) {
      chunks.push(currentChunk);
    }
  }
  return chunks;
}

// Helper for Fallback Resources
function generateFallbackResources(spaceId: string, spaceName: string, docs: any[]): any {
  return {
    id: "resources-" + spaceId,
    learningSpaceId: spaceId,
    overview: `Welcome to the ${spaceName} Space! Contains ${docs.length} processed file(s): ${docs.map(d => d.title).join(", ")}. Study summaries, flashcards, and quizzes are ready for consumption.`,
    studyPlan: `### Standard Study Flow for ${spaceName}\n\n1. **Explore Docs**: Open individual uploads.\n2. **Review Flashcards**: Run active-recall queries.\n3. **Run Quizzes**: Test understanding of concepts.\n4. **Consult AI Tutor**: Ask clarifying questions.`,
    flashcards: [
      { id: "fb-1", question: "What is the primary topic of this workspace?", answer: `The workspace targets: ${spaceName}`, category: "General", difficulty: "easy" }
    ],
    quizzes: [
      { id: "fbq-1", question: `Review question for ${spaceName}: What is the main file name listed in this learning deck?`, options: [docs[0]?.title || "N/A", "Other PDF", "Mock Doc", "Text File"], correctAnswer: docs[0]?.title || "N/A", explanation: "This file is recorded directly in your folder upload structure.", type: "multiple-choice" }
    ],
    mindMap: {
      nodes: [
        { id: "1", label: spaceName, type: "root", description: `Root concepts of ${spaceName}` },
        { id: "2", label: "Documents", type: "topic", parentId: "1", description: "All uploaded document resources" },
        ...(docs.map((d, index) => ({ id: `doc-${index}`, label: d.title, type: "concept", parentId: "2" })))
      ]
    },
    createdAt: new Date().toISOString()
  };
}

// -------------------------------------------------------------
// --- Past Exam Intelligence Report Generator Core ---
// -------------------------------------------------------------

async function generateExamIntelligenceReport(spaceName: string, docs: any[]): Promise<any> {
  const isApiKeyAvailable = verifyApiKeyPresent();
  if (!isApiKeyAvailable || docs.length === 0) {
    return generateFallbackExamIntelReport(spaceName, docs);
  }

  const docsText = docs
    .map(doc => `--- FILE: ${doc.title} ---\n${doc.content.substring(0, 3000)}`)
    .join("\n\n")
    .substring(0, 15000);

  const prompt = `You are Tariro's elite Chief Academic Examiner and Past Exam Paper Intelligence system.
Analyze the following documents uploaded to the learning space "${spaceName}".
Search carefully for past exam papers, quizzes, question sessions, and test files inside this knowledge core.

If you find past exam papers, fully extract all questions, normalize their formatting (e.g., Short-answer, Multiple Choice, essay, etc.), and group similar questions.
If you DO NOT find actual past exam papers, synthesize highly probable academic test patterns and likely exam questions based on the uploaded curriculum/materials to yield an equally detailed and accurate exam predictive package.

You MUST construct a comprehensive, meticulous Past Exam Intelligence Report in exact JSON.

Respond with EXACT JSON in the following schema:
{
  "patternMining": {
    "extractedQuestions": [
      {
        "question": "A fully written out question found in or derived from the papers...",
        "sourcePaper": "Source File Name or 'Implicit Curriculum'",
        "year": "e.g. 2025 or 'Implicit'",
        "normalizedFormat": "Multiple Choice", "Code Implementation", "Short Answer", "Essay", or "Scenario",
        "group": "Grouping/Topic Name"
      }
    ]
  },
  "frequencyAnalysis": {
    "repeatedTopics": [
      {
        "topic": "The exact topic or concept group...",
        "percentageOccurrence": 75,
        "rank": 1
      }
    ]
  },
  "questionStyleAnalysis": {
    "styles": [
      {
        "styleName": "Definition-based", "Problem-solving", "Scenario-based", "Essay/discussion", or "Application",
        "description": "How the examiner frames these questions...",
        "percentage": 30
      }
    ]
  },
  "examinerPattern": {
    "recurringPhrases": ["e.g. 'Explain with reference to...'", "'Implement a function to...'"],
    "repeatedStructures": ["e.g. Part A tests memory, Part B tests application"],
    "variationDescription": "Explain how the same concept varies across exam iterations..."
  },
  "studyPrioritization": {
    "highPriority": ["Most critical high-yield topics to focus on"],
    "mediumPriority": ["Important topics but less frequent"],
    "lowPriority": ["Least likely to appear in high weight"]
  },
  "examPrediction": {
    "predictedQuestions": [
      {
        "question": "Highly realistic mock/predicted question crafted for the upcoming exam...",
        "predictionConfidence": "High", "Medium", or "Low",
        "variations": ["Variation A", "Variation B"],
        "fullModelAnswer": "A thorough, step-by-step master solution / model answer demonstrating a 100% score response..."
      }
    ]
  },
  "weakAreaDetection": {
    "gaps": [
      {
        "topic": "Name of topic with coverage gap...",
        "reason": "Explain why this is a weak area (e.g. High weight in past papers but extremely brief in study text)"
      }
    ]
  }
}

Knowledge Core Content for Reference:
"""
${docsText}
"""

Ensure you extract at least 5 - 10 questions for patternMining.extractedQuestions, and output at least 4 predicted questions with comprehensive step-by-step master model answers. Be highly meticulous!`;

  try {
    const runRes = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            patternMining: {
              type: Type.OBJECT,
              properties: {
                extractedQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      sourcePaper: { type: Type.STRING },
                      year: { type: Type.STRING },
                      normalizedFormat: { type: Type.STRING },
                      group: { type: Type.STRING }
                    },
                    required: ["question", "sourcePaper", "year", "normalizedFormat", "group"]
                  }
                }
              },
              required: ["extractedQuestions"]
            },
            frequencyAnalysis: {
              type: Type.OBJECT,
              properties: {
                repeatedTopics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      topic: { type: Type.STRING },
                      percentageOccurrence: { type: Type.NUMBER },
                      rank: { type: Type.NUMBER }
                    },
                    required: ["topic", "percentageOccurrence", "rank"]
                  }
                }
              },
              required: ["repeatedTopics"]
            },
            questionStyleAnalysis: {
              type: Type.OBJECT,
              properties: {
                styles: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      styleName: { type: Type.STRING },
                      description: { type: Type.STRING },
                      percentage: { type: Type.NUMBER }
                    },
                    required: ["styleName", "description", "percentage"]
                  }
                }
              },
              required: ["styles"]
            },
            examinerPattern: {
              type: Type.OBJECT,
              properties: {
                recurringPhrases: { type: Type.ARRAY, items: { type: Type.STRING } },
                repeatedStructures: { type: Type.ARRAY, items: { type: Type.STRING } },
                variationDescription: { type: Type.STRING }
              },
              required: ["recurringPhrases", "repeatedStructures", "variationDescription"]
            },
            studyPrioritization: {
              type: Type.OBJECT,
              properties: {
                highPriority: { type: Type.ARRAY, items: { type: Type.STRING } },
                mediumPriority: { type: Type.ARRAY, items: { type: Type.STRING } },
                lowPriority: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["highPriority", "mediumPriority", "lowPriority"]
            },
            examPrediction: {
              type: Type.OBJECT,
              properties: {
                predictedQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      predictionConfidence: { type: Type.STRING },
                      variations: { type: Type.ARRAY, items: { type: Type.STRING } },
                      fullModelAnswer: { type: Type.STRING }
                    },
                    required: ["question", "predictionConfidence", "variations", "fullModelAnswer"]
                  }
                }
              },
              required: ["predictedQuestions"]
            },
            weakAreaDetection: {
              type: Type.OBJECT,
              properties: {
                gaps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      topic: { type: Type.STRING },
                      reason: { type: Type.STRING }
                    },
                    required: ["topic", "reason"]
                  }
                }
              },
              required: ["gaps"]
            }
          },
          required: [
            "patternMining",
            "frequencyAnalysis",
            "questionStyleAnalysis",
            "examinerPattern",
            "studyPrioritization",
            "examPrediction",
            "weakAreaDetection"
          ]
        }
      }
    });

    return JSON.parse(runRes.text || "{}");
  } catch (err) {
    console.error("Failed to generate Exam intelligence dynamically, using fallback:", err);
    return generateFallbackExamIntelReport(spaceName, docs);
  }
}

function generateFallbackExamIntelReport(spaceName: string, docs: any[]): any {
  return {
    patternMining: {
      extractedQuestions: [
        {
          question: `Sample exam question for ${spaceName}: Can you explain the central architecture of this module?`,
          sourcePaper: docs[0]?.title || "Implicit Curriculum",
          year: "2026",
          normalizedFormat: "Short Answer",
          group: "Central Concepts"
        },
        {
          question: `Sample quiz question: Under which conditions do core parameters in this domain start behaving unpredictably?`,
          sourcePaper: docs[0]?.title || "Implicit Curriculum",
          year: "2025",
          normalizedFormat: "Scenario",
          group: "Advanced Mechanics"
        }
      ]
    },
    frequencyAnalysis: {
      repeatedTopics: [
        { topic: "Core System Definitions", percentageOccurrence: 85, rank: 1 },
        { topic: "Integration Invariants", percentageOccurrence: 60, rank: 2 },
        { topic: "Edge Case Controls", percentageOccurrence: 40, rank: 3 }
      ]
    },
    questionStyleAnalysis: {
      styles: [
        { styleName: "Definition-based", description: "Examiner expects direct, precise terminological definitions and exact formula details.", percentage: 40 },
        { styleName: "Scenario-based", description: "Complex context block followed by a request to identify, diagnose, and resolve the underlying bottleneck.", percentage: 35 },
        { styleName: "Problem-solving", description: "Requires step-by-step logic, code, or computation to solve a practical prompt.", percentage: 25 }
      ]
    },
    examinerPattern: {
      recurringPhrases: ["'Explain the significance of...'", "'Design a robust script to...'"],
      repeatedStructures: ["Introductory concept recall followed by sequential design application in Part B."],
      variationDescription: "The examiner tests the exact same definitions but rotates the scenario context across subsequent terms."
    },
    studyPrioritization: {
      highPriority: ["Core Definitions & Declarations", "Basic Indentation & Loop Controls"],
      mediumPriority: ["Scenario-based logical checks"],
      lowPriority: ["Legacy configurations"]
    },
    examPrediction: {
      predictedQuestions: [
        {
          question: `Sample Exam Prediction: Synthesize a custom setup that conforms to the parameters defined in ${spaceName} and handle memory constraints.`,
          predictionConfidence: "High",
          variations: [
            "How do we refactor the modular setup to save space?",
            "What is the behavior of the same setup under extreme scale?"
          ],
          fullModelAnswer: "To resolve this, declare a modular strategy. Ensure all properties are isolated and use proper garbage disposal patterns, resulting in a fully clean scope."
        }
      ]
    },
    weakAreaDetection: {
      gaps: [
        { topic: "Integration Testing", reason: "This topic appears on 80% of exams but was not thoroughly overviewed in standard documents." }
      ]
    }
  };
}

// Manual Exam Intelligence Analysis Trigger Endpoint
app.post("/api/learning-spaces/:id/analyze-exams", async (req, res) => {
  const spaceId = req.params.id;
  const space = dbManager.getLearningSpace(spaceId);
  if (!space) {
    return res.status(404).json({ error: "Learning Space not found" });
  }

  const docs = dbManager.getDocuments(spaceId);
  const resources = dbManager.getLearningResources(spaceId);

  if (!resources) {
    return res.status(404).json({ error: "Learning resources not initialized yet. Please wait for upload to complete." });
  }

  try {
    console.log(`[Exam Intel System] Manual invocation for ${space.name}. Running extractor...`);
    const report = await generateExamIntelligenceReport(space.name, docs);
    resources.examIntelligence = report;
    dbManager.saveLearningResources(resources);

    dbManager.addActivity(
      DEFAULT_USER_ID,
      "upload",
      "Exam patterns analyzed!",
      `Successfully generated high-probability syllabus prioritizing index & predicted exam answers for ${space.name}!`
    );

    res.json({ status: "success", examIntelligence: report });
  } catch (error: any) {
    console.error("[Exam Intel System] Manual generation failed:", error);
    res.status(500).json({ error: error.message || "Failed to generate exam intelligence" });
  }
});

// Retrieve AI Tutor Chat history
app.get("/api/learning-spaces/:id/tutor", (req, res) => {
  const chat = dbManager.getTutorChat(req.params.id, DEFAULT_USER_ID);
  res.json(chat);
});

// AI Tutor Chat Endpoint with RAG (Retrieval-Augmented Generation) & Source citations
app.post("/api/learning-spaces/:id/tutor", async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Message content cannot be empty" });
  }

  const space = dbManager.getLearningSpace(id);
  if (!space) {
    return res.status(404).json({ error: "Learning space not found" });
  }

  // Load documents
  const docs = dbManager.getDocuments(id);
  
  // RAG: Perform dynamic, lightweight keyword match across document snippets
  const matchedCitations: { documentId: string; documentTitle: string; snippet: string }[] = [];
  const lowercaseQuery = message.toLowerCase();

  for (const doc of docs) {
    const paragraphs = doc.content.split(/\n+/);
    for (const paragraph of paragraphs) {
      if (paragraph.length > 30 && paragraph.toLowerCase().includes(lowercaseQuery.substring(0, 10))) {
        matchedCitations.push({
          documentId: doc.id,
          documentTitle: doc.title,
          snippet: paragraph.trim().substring(0, 300) + (paragraph.length > 300 ? "..." : "")
        });
        // Limit to 3 most relevant paragraphs to fit tokens
        if (matchedCitations.length >= 3) break;
      }
    }
    if (matchedCitations.length >= 3) break;
  }

  // If no specific match, add general snippets from first document
  if (matchedCitations.length === 0 && docs.length > 0) {
    matchedCitations.push({
      documentId: docs[0].id,
      documentTitle: docs[0].title,
      snippet: docs[0].content.substring(0, 400) + (docs[0].content.length > 400 ? "..." : "")
    });
  }

  // Append User message to DB
  const userMsg: TutorMessage = {
    id: "msg-" + Math.random().toString(36).substring(2, 9),
    role: "user",
    content: message,
    timestamp: new Date().toISOString()
  };
  dbManager.addChatMessage(id, DEFAULT_USER_ID, userMsg);

  // Trigger Gemini with grounding snippets
  let ttsResponseText = "I apologize, but I am unable to connect to my AI nucleus right now. Please verify your GEMINI_API_KEY environment variable is defined.";
  
  const isApiKeyAvailable = verifyApiKeyPresent();
  if (isApiKeyAvailable) {
    try {
      console.log(`Tutor invoking Gemini groundings. Citations: ${matchedCitations.length}`);
      
      const groundingSnippetPrompt = matchedCitations
        .map((cit, i) => `[Source ${i+1} - Document: ${cit.documentTitle}]\n"${cit.snippet}"`)
        .join("\n\n");

      const systemInstruction = `You are Tariro, the leading AI Specialist Learning Tutor. Your mission is to provide rigorous, clear explanation using only the authentic knowledge core provided in sources.
Never hallucinate outside of this scope.
State explicitly if you can't find details in the sources.
Format explanations with clear bullet points, clean markdown syntax, and equations where applicable. Always mention which source documents you are citing.`;

      const promptContext = `Uploader Grounding Sources:\n${groundingSnippetPrompt}\n\nUser Question:\n"${message}"\n\nProvide the factual answer using these sources. Keep explanations premium and professional.`;

      const geminiRes = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: promptContext,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2 // low creativity for strict RAG accuracy
        }
      });

      ttsResponseText = geminiRes.text || "Empty response from AI engine.";
    } catch (aiErr) {
      console.error("AI Tutor response generation failed:", aiErr);
      ttsResponseText = `[AI Tutor was unable to answer: ${aiErr instanceof Error ? aiErr.message : String(aiErr)}]`;
    }
  }

  // Save Model message to DB
  const tutorMsg: TutorMessage = {
    id: "msg-" + Math.random().toString(36).substring(2, 9),
    role: "model",
    content: ttsResponseText,
    citations: matchedCitations.length > 0 ? matchedCitations : undefined,
    timestamp: new Date().toISOString()
  };
  
  const updatedChat = dbManager.addChatMessage(id, DEFAULT_USER_ID, tutorMsg);
  dbManager.addActivity(DEFAULT_USER_ID, "chat", "Consulted AI Tutor", `Prompt: '${message.substring(0, 30)}...'`);

  res.json({ response: tutorMsg, chat: updatedChat });
});

// Clear AI Tutor Chat history
app.post("/api/learning-spaces/:id/tutor/clear", (req, res) => {
  const chat = dbManager.clearChat(req.params.id, DEFAULT_USER_ID);
  res.json({ status: "success", chat });
});

// Recent Activities
app.get("/api/activities", (req, res) => {
  const activities = dbManager.getActivities(DEFAULT_USER_ID);
  res.json(activities);
});


// -------------------------------------------------------------
// --- Frontend Asset Serving & Hot Module Replacement ---
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite Dev Server middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving of compiled built static assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Tariro Server running on http://localhost:${PORT}`);
  });
}

startServer();

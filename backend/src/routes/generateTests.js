import { Router } from "express";
import OpenAI from "openai";
import { QA_SYSTEM_PROMPT } from "../prompts/qaSystemPrompt.js";
import { privacyShieldMiddleware } from "../middleware/privacyShield.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import Suite from "../models/Suite.js";
import User from "../models/User.js";

const router = Router();

// Lazy-initialized client (ensures .env is loaded)
let openai = null;
function getClient() {
  if (!openai) {
    const baseURL = process.env.OPENAI_BASE_URL;
    console.log(`[API] Initializing AI client → ${baseURL || "https://api.openai.com"}`);
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      ...(baseURL ? { baseURL } : {}),
    });
  }
  return openai;
}

router.post(
  "/generate-tests",
  authMiddleware,
  privacyShieldMiddleware,
  async (req, res) => {
    const startTime = Date.now();

    try {
      const { code, inputType = "code", title } = req.body;

      // ── Validate Input ───────────────────────────────────
      if (!code || typeof code !== "string" || code.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: "Please provide at least 10 characters of code or a user story.",
        });
      }

      if (code.trim().length > 15000) {
        return res.status(400).json({
          success: false,
          error: "Input exceeds 15,000 characters. Please break it into smaller chunks.",
        });
      }

      // ── Build User Prompt ────────────────────────────────
      const contextLabel =
        inputType === "userStory"
          ? "User Story / Feature Description"
          : "Code Snippet";

      const userPrompt = `Analyze the following ${contextLabel} and generate comprehensive test artifacts.

--- BEGIN INPUT ---
${code}
--- END INPUT ---

Generate the complete JSON response with testPlan, manualTestCases, gherkinScripts, and metadata. Remember: emphasize NEGATIVE tests, EDGE CASES, and SECURITY scenarios.`;

      // ── Call OpenAI API ──────────────────────────────────
      console.log(`[API] Generating tests for ${code.length} chars (${inputType})...`);

      const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

      const completion = await getClient().chat.completions.create({
        model,
        messages: [
          { role: "system", content: QA_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      });

      const rawContent = completion.choices[0]?.message?.content;

      if (!rawContent) {
        throw new Error("OpenAI returned an empty response.");
      }

      // ── Parse JSON Response ─────────────────────────────
      let parsedResult;
      try {
        parsedResult = JSON.parse(rawContent);
      } catch (parseError) {
        console.error("[API] Failed to parse OpenAI JSON:", rawContent.substring(0, 500));
        throw new Error("The AI returned malformed JSON. Please try again.");
      }

      const hasTestPlan = !!parsedResult.testPlan;
      const hasManualCases =
        Array.isArray(parsedResult.manualTestCases) && parsedResult.manualTestCases.length > 0;
      const hasGherkin =
        Array.isArray(parsedResult.gherkinScripts) && parsedResult.gherkinScripts.length > 0;

      if (!hasTestPlan && !hasManualCases && !hasGherkin) {
        throw new Error("AI response did not contain the expected test artifact structure.");
      }

      const elapsed = Date.now() - startTime;
      console.log(`[API] Tests generated in ${elapsed}ms`);

      // ── Save to MongoDB ─────────────────────────────────
      const suiteTitle =
        title ||
        parsedResult.testPlan?.title ||
        `Suite — ${new Date().toLocaleDateString()}`;

      const suite = await Suite.create({
        user: req.userId,
        title: suiteTitle,
        inputCode: code,
        inputType,
        result: {
          testPlan: parsedResult.testPlan,
          manualTestCases: parsedResult.manualTestCases,
          gherkinScripts: parsedResult.gherkinScripts,
          metadata: parsedResult.metadata,
        },
        privacyShield: {
          applied: req.privacyShield?.applied || false,
          redactions: req.privacyShield?.redactions || [],
        },
        model,
        processingTimeMs: elapsed,
        tokenUsage: {
          promptTokens: completion.usage?.prompt_tokens,
          completionTokens: completion.usage?.completion_tokens,
          totalTokens: completion.usage?.total_tokens,
        },
      });

      // Increment user's generation count
      await User.findByIdAndUpdate(req.userId, {
        $inc: { generationCount: 1 },
      });

      // ── Return Response ─────────────────────────────────
      return res.status(200).json({
        success: true,
        data: parsedResult,
        suiteId: suite._id,
        privacyShield: req.privacyShield || { applied: false },
        meta: {
          model,
          processingTimeMs: elapsed,
          inputLength: code.length,
          usage: {
            promptTokens: completion.usage?.prompt_tokens,
            completionTokens: completion.usage?.completion_tokens,
            totalTokens: completion.usage?.total_tokens,
          },
        },
      });
    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error(`[API] Error after ${elapsed}ms:`, error.message);

      if (error?.status === 401 || error?.code === "invalid_api_key") {
        return res.status(500).json({
          success: false,
          error: "Invalid OpenAI API key. Check your .env configuration.",
        });
      }
      if (error?.status === 429) {
        return res.status(429).json({
          success: false,
          error: "OpenAI rate limit reached. Please wait a moment and try again.",
        });
      }
      if (error?.status === 402 || error?.code === "insufficient_quota") {
        return res.status(402).json({
          success: false,
          error: "OpenAI quota exceeded. Check your billing at platform.openai.com.",
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "An unexpected error occurred.",
      });
    }
  }
);

export default router;

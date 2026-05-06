import asyncHandler from "express-async-handler";

/**
 * ── Generic Response Wrapper ─────────────────────────────────
 * Ensures all AI responses follow a consistent format.
 */
const sendResponse = (res, statusCode, success, data, message, error = null, meta = {}) => {
  const response = {
    success,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  // Only expose stack/detailed error in development mode
  if (error && process.env.NODE_ENV !== "production") {
    response.error = error.stack || error.message || error;
  }

  return res.status(statusCode).json(response);
};

/**
 * ── AI Call Utility with Timeout & Retry ──────────────────────
 */
const callAIWithRetry = async (base64, prompt, maxTokens = 300, retries = 1) => {
  const timeoutMs = 8000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const fetchTask = fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: maxTokens,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/png", data: base64 } },
          { type: "text", text: prompt },
        ],
      }],
    }),
  });

  try {
    const response = await fetchTask;
    clearTimeout(timeoutId);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || `AI service error: ${response.status}`);
    }

    if (!data?.content?.[0]?.text) {
      throw new Error("Empty response from AI service");
    }

    return { raw: data.content[0].text, model: data.model };
  } catch (err) {
    clearTimeout(timeoutId);

    const isTimeout = err.name === "AbortError";
    const errorMessage = isTimeout ? "AI request timed out (8s)" : err.message;

    console.error(`[AI Error] ${errorMessage}`, { retriesLeft: retries });

    if (retries > 0) {
      return callAIWithRetry(base64, prompt, maxTokens, retries - 1);
    }
    throw new Error(isTimeout ? "AI service temporarily unavailable (timeout)" : errorMessage);
  }
};

/**
 * ── Controller: Shape Snap ────────────────────────────────────
 * Detects and corrects shapes drawn on canvas.
 */
export const runShapeSnap = asyncHandler(async (req, res) => {
  const { base64 } = req.body;

  // 1. Validation
  if (!process.env.ANTHROPIC_API_KEY) {
    return sendResponse(res, 400, false, null, "AI service not configured on server.");
  }
  if (!base64) {
    return sendResponse(res, 400, false, null, "Missing required image data (base64).");
  }

  console.log("[AI Info] Incoming Shape Snap request");

  try {
    // 2. Safe AI Call
    const prompt = `Identify the primary shape. Reply ONLY with JSON: {"shape":"rectangle"|"circle"|"ellipse"|"triangle"|"line"|"none","confidence":0-1}.`;
    const result = await callAIWithRetry(base64, prompt, 150);

    console.log("[AI Raw Response]", result.raw);

    // 3. Safe JSON Parsing
    let parsed;
    try {
      const cleanJson = result.raw.trim().replace(/```json|```/g, "");
      parsed = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn("[AI Warning] Failed to parse JSON, returning raw text fallback");
      parsed = { shape: "none", rawText: result.raw, confidence: 0 };
    }

    return sendResponse(res, 200, true, parsed, "Shape detection successful", null, { model: result.model });

  } catch (err) {
    console.error("[AI Fatal Error]", err.stack);
    return sendResponse(res, 503, false, null, err.message || "AI service temporarily unavailable", err);
  }
});

/**
 * ── Controller: Analyze Board ─────────────────────────────────
 * Generates summaries/suggestions based on board content.
 */
export const analyzeBoard = asyncHandler(async (req, res) => {
  const { base64, action } = req.body;

  // 1. Validation
  if (!process.env.ANTHROPIC_API_KEY) {
    return sendResponse(res, 400, false, null, "AI service not configured on server.");
  }
  if (!base64 || !action) {
    return sendResponse(res, 400, false, null, "Missing required fields: base64 or action.");
  }

  console.log(`[AI Info] Incoming Board Analysis: ${action}`);

  const prompts = {
    "Summarise": "Describe what is drawn on this whiteboard in 2-3 brief bullet points. Start each with an emoji.",
    "Suggest Ideas": "Based on the content drawn, suggest 3 ideas to extend this diagram. Be concise.",
    "Auto Layout": "Describe a cleaner layout for these shapes and content. Be concise.",
    "Fix Text": "If there is any text visible, suggest corrections. Otherwise say 'No text found.'",
  };

  try {
    const prompt = prompts[action] || prompts["Summarise"];
    const result = await callAIWithRetry(base64, prompt, 300);

    return sendResponse(res, 200, true, result.raw, "Analysis successful", null, { model: result.model });

  } catch (err) {
    console.error("[AI Fatal Error]", err.stack);
    return sendResponse(res, 503, false, "Fallback: AI failed to analyze this board.", err.message, err);
  }
});

import asyncHandler from "express-async-handler";

/**
 * Ensuring all AI responses follow a consistent format.
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
 * Call Google Gemini API Directly (Vision & Multimodal content generation)
 */
const callGemini = async (base64, prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("Gemini API key is not configured on server.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `Gemini API error: ${response.status}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response from Gemini API");
  }

  return { raw: text, model: "gemini-2.5-flash" };
};

/**
 * Controller: Analyze Board (Smart Diagram Beautifier)
 * Uses Google Gemini 2.5 Flash to convert hand-drawn whiteboard sketches to structured shape JSON.
 */
export const analyzeBoard = asyncHandler(async (req, res) => {
  const { base64, action } = req.body;

  // 1. Validation
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return sendResponse(res, 400, false, null, "Gemini API key is not configured on server.");
  }
  if (!base64 || !action) {
    return sendResponse(res, 400, false, null, "Missing required fields: base64 or action.");
  }

  console.log(`[AI Info] Incoming Board Analysis: ${action} via Gemini API`);

  const prompt = `You are a system that converts hand-drawn sketch diagrams on a whiteboard into clean, structured vector diagrams.
Analyze the provided image of the whiteboard canvas. Identify all rough hand-drawn shapes (such as rectangles, circles, triangles, lines, arrows) and hand-written texts.
Convert these sketches into clean shapes using the following definitions:
- "rect" (rectangle): { "type": "rect", "x": number, "y": number, "w": number, "h": number, "color": string, "strokeWidth": number }
- "circle" (circle/ellipse): { "type": "circle", "x": number, "y": number, "w": number, "h": number, "color": string, "strokeWidth": number }
- "triangle" (triangle): { "type": "triangle", "x": number, "y": number, "w": number, "h": number, "color": string, "strokeWidth": number }
- "line" (line or arrow): { "type": "line", "x": number, "y": number, "w": number, "h": number, "color": string, "strokeWidth": number } (Note: for lines, w is the relative horizontal displacement dx, h is the relative vertical displacement dy)
- "text" (text label): { "type": "text", "x": number, "y": number, "w": number, "h": number, "color": string, "text": string, "strokeWidth": number }

Rules:
1. POSITION AND SIZE ARE CRITICAL: You must detect and output each shape at the EXACT SAME POSITION (x, y coordinates) and the EXACT SAME SIZE (width w, height h) as drawn by the user in the image. Do not change their locations, center them, or scale them. The clean shapes should perfectly match and overlap where the rough drawings were.
2. If text is written inside a shape, output the container shape at its exact location, and then place a corresponding "text" shape centered inside it.
3. Choose outline stroke colors from this set: '#1E1A14', '#EF4444', '#F97316', '#22C55E', '#3B82F6', '#8B5CF6'. Default outline/text color should be '#1E1A14'.
4. Maintain the logical flow of connections (arrows/lines) between the shapes, placing them at their exact drawn positions.
5. Output your response STRICTLY as a JSON object, without markdown formatting blocks, in this format:
{ "shapes": [ ... ] }`;

  try {
    const result = await callGemini(base64, prompt);
    
    // Clean up response if the model returned markdown code block wrappers
    let rawText = result.raw.trim();
    if (rawText.startsWith("```json")) {
      rawText = rawText.substring(7);
    } else if (rawText.startsWith("```")) {
      rawText = rawText.substring(3);
    }
    if (rawText.endsWith("```")) {
      rawText = rawText.substring(0, rawText.length - 3);
    }
    rawText = rawText.trim();

    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("[AI Parse Error] Failed to parse JSON response:", rawText);
      return sendResponse(res, 502, false, null, "AI service returned invalid JSON response format", parseErr.message);
    }

    if (!parsedData || !Array.isArray(parsedData.shapes)) {
      return sendResponse(res, 502, false, null, "AI response missing expected 'shapes' array");
    }

    return sendResponse(res, 200, true, parsedData, "Beautification successful", null, { model: result.model });

  } catch (err) {
    console.error("[AI Fatal Error]", err.stack);
    return sendResponse(res, 500, false, null, err.message, err);
  }
});

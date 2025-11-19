const express = require("express");
const router = express.Router();
const authorizeUser = require("../middlewares/authorizeUser");

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are a helpful assistant for the LNMIIT Alumni Portal. Your role is to help users navigate and understand the platform features.

You can help users with:
- How to use features (posts, batch directory, seminars, chat, gallery, etc.)
- Account verification process
- Profile management and editing
- Finding and connecting with alumni
- Batch-wise directory navigation
- Seminar hosting and joining
- General platform navigation and FAQs
- Posting content and engaging with posts

Be concise, friendly, and helpful. If you don't know something specific, politely say so and suggest they contact support or check the help section. Keep responses brief and actionable.`;

// Initialize Gemini AI - Using REST API
// Using gemini-1.5-flash (stable flash model, not pro)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash"; // Flash model, not pro
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Helper function to call Gemini API
const callGeminiAPI = async (userMessage, conversationHistory = []) => {
  try {
    // Build conversation context
    const contents = [];
    
    // Add system context as first message
    contents.push({
      role: "user",
      parts: [{ text: SYSTEM_PROMPT }]
    });
    contents.push({
      role: "model",
      parts: [{ text: "I understand. I'm ready to help users with the LNMIIT Alumni Portal." }]
    });

    // Add conversation history (last 5 messages for context)
    const recentHistory = conversationHistory.slice(-5);
    recentHistory.forEach(msg => {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      });
    });

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
          // Note: gemini-1.5-flash does not support thinking mode, so no thinkingConfig needed
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to get response from AI");
    }

    const data = await response.json();
    
    // Extract text from response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error("Invalid response format from AI");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// In-memory request tracking to prevent duplicate requests
const pendingRequests = new Map();
const REQUEST_TIMEOUT = 30000; // 30 seconds

// ROUTE: Handle chatbot queries
router.post("/query", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    // Validate input
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Check if API key is configured
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Chatbot service is not configured. Please contact administrator.",
      });
    }

    // Limit message length
    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message is too long. Please keep it under 1000 characters.",
      });
    }

    // Create a unique request key to prevent duplicates
    const requestKey = `${trimmedMessage}-${Date.now()}`;
    
    // Check if a similar request is already pending (within last 2 seconds)
    const now = Date.now();
    for (const [key, timestamp] of pendingRequests.entries()) {
      if (now - timestamp < 2000) {
        // If same message was requested within 2 seconds, reject duplicate
        if (key.startsWith(trimmedMessage)) {
          return res.status(429).json({
            success: false,
            message: "Please wait before sending the same message again.",
          });
        }
      } else {
        // Clean up old entries
        pendingRequests.delete(key);
      }
    }

    // Mark request as pending
    pendingRequests.set(requestKey, now);

    // Clean up after timeout
    setTimeout(() => {
      pendingRequests.delete(requestKey);
    }, REQUEST_TIMEOUT);

    // Call Gemini API
    const aiResponse = await callGeminiAPI(trimmedMessage, conversationHistory);

    // Remove from pending after successful response
    pendingRequests.delete(requestKey);

    return res.json({
      success: true,
      response: aiResponse,
    });
  } catch (error) {
    console.error("Error in chatbot query:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while processing your request. Please try again.",
    });
  }
});

// ROUTE: Health check for chatbot service
router.get("/health", (req, res) => {
  return res.json({
    success: true,
    configured: !!GEMINI_API_KEY,
    message: GEMINI_API_KEY ? "Chatbot service is ready" : "Chatbot service is not configured",
  });
});

module.exports = router;


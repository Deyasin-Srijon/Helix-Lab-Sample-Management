/**
 * Admin AI Chatbot API Service
 *
 * PURPOSE:
 * Connects the Admin Frontend chatbot to the Python FastAPI backend.
 *
 * Authentication:
 * - Sends browser cookies with the request.
 * - Python validates the ADMINSESSIONID against the Admin backend.
 * - No session cookies are manually read or exposed in JavaScript.
 */

const CHATBOT_API_URL = "http://localhost:8000/api/chat";

/**
 * Sends the Admin's message to the AI chatbot backend.
 *
 * @param {string} query - Message typed by the Admin
 * @returns {Promise<string>} - AI-generated response
 */
export async function generateDummyReply(query) {
  try {
    const response = await fetch(CHATBOT_API_URL, {
      method: "POST",

      // Tell the backend we are sending JSON.
      headers: {
        "Content-Type": "application/json",
      },

      // Important: send authentication cookies with this request.
      credentials: "include",

      // FastAPI expects the message field.
      body: JSON.stringify({
        message: query,
      }),
    });

    // Admin session is missing, expired, or invalid.
    if (response.status === 401) {
      return "Your Admin session has expired or you are not logged in. Please log in again to use the AI Assistant.";
    }

    // Handle service unavailable.
    if (response.status === 503) {
      return "The authentication or backend service is temporarily unavailable. Please try again later.";
    }

    // Handle chatbot gateway errors.
    if (response.status === 502) {
      return "The AI chatbot encountered a temporary problem. Please try again.";
    }

    // Handle other backend errors.
    if (!response.ok) {
      return `The chatbot server returned an error (${response.status}). Please try again.`;
    }

    // Parse the JSON response from FastAPI.
    const data = await response.json();

    // Return the AI response to MorphOrb.
    return data.reply || "The AI returned an empty response.";
  } catch (error) {
    // Log the technical error for debugging.
    console.error("Admin chatbot API error:", error);

    // Return a friendly message to the UI.
    return "Unable to connect to the AI chatbot server. Please check that the Python backend is running.";
  }
}

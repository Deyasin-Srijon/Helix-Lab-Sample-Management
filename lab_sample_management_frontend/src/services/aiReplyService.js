/**
 * Real AI Chat API Service
 * Connects the React User Frontend to the Python FastAPI chatbot.
 */

const CHATBOT_API_URL = "http://localhost:8000/api/chat";

/**
 * Sends the user's message to the Python chatbot backend.
 *
 * credentials: "include" is important because the chatbot backend
 * authenticates the user using the JSESSIONID cookie.
 *
 * We never manually read or send the cookie.
 * The browser handles it automatically.
 */
export async function generateDummyReply(query) {
  try {
    const response = await fetch(CHATBOT_API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "X-Chat-Portal": "USER",
      },

      credentials: "include",

      body: JSON.stringify({
        message: query,
      }),
    });

    // Handle authentication failure
    if (response.status === 401) {
      return "Your session has expired or you are not logged in. Please log in again.";
    }

    // Handle service unavailable
    if (response.status === 503) {
      return "The authentication or backend service is temporarily unavailable. Please try again later.";
    }

    // Handle chatbot gateway errors
    if (response.status === 502) {
      return "The AI chatbot encountered a temporary problem. Please try again.";
    }

    // Handle other HTTP errors
    if (!response.ok) {
      return `The chatbot server returned an error (${response.status}). Please try again.`;
    }

    // Convert the JSON response into a JavaScript object
    const data = await response.json();

    // Return the AI-generated reply to MorphOrb
    return data.reply || "The AI returned an empty response.";
  } catch (error) {
    console.error("Chatbot API error:", error);

    // Return a readable message instead of crashing the chatbot UI
    return "Unable to connect to the AI chatbot server. Please check that the Python backend is running.";
  }
}

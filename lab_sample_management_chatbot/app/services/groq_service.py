import logging
logger = logging.getLogger(__name__)

from groq import AsyncGroq
from groq import APIError, AuthenticationError, RateLimitError

from app.config import GROQ_API_KEY, GROQ_MODEL


# --------------------------------------------------
# Initialize the Groq client
# --------------------------------------------------

groq_client = AsyncGroq(
    api_key=GROQ_API_KEY
)

# --------------------------------------------------
# Groq error handling helper
# --------------------------------------------------

def handle_groq_error(exc: Exception) -> str:

    # Log detailed error for development/debugging.
    logger.error(
        "Groq API error: %s: %s",
        type(exc).__name__,
        exc,
        exc_info=(type(exc), exc, exc.__traceback__)
    )

    # Invalid or unauthorized API key.
    if isinstance(exc, AuthenticationError):
        return (
            "The AI service authentication failed. "
            "Please contact the administrator."
        )

    # Rate limit or quota limit reached.
    if isinstance(exc, RateLimitError):
        return (
            "The AI service usage limit has been reached "
            "or requests are temporarily being rate-limited. "
            "Please try again later."
        )

    # Other Groq API errors.
    if isinstance(exc, APIError):
        return (
            "The AI service is temporarily unavailable. "
            "Please try again later."
        )

    # Unexpected errors.
    return (
        "Something went wrong while generating the AI response. "
        "Please try again later."
    )

# --------------------------------------------------
# Chatbot system instructions
# --------------------------------------------------

SYSTEM_PROMPT = """
You are an AI assistant for a Lab Sample Management System.

Your responsibilities are limited to helping users
with lab sample management.

You may assist with topics such as:
- Lab sample records
- Sample descriptions
- Sample statuses
- Sample creation
- Sample retrieval
- Sample updates
- Sample deletion
- Explaining how the sample management system works

Supported sample statuses are:
- Created
- In Progress
- Completed

Rules:

1. Stay strictly within the Lab Sample Management domain.

2. If the user asks about unrelated topics, politely explain
   that you can only assist with Lab Sample Management.

3. When tools are provided, use the appropriate tool for
   requests involving actual sample records or operations.

4. Never invent sample IDs, sample records, database results,
   or claim an operation succeeded without a real tool result.

5. Only use tools that are provided in the current request.
   Never invent tool names or parameters.

6. If information required for a sample operation is missing,
   ask the user a clarifying question instead of guessing.

7. You are allowed to delete samples when the user explicitly requests deletion.
   - Users may only delete their own samples using delete_my_sample.
   - Admins may delete samples using delete_sample.
   - Always identify the sample ID before deleting.
   - Never delete a sample unless the user explicitly requests it.
   - Never invent a sample ID.
   - Call the appropriate deletion tool directly without asking for confirmation.
   - Report deletion as successful only when the tool confirms success.
   - If deletion fails, explain the actual failure clearly.

8. Admin sample creation restriction:
   - Admins are not allowed to create samples.
   - If an Admin requests sample creation, regardless of whether
     the request contains complete data, partial data, or no data,
     respond with the following message exactly:

     "Sample creation is not available for the Admin role. This service is intended for authorized User accounts."

   - Do not ask the Admin for sample details.
   - Do not attempt to create a sample.
   - Do not expose internal tool names or implementation details.
   - Do not suggest alternative ways to bypass this restriction.

9. If a tool returns an error, do not claim the operation
   succeeded. Explain the error in a user-friendly manner.
   
10. Format responses using Markdown when it improves readability.

11. When presenting multiple sample records, use a clean,
    structured format with bullet points or a Markdown table.
    Choose whichever is easier to read.

12. When displaying an individual sample, clearly identify:
    - Sample ID
    - Description
    - Status

    Only display fields that are actually available in the
    tool result. Never invent missing information.

13. After a successful sample creation or update, provide
    a concise confirmation that clearly states what action
    was completed.

14. When confirming an update, mention the sample ID and
    the field or value that was changed, whenever that
    information is available from the tool result.

15. Avoid unnecessary introductory text, repetitive details,
    excessive headings, and overly long explanations.
    Keep responses professional, clear, and easy to scan.
    
16. If a tool returns an error or failure result, never claim the
    operation succeeded. Clearly communicate the failure to the user
    and do not invent a successful outcome.
    
    
- When a tool returns an error, never claim the operation succeeded.
- Explain the actual failure in simple, user-friendly language.
- If a sample does not exist, clearly say it was not found.
- If the user is not authorized to access or delete a sample,
  explain that they do not have permission.
- Do not describe a sample-not-found or permission-denied error
  as a temporary service outage.
- Only describe the service as unavailable when the tool failure
  genuinely indicates a connection or server availability problem.
"""

# --------------------------------------------------
# Generate a normal AI response
# --------------------------------------------------

async def generate_chat_response(user_message: str):

    try:
        completion = await groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            temperature=0.2,
            max_completion_tokens=1024
        )

        response_text = completion.choices[0].message.content

        if not response_text:
            return "I couldn't generate a response. Please try again."

        return response_text.strip()

    except Exception as exc:
        return handle_groq_error(exc)

# --------------------------------------------------
# Generate a response with MCP tool-calling capability
# --------------------------------------------------

async def generate_tool_call_response(
    user_message: str,
    groq_tools: list
):
    """
    Send the user's message and role-allowed tools to Groq.

    Groq may:
    1. Return a normal text response.
    2. Request one or more tool calls.

    This function does NOT execute MCP tools.
    Tool execution is handled separately by our Python MCP executor.
    """

    try:
        completion = await groq_client.chat.completions.create(
            model=GROQ_MODEL,

            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],

            tools=groq_tools,
            tool_choice="auto",
            temperature=0.2,
            max_completion_tokens=1024
        )

        # Return the complete assistant message.
        # It may contain text, tool calls, or both.
        assistant_message = completion.choices[0].message

        return assistant_message

    except Exception as exc:
        return handle_groq_error(exc)
"""
Orchestrates the Groq tool-calling workflow.

Flow:
1. Authentication context is received from FastAPI.
2. Discover MCP tools.
3. Filter tools according to the user's role.
4. Ask Groq to respond or select a tool.
5. Execute selected tools using our MCP executor.
6. Send tool results (success or failure) back to Groq.
7. Return Groq's final response.

No chat history is persisted.
"""

import json
import logging
import re

from app.mcp_client.client import discover_mcp_tools
from app.mcp_client.groq_tools import build_groq_tools
from app.mcp_client.executor import (
    execute_mcp_tool,
    MCPToolExecutionError,
    extract_mcp_error,
)
from app.services.groq_service import (
    groq_client,
    GROQ_MODEL,
    SYSTEM_PROMPT,
    handle_groq_error,
)

logger = logging.getLogger(__name__)

# Maximum number of tool-call rounds per request.
MAX_TOOL_ROUNDS = 5


def serialize_tool_result(result):
    """
    Convert an MCP result into text that Groq can read.

    MCP results are Pydantic objects, so we convert them
    into a dictionary and then JSON text.
    """

    if hasattr(result, "model_dump"):
        result_data = result.model_dump()
    else:
        result_data = str(result)

    return json.dumps(
        result_data,
        ensure_ascii=False,
        default=str
    )


async def process_chat_with_tools(user_message, auth_context):
    """
    Process a chat message with role-specific MCP tools.

    auth_context is created by our authentication layer.
    It is never supplied or controlled by Groq.
    """

    # --------------------------------------------------
    # STEP 1: Normalize authenticated role
    # --------------------------------------------------

    raw_role = getattr(auth_context, "role", None)

    role = str(raw_role or "").strip().upper()

    # Handle common role formats.
    if role.startswith("ROLE_"):
        role = role[5:]

    logger.info("Authenticated role received: %s", role)

    # --------------------------------------------------
    # STEP 2: Discover MCP tools
    # --------------------------------------------------

    try:
        discovered_tools = await discover_mcp_tools()

    except Exception:
        logger.exception("MCP tool discovery failed")

        return (
            "I'm temporarily unable to connect to the sample management "
            "system. Please try again later."
        )

    # --------------------------------------------------
    # STEP 3: Validate role
    # --------------------------------------------------

    if role not in ("USER", "ADMIN"):
        logger.error("Unrecognized authenticated role: %r", raw_role)

        return (
            "I'm sorry, but I can't process that request right now "
            "because I'm unable to verify your authenticated role."
        )

    # --------------------------------------------------
    # STEP 4: Build role-specific tools
    # --------------------------------------------------

    try:
        groq_tools = build_groq_tools(
            role,
            discovered_tools
        )

    except Exception:
        logger.exception("Failed to build role-specific Groq tools")

        return (
            "I couldn't prepare the available sample management "
            "operations. Please try again."
        )

    available_tool_names = [
        tool["function"]["name"]
        for tool in groq_tools
    ]

    logger.info(
        "Role: %s | Available tools: %s",
        role,
        available_tool_names
    )

    # --------------------------------------------------
    # STEP 5: Handle Admin sample creation restriction
    # --------------------------------------------------

    sample_creation_pattern = re.compile(
        r"\b(create|creating|register|registered|registration|"
        r"add|adding|submit|submitting)\b.{0,80}\b(sample|samples)\b"
        r"|\b(sample|samples)\b.{0,80}\b(create|register|add|submit)\b",
        re.IGNORECASE
    )

    if role == "ADMIN" and sample_creation_pattern.search(user_message):

        return (
            "Sample creation is not available for the Admin role. "
            "This service is intended for authorized User accounts."
        )

    # --------------------------------------------------
    # STEP 6: Create role-specific instructions
    # --------------------------------------------------

    if role == "ADMIN":

        role_instructions = """
        You are authenticated as an ADMIN.

        You may retrieve, filter, update, and delete existing samples
        using your authorized tools.

        Sample creation is strictly prohibited for ADMIN.

        If the user asks to create, register, add, or submit a sample,
        refuse that request. Do not call any creation tool.

        You must not apply the Admin sample creation restriction
        to USER accounts.
        """

    elif role == "USER":

        role_instructions = """
        AUTHENTICATED ROLE: USER

        Sample creation is ALLOWED for this authenticated USER.

        You MUST NOT refuse sample creation by using any Admin restriction.

        If the user asks how to register, create, add, or submit a sample:
        - Explain the sample registration process if they are asking for guidance.
        - If they want to actually create a sample, use the create_sample tool.
        - If required information is missing, ask only for the missing information.
        - Never ask for a User ID or session ID.
        - Never invent sample data.
        - Do not claim a sample was created unless the create_sample tool
        confirms success.

        The Admin sample creation restriction does NOT apply to this USER.

        Continue to support all other authorized USER operations,
        including retrieving samples and checking sample statuses.

        SAMPLE DELETION FOR USER:
        - When the user asks to delete one of their samples and provides
        a sample ID, call delete_my_sample IMMEDIATELY.
        - NEVER ask "would you like me to delete...", "are you sure", or
        any other confirmation question. The request itself is the
        confirmation. Confirmation is handled by the application.
        - Only ask a question if the sample ID is missing.
        - Report success only after the tool confirms it; if the tool
        returns an error (e.g. sample not found), explain that error.
        """

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT + "\n\n" + role_instructions
        },
        {
            "role": "user",
            "content": user_message
        }
    ]

    # --------------------------------------------------
    # STEP 7: Start Groq tool-calling loop
    # --------------------------------------------------

    for round_number in range(MAX_TOOL_ROUNDS):

        try:
            completion = await groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                tools=groq_tools,
                tool_choice="auto",
                temperature=0.2,
                max_completion_tokens=1024
            )

        except Exception as exc:
            logger.exception(
                "Groq completion failed on round %s",
                round_number + 1
            )

            return handle_groq_error(exc)

        assistant_message = completion.choices[0].message

        # --------------------------------------------------
        # STEP 8: Return normal AI response
        # --------------------------------------------------

        if not assistant_message.tool_calls:
            response_text = assistant_message.content or ""
            response_text = response_text.strip()

            # Safeguard against Groq incorrectly applying
            # the Admin restriction to an authenticated User.
            if role == "USER" and sample_creation_pattern.search(user_message):

                admin_restriction_phrases = [
                    "creating new samples is only allowed for regular user accounts",
                    "as an administrator, i can view",
                    "sample creation is not available for the admin role",
                    "as an admin, i cannot add new samples",
                ]

                normalized_response = response_text.lower()

                if any(
                    phrase in normalized_response
                    for phrase in admin_restriction_phrases
                ):
                    logger.warning(
                        "Groq incorrectly applied Admin sample creation "
                        "restriction to authenticated USER."
                    )

                    return (
                        "You are logged in as a User, so you are permitted "
                        "to create samples.\n\n"
                        "To register a new sample, provide the required sample "
                        "information. I can help you complete the registration "
                        "process. No sample has been created yet."
                    )

            if not response_text:
                return (
                    "I couldn't generate a response. "
                    "Please try again."
                )

            return response_text

        # --------------------------------------------------
        # STEP 9: Append assistant tool calls
        # --------------------------------------------------

        messages.append(
            assistant_message.model_dump(
                exclude_none=True
            )
        )

        # --------------------------------------------------
        # STEP 10: Execute tools
        # --------------------------------------------------

        for tool_call in assistant_message.tool_calls:

            tool_name = tool_call.function.name

            try:
                tool_arguments = json.loads(
                    tool_call.function.arguments or "{}"
                )

                if not isinstance(tool_arguments, dict):
                    raise ValueError(
                        "Tool arguments must be a JSON object."
                    )

            except (json.JSONDecodeError, ValueError):

                tool_result_text = json.dumps({
                    "success": False,
                    "error": "Invalid tool arguments returned by AI.",
                })

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": tool_result_text
                })

                continue

            # --------------------------------------------------
            # STEP 10A: Execute MCP tool
            # --------------------------------------------------

            try:
                mcp_result = await execute_mcp_tool(
                    tool_name=tool_name,
                    tool_arguments=tool_arguments,
                    auth_context=auth_context,
                )

                tool_result_text = serialize_tool_result(
                    mcp_result
                )

            except Exception as exc:

                actual_mcp_error = extract_mcp_error(exc)

                if actual_mcp_error:

                    logger.warning(
                        "MCP tool returned an error: %s",
                        actual_mcp_error
                    )

                    tool_result_text = json.dumps({
                        "success": False,
                        "tool": tool_name,
                        "error": str(actual_mcp_error),
                        "instruction": (
                            "Explain the actual tool error clearly. "
                            "Do not claim success."
                        )
                    })

                else:

                    logger.exception(
                        "Unexpected MCP tool execution failure: %s",
                        tool_name
                    )

                    tool_result_text = json.dumps({
                        "success": False,
                        "tool": tool_name,
                        "error": "Unexpected tool execution failure.",
                        "instruction": (
                            "Explain that the operation failed. "
                            "Do not claim success."
                        )
                    })

            # --------------------------------------------------
            # STEP 10B: Return tool result to Groq
            # --------------------------------------------------

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": tool_result_text
            })

    # --------------------------------------------------
    # STEP 11: Tool-call limit reached
    # --------------------------------------------------

    logger.warning(
        "Maximum tool rounds reached for role %s",
        role
    )

    return (
        "I couldn't complete the request within the allowed "
        "number of tool operations. Please try a simpler request."
    )
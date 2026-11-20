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
    # STEP 1: Discover MCP tools
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
    # STEP 2: Filter and convert tools for the role
    # --------------------------------------------------

    try:
        groq_tools = build_groq_tools(
            auth_context.role,
            discovered_tools
        )

    except Exception:
        logger.exception(
            "Failed to build role-specific Groq tools"
        )

        return (
            "I couldn't prepare the available sample management "
            "operations. Please try again."
        )

    # --------------------------------------------------
    # STEP 3: Create temporary messages for this request
    # --------------------------------------------------

    messages = [
        {
            "role": "system",
            "content": (
                    SYSTEM_PROMPT
                    + f"\n\nThe authenticated application role for this request is: "
                      f"{auth_context.role}."
                    + (
                        "\nYou are authenticated as an ADMIN. You have administrator "
                        "privileges for managing existing samples. You may retrieve, "
                        "update, filter, and delete samples according to your permitted "
                        "tools. However, you are NOT allowed to create samples. "
                        "If the Admin requests sample creation in any form, respond "
                        "exactly with: 'Sample creation is not available for the Admin "
                        "role. This service is intended for authorized User accounts.' "
                        "Do not ask for sample details, do not attempt creation, and "
                        "do not expose internal tool names."
                        if auth_context.role == "ADMIN"
                        else
                        "\nYou are authenticated as a USER. You may only delete "
                        "samples belonging to this user using delete_my_sample."
                    )
            )
        },
        {
            "role": "user",
            "content": user_message
        }
    ]

    # --------------------------------------------------
    # STEP 4: Start the Groq tool-calling loop
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
        # STEP 5: If Groq did not request a tool,
        # return its normal response.
        # --------------------------------------------------

        if not assistant_message.tool_calls:

            response_text = assistant_message.content

            if not response_text:
                return (
                    "I couldn't generate a response. "
                    "Please try again."
                )

            return response_text.strip()

        # --------------------------------------------------
        # STEP 6: Append Groq's tool-call message.
        # --------------------------------------------------

        messages.append(
            assistant_message.model_dump(
                exclude_none=True
            )
        )

        # --------------------------------------------------
        # STEP 7: Execute each requested tool.
        # --------------------------------------------------

        for tool_call in assistant_message.tool_calls:

            tool_name = tool_call.function.name

            # Groq provides arguments as a JSON string.
            try:
                tool_arguments = json.loads(
                    tool_call.function.arguments or "{}"
                )

                if not isinstance(tool_arguments, dict):
                    raise ValueError(
                        "Tool arguments must be a JSON object."
                    )

            except (json.JSONDecodeError, ValueError):

                tool_result_text = json.dumps(
                    {
                        "success": False,
                        "error": (
                            "Invalid tool arguments returned by AI. "
                            "The operation was not executed."
                        )
                    },
                    ensure_ascii=False
                )

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": tool_result_text
                })

                continue

            # --------------------------------------------------
            # STEP 7A: Execute the MCP tool.
            # --------------------------------------------------

            try:
                mcp_result = await execute_mcp_tool(
                    tool_name=tool_name,
                    tool_arguments=tool_arguments,
                    auth_context=auth_context,
                )

                tool_result_text = serialize_tool_result(mcp_result)

            except Exception as exc:
                actual_mcp_error = extract_mcp_error(exc)

                if actual_mcp_error:
                    logger.warning(
                        "MCP tool returned an error: %s",
                        actual_mcp_error,
                    )

                    tool_result_text = json.dumps({
                        "success": False,
                        "tool": tool_name,
                        "error": str(actual_mcp_error),
                        "instruction": (
                            "Explain the actual tool error to the user clearly. "
                            "Do not claim the service is unavailable unless it is "
                            "actually unavailable. Do not claim the operation succeeded."
                        ),
                    })

                else:
                    logger.exception(
                        "Unexpected MCP tool execution failure: %s",
                        tool_name,
                    )

                    tool_result_text = json.dumps({
                        "success": False,
                        "tool": tool_name,
                        "error": "Unexpected tool execution failure.",
                        "instruction": (
                            "Explain that the operation could not be completed. "
                            "Do not claim success."
                        ),
                    })

            # --------------------------------------------------
            # STEP 7D: Send result/error back to Groq.
            # --------------------------------------------------

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": tool_result_text
            })

    # --------------------------------------------------
    # STEP 8: Stop if the AI exceeded the tool-call limit.
    # --------------------------------------------------

    logger.warning(
        "Maximum tool rounds reached for role %s",
        auth_context.role
    )

    return (
        "I couldn't complete the request within the allowed "
        "number of tool operations. Please try a simpler request."
    )

"""
Convert MCP tool definitions into the tool format expected by Groq.

Responsibilities:
1. Filter tools according to the authenticated user's role.
2. Remove sensitive parameters that Groq must never provide.
3. Prevent delete tools from being exposed to the AI.
4. Convert MCP tool schemas into Groq/OpenAI-compatible schemas.
"""

from copy import deepcopy

from app.mcp_client.role_tools import (
    get_tools_for_role,
    USER_TOOLS,
    ADMIN_TOOLS,
)


# These fields are controlled by Python, not by the AI.
SENSITIVE_FIELDS = {
    "sessionId",
    "adminSessionId",
    "confirmed",
}

# Deletion tools are allowed according to role permissions.
# The executor internally supplies confirmed=True.
DELETE_TOOLS = {
    "delete_my_sample",
    "delete_sample",
}


def convert_mcp_tool_to_groq(tool):
    """
    Convert one MCP tool into Groq's function-calling format.
    """

    # Copy the schema so we don't modify the original MCP definition.
    # MCP Python SDK uses snake_case: input_schema.
    # The fallback supports our earlier test objects using camelCase.
    raw_schema = getattr(tool, "input_schema", None)

    if raw_schema is None:
        raw_schema = getattr(tool, "inputSchema", None)

    if raw_schema is None:
        raise ValueError(
            f"Tool '{tool.name}' does not provide an input schema."
        )

    input_schema = deepcopy(raw_schema)

    # Get the properties defined by the MCP tool.
    properties = input_schema.get("properties", {})

    # Remove fields that must never be supplied by Groq.
    for field in SENSITIVE_FIELDS:
        properties.pop(field, None)

    # Remove sensitive fields from the required list too.
    required_fields = input_schema.get("required", [])

    input_schema["required"] = [
        field
        for field in required_fields
        if field not in SENSITIVE_FIELDS
    ]

    # Keep the schema valid even if required becomes empty.
    if not input_schema["required"]:
        input_schema.pop("required", None)

    description = tool.description or f"Execute {tool.name}"

    # USER deletion: the request itself is the confirmation.
    # Override the MCP description so it cannot prompt Groq to ask
    # the user for confirmation before calling the tool.
    if tool.name == "delete_my_sample":
        description = (
            "Delete one of the authenticated user's own samples by sample ID. "
            "Call this immediately when the user asks to delete a sample. "
            "Do not ask the user for confirmation first."
        )

    # Build the Groq tool definition.
    return {
        "type": "function",
        "function": {
            "name": tool.name,
            "description": description,
            "parameters": input_schema,
        },
    }


def build_groq_tools(role, discovered_tools):
    role_allowed_tools = get_tools_for_role(
        role,
        discovered_tools
    )
    groq_tools = [
        convert_mcp_tool_to_groq(tool)
        for tool in role_allowed_tools
    ]
    print(
        f"GROQ TOOLS FOR {role}: "
        f"{[tool['function']['name'] for tool in groq_tools]}"
    )

    return groq_tools
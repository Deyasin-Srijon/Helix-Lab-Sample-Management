from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

from app.config import MCP_SERVER_URL
from app.mcp_client.role_tools import (
    get_tools_for_role,
    USER_TOOLS,
    ADMIN_TOOLS,
)
from exceptiongroup import ExceptionGroup, BaseExceptionGroup

# Delete tools that require trusted confirmation internally.
DELETE_TOOLS = {
    "delete_my_sample",
    "delete_sample",
}

class MCPToolExecutionError(RuntimeError):
    """
    Raised when an MCP tool returns an execution error.

    This exception preserves the actual MCP error message
    so the chatbot can explain it to the user.
    """
    pass

def extract_mcp_error(exc):
    if isinstance(exc, MCPToolExecutionError):
        return exc

    if isinstance(exc, BaseExceptionGroup):
        for sub_exception in exc.exceptions:
            result = extract_mcp_error(sub_exception)
            if result:
                return result

    return None

async def execute_mcp_tool(
    tool_name: str,
    tool_arguments: dict,
    auth_context
):
    """
    Execute a role-authorized MCP tool using trusted authentication.

    Security:
    - Checks the user's role before connecting.
    - Restricts tools according to the authenticated role.
    - Verifies that the tool exists on the MCP server.
    - Injects trusted session credentials.
    - Removes AI-supplied authentication credentials.
    - Injects the required confirmation flag for deletion.
    - Preserves MCP tool execution error messages.
    """

    # -------------------------------------------------
    # STEP 1: Check role permission BEFORE connecting.
    # -------------------------------------------------

    if auth_context.role == "USER":
        role_tool_names = USER_TOOLS

    elif auth_context.role == "ADMIN":
        role_tool_names = ADMIN_TOOLS

    else:
        raise PermissionError(
            "Unsupported authentication role."
        )

    # Ensure the requested tool is permitted for this role.
    if tool_name not in role_tool_names:
        raise PermissionError(
            f"Tool '{tool_name}' is not allowed "
            f"for role '{auth_context.role}'."
        )

    # -------------------------------------------------
    # STEP 2: Connect to Java MCP server.
    # -------------------------------------------------

    async with streamable_http_client(MCP_SERVER_URL) as (
        read_stream,
        write_stream
    ):

        async with ClientSession(
            read_stream,
            write_stream
        ) as session:

            await session.initialize()

            # Discover tools from the actual MCP server.
            tools_result = await session.list_tools()

            discovered_tools = tools_result.tools

            # Filter tools using the authenticated role.
            allowed_tools = get_tools_for_role(
                auth_context.role,
                discovered_tools
            )

            allowed_tool_names = {
                tool.name for tool in allowed_tools
            }

            # -------------------------------------------------
            # STEP 3: Verify the tool exists and is permitted.
            # -------------------------------------------------

            if tool_name not in allowed_tool_names:
                raise ValueError(
                    f"MCP tool '{tool_name}' was not found "
                    f"or is unavailable for this role."
                )

            # -------------------------------------------------
            # STEP 4: Sanitize AI-supplied arguments.
            # -------------------------------------------------

            safe_arguments = dict(tool_arguments or {})

            # Never trust AI-supplied authentication.
            safe_arguments.pop("sessionId", None)
            safe_arguments.pop("adminSessionId", None)

            # Never trust AI-supplied confirmation.
            safe_arguments.pop("confirmed", None)

            # -------------------------------------------------
            # STEP 5: Handle deletion confirmation internally.
            # -------------------------------------------------

            if tool_name in DELETE_TOOLS:

                # Inject confirmation from the trusted application.
                # The AI cannot control this value.
                safe_arguments["confirmed"] = True

            # -------------------------------------------------
            # STEP 6: Inject trusted session credentials.
            # -------------------------------------------------

            if auth_context.role == "USER":

                safe_arguments["sessionId"] = (
                    auth_context.session_cookie
                )

            elif auth_context.role == "ADMIN":

                safe_arguments["adminSessionId"] = (
                    auth_context.session_cookie
                )

            # -------------------------------------------------
            # STEP 7: Execute the MCP tool.
            # -------------------------------------------------

            result = await session.call_tool(
                tool_name,
                arguments=safe_arguments
            )

            # -------------------------------------------------
            # STEP 8: Check execution result.
            # -------------------------------------------------

            if result.is_error:

                error_message = (
                    "The MCP tool execution failed."
                )

                if result.content:

                    error_parts = []

                    for item in result.content:

                        if (
                            hasattr(item, "text")
                            and item.text
                        ):
                            error_parts.append(item.text)

                    if error_parts:
                        error_message = " ".join(
                            error_parts
                        )

                raise MCPToolExecutionError(
                    error_message
                )

            # -------------------------------------------------
            # STEP 9: Return successful result.
            # -------------------------------------------------
            return result


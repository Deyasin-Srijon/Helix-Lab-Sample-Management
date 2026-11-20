from typing import Literal


# --------------------------------------------------
# Define role-specific MCP tool permissions
# --------------------------------------------------
# These lists define which MCP tools are permitted
# for each application role.
#
# Never allow Groq to determine its own permissions.
# The authenticated application role controls access.


USER_TOOLS = {
    "create_sample",
    "get_my_samples",
    "get_my_sample_by_id",
    "update_my_sample",
    "delete_my_sample",
}


ADMIN_TOOLS = {
    "get_all_samples",
    "get_sample_by_id",
    "update_sample",
    "delete_sample",
    "filter_samples_by_status",
    "filter_samples_by_user",
}


# --------------------------------------------------
# Filter discovered MCP tools based on role
# --------------------------------------------------

def get_tools_for_role(
    role: Literal["USER", "ADMIN"],
    discovered_tools: list
) -> list:

    # Select the permitted tool names for the role.
    if role == "USER":
        allowed_names = USER_TOOLS

    elif role == "ADMIN":
        allowed_names = ADMIN_TOOLS

    else:
        # Fail closed.
        # Unknown roles must never receive any tools.
        return []

    # Return only tools that are explicitly allowed.
    return [
        tool
        for tool in discovered_tools
        if tool.name in allowed_names
    ]

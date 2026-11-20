# test_groq_tools.py

"""
Tests for converting MCP tools into Groq tool schemas.
"""

from types import SimpleNamespace

from app.mcp_client.groq_tools import build_groq_tools


# Create fake MCP tool definitions for testing.
def create_fake_tool(name, description, properties, required=None):

    # Simulate the structure of an MCP tool.
    return SimpleNamespace(
        name=name,
        description=description,
        inputSchema={
            "type": "object",
            "properties": properties,
            "required": required or [],
        },
    )


# Fake User tools
fake_user_tools = [
    create_fake_tool(
        "create_sample",
        "Create a lab sample.",
        {
            "sampleName": {"type": "string"},
            "description": {"type": "string"},
            "sessionId": {"type": "string"},
        },
        ["sampleName", "sessionId"],
    ),
    create_fake_tool(
        "get_my_samples",
        "Get the logged-in user's samples.",
        {
            "sessionId": {"type": "string"},
        },
        ["sessionId"],
    ),
    create_fake_tool(
        "delete_my_sample",
        "Delete a sample.",
        {
            "sampleId": {"type": "integer"},
            "confirmed": {"type": "boolean"},
            "sessionId": {"type": "string"},
        },
        ["sampleId", "confirmed", "sessionId"],
    ),
]

# Fake Admin tools
fake_admin_tools = [
    create_fake_tool(
        "get_all_samples",
        "Get all lab samples.",
        {
            "adminSessionId": {"type": "string"},
        },
        ["adminSessionId"],
    ),
    create_fake_tool(
        "filter_samples_by_status",
        "Filter samples by status.",
        {
            "status": {"type": "string"},
            "adminSessionId": {"type": "string"},
        },
        ["status", "adminSessionId"],
    ),
    create_fake_tool(
        "delete_sample",
        "Delete any sample.",
        {
            "sampleId": {"type": "integer"},
            "confirmed": {"type": "boolean"},
            "adminSessionId": {"type": "string"},
        },
        ["sampleId", "confirmed", "adminSessionId"],
    ),
]


def test_user_tools_conversion():

    print("\n========== TEST 1: USER TOOL CONVERSION ==========")

    result = build_groq_tools("USER", fake_user_tools)

    tool_names = [
        tool["function"]["name"]
        for tool in result
    ]

    # User must not receive Admin tools.
    assert "get_all_samples" not in tool_names

    # Delete must not be exposed.
    assert "delete_my_sample" not in tool_names

    # Expected safe User tools should be present.
    assert "create_sample" in tool_names
    assert "get_my_samples" in tool_names

    # Sensitive fields must not be exposed to Groq.
    for tool in result:
        schema = tool["function"]["parameters"]
        properties = schema.get("properties", {})

        assert "sessionId" not in properties
        assert "adminSessionId" not in properties
        assert "confirmed" not in properties

        for field in schema.get("required", []):
            assert field not in {
                "sessionId",
                "adminSessionId",
                "confirmed",
            }

    print("PASS: User tools converted and sensitive fields removed.")


def test_admin_tools_conversion():

    print("\n========== TEST 2: ADMIN TOOL CONVERSION ==========")

    result = build_groq_tools("ADMIN", fake_admin_tools)

    tool_names = [
        tool["function"]["name"]
        for tool in result
    ]

    # Admin must not receive User tools.
    assert "create_sample" not in tool_names
    assert "get_my_samples" not in tool_names

    # Delete must not be exposed.
    assert "delete_sample" not in tool_names

    # Expected Admin tools should be present.
    assert "get_all_samples" in tool_names
    assert "filter_samples_by_status" in tool_names

    # Admin session ID must not be exposed.
    for tool in result:
        schema = tool["function"]["parameters"]
        properties = schema.get("properties", {})

        assert "adminSessionId" not in properties

        for field in schema.get("required", []):
            assert field != "adminSessionId"

    print("PASS: Admin tools converted and sensitive fields removed.")


def test_groq_schema_format():

    print("\n========== TEST 3: GROQ SCHEMA FORMAT ==========")

    result = build_groq_tools("USER", fake_user_tools)

    for tool in result:

        assert tool["type"] == "function"

        function = tool["function"]

        assert "name" in function
        assert "description" in function
        assert "parameters" in function

        assert function["parameters"]["type"] == "object"

    print("PASS: Groq schema structure is valid.")


def test_original_schema_unchanged():

    print("\n========== TEST 4: ORIGINAL MCP SCHEMA ==========")

    original_schema = fake_user_tools[0].inputSchema.copy()

    build_groq_tools("USER", fake_user_tools)

    # The original MCP schema should remain unchanged.
    assert fake_user_tools[0].inputSchema == original_schema

    print("PASS: Original MCP tool schemas remain unchanged.")


if __name__ == "__main__":

    test_user_tools_conversion()
    test_admin_tools_conversion()
    test_groq_schema_format()
    test_original_schema_unchanged()

    print("\n====================================")
    print("ALL GROQ TOOL CONVERSION TESTS PASSED")
    print("====================================")
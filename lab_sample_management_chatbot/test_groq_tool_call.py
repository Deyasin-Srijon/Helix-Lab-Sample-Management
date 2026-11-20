import asyncio

from app.mcp_client.client import discover_mcp_tools
from app.mcp_client.groq_tools import build_groq_tools
from app.services.groq_service import generate_tool_call_response


async def main():

    print("\n========== GROQ TOOL-CALL TEST ==========\n")

    # Discover the available MCP tools.
    discovered_tools = await discover_mcp_tools()

    # Simulate a USER role.
    # Only User tools will be exposed to Groq.
    groq_tools = build_groq_tools(
        "USER",
        discovered_tools
    )

    print("Tools exposed to Groq:")

    for tool in groq_tools:
        print("-", tool["function"]["name"])

    # Ask a question that should require a backend tool.
    user_message = "Show me my lab samples."

    print("\nUser message:", user_message)

    # Ask Groq to choose a tool or reply normally.
    # No MCP tool is executed in this test.
    response = await generate_tool_call_response(
        user_message,
        groq_tools
    )

    print("\nGroq response text:")
    print(response.content)

    print("\nGroq tool calls:")

    if response.tool_calls:

        for tool_call in response.tool_calls:
            print("Tool name:", tool_call.function.name)
            print("Arguments:", tool_call.function.arguments)

    else:
        print("No tool calls were returned.")

    print("\n=======================================")


if __name__ == "__main__":
    asyncio.run(main())

import asyncio

from app.mcp_client.client import discover_mcp_tools


# --------------------------------------------------
# Test the Python-to-Java MCP connection
# --------------------------------------------------

async def main():

    print("=" * 60)
    print("Connecting to Java MCP Server...")
    print("=" * 60)

    try:

        # Discover the tools exposed by the Java MCP server.
        tools = await discover_mcp_tools()

        print("\nConnection successful!")
        print(f"Total tools discovered: {len(tools)}")

        print("\nAvailable MCP Tools:")
        print("-" * 60)

        # Display each tool's name and description.
        for tool in tools:

            print(f"\nTool Name: {tool.name}")
            print(f"Description: {tool.description}")

        print("\n" + "=" * 60)
        print("MCP tool discovery completed successfully.")
        print("=" * 60)

    except Exception as error:

        print("\nMCP connection failed!")
        print(f"Error: {error}")


# Run the asynchronous test function.
if __name__ == "__main__":
    asyncio.run(main())

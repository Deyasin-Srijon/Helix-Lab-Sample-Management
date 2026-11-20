import asyncio

from app.mcp_client.client import discover_mcp_tools
from app.mcp_client.role_tools import get_tools_for_role


async def main():

    # Discover tools from the Java MCP server.
    all_tools = await discover_mcp_tools()

    # Apply User permissions.
    user_tools = get_tools_for_role(
        "USER",
        all_tools
    )

    # Apply Admin permissions.
    admin_tools = get_tools_for_role(
        "ADMIN",
        all_tools
    )

    # Print User tools.
    print("\nUSER ROLE TOOLS")
    print("=" * 50)

    for tool in user_tools:
        print(tool.name)

    # Print Admin tools.
    print("\nADMIN ROLE TOOLS")
    print("=" * 50)

    for tool in admin_tools:
        print(tool.name)

    # Print counts.
    print("\nTOOL COUNTS")
    print("=" * 50)
    print(f"All tools: {len(all_tools)}")
    print(f"User tools: {len(user_tools)}")
    print(f"Admin tools: {len(admin_tools)}")


if __name__ == "__main__":
    asyncio.run(main())

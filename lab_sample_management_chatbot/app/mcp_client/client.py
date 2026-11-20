from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

from app.config import MCP_SERVER_URL


# --------------------------------------------------
# Connect to the Java MCP Server
# --------------------------------------------------
# This function opens an MCP connection using
# Streamable HTTP.
#
# It initializes the protocol session and asks
# the Java MCP server for its available tools.
#
# We are only discovering tools at this stage.
# No CRUD tool is executed here.


async def discover_mcp_tools():

    # Open a Streamable HTTP connection to the Java server.
    async with streamable_http_client(
        MCP_SERVER_URL
    ) as (read_stream, write_stream):

        # Create an MCP client session using the streams.
        async with ClientSession(
            read_stream,
            write_stream
        ) as session:

            # Initialize the MCP protocol session.
            await session.initialize()

            # Request the available tools from the server.
            tools_result = await session.list_tools()

            # Return the tool definitions.
            return tools_result.tools

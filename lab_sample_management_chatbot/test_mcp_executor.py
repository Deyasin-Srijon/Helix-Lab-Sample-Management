import asyncio

from app.auth.auth_context import AuthContext
from app.mcp_client.executor import execute_mcp_tool


# Fake authentication contexts.
# These contain dummy session strings and are NOT real logins.

fake_user = AuthContext(
    role="USER",
    user_id=5,
    username="testuser",
    session_cookie="INVALID-TEST-USER-SESSION",
    cookie_name="JSESSIONID",
)

fake_admin = AuthContext(
    role="ADMIN",
    user_id=1,
    username="Admin",
    session_cookie="INVALID-TEST-ADMIN-SESSION",
    cookie_name="ADMINSESSIONID",
)


async def main():

    print("\n========== TEST 1: USER READ TOOL ==========")

    try:
        result = await execute_mcp_tool(
            tool_name="get_my_samples",
            tool_arguments={},
            auth_context=fake_user,
        )

        print("Tool call completed.")
        print("Raw MCP result:", repr(result))

        # Inspect the returned MCP object without assuming
        # its property names.
        if hasattr(result, "model_dump"):
            print("MCP result fields:", result.model_dump())

    except Exception as error:
        print("USER read test raised:", type(error).__name__)
        print("Message:", str(error))


    print("\n========== TEST 2: ADMIN READ TOOL ==========")

    try:
        result = await execute_mcp_tool(
            tool_name="get_all_samples",
            tool_arguments={},
            auth_context=fake_admin,
        )

        print("Tool call completed.")
        print("Raw MCP result:", repr(result))

        # Inspect the returned MCP object without assuming
        # its property names.
        if hasattr(result, "model_dump"):
            print("MCP result fields:", result.model_dump())

    except Exception as error:
        print("ADMIN read test raised:", type(error).__name__)
        print("Message:", str(error))


    print("\n========== TEST 3: USER BLOCKED FROM ADMIN ==========")

    try:
        await execute_mcp_tool(
            tool_name="get_all_samples",
            tool_arguments={},
            auth_context=fake_user,
        )

        print("FAIL: USER unexpectedly accessed an Admin tool.")

    except PermissionError:
        print("PASS: USER blocked from Admin tool.")


    print("\n========== TEST 4: ADMIN BLOCKED FROM USER ==========")

    try:
        await execute_mcp_tool(
            tool_name="get_my_samples",
            tool_arguments={},
            auth_context=fake_admin,
        )

        print("FAIL: ADMIN unexpectedly accessed a User tool.")

    except PermissionError:
        print("PASS: ADMIN blocked from User tool.")


    print("\n========== TEST 5: DELETE BLOCKED ==========")

    try:
        await execute_mcp_tool(
            tool_name="delete_my_sample",
            tool_arguments={"sampleId": 1},
            auth_context=fake_user,
        )

        print("FAIL: Delete was unexpectedly allowed.")

    except PermissionError:
        print("PASS: Delete is blocked pending confirmation.")


if __name__ == "__main__":
    asyncio.run(main())

import asyncio
from getpass import getpass

from app.auth.authentication import verify_user_session
from app.auth.auth_context import AuthContext
from app.services.tool_call_service import process_chat_with_tools


async def main():

    print("\n========== END-TO-END TOOL CALL TEST ==========\n")

    # ------------------------------------------
    # Step 1: Obtain a real user session cookie
    # ------------------------------------------

    session_cookie = getpass(
        "Enter your JSESSIONID (input hidden): "
    ).strip()

    if not session_cookie:
        print("No session cookie provided. Test cancelled.")
        return

    # ------------------------------------------
    # Step 2: Verify the session with the backend
    # ------------------------------------------

    user_data = await verify_user_session(session_cookie)

    if not user_data:
        print("Invalid user session. Please log in again.")
        return

    print("User session verified successfully.")

    # ------------------------------------------
    # Step 3: Create trusted authentication context
    # ------------------------------------------

    auth_context = AuthContext(
        role="USER",
        user_id=user_data["userId"],
        username=user_data["username"],
        session_cookie=session_cookie,
        cookie_name="JSESSIONID"
    )

    print("Authenticated role:", auth_context.role)
    print("Authenticated username:", auth_context.username)

    # ------------------------------------------
    # Step 4: Ask the chatbot to retrieve samples
    # ------------------------------------------

    user_message = "Show me my lab samples."

    print("\nUser message:", user_message)
    print("\nProcessing request through Groq and MCP...\n")

    # ------------------------------------------
    # Step 5: Run the tool-calling loop
    # ------------------------------------------

    response = await process_chat_with_tools(
        user_message,
        auth_context
    )

    # ------------------------------------------
    # Step 6: Display final response
    # ------------------------------------------

    print("\n========== CHATBOT RESPONSE ==========\n")
    print(response)
    print("\n==================================")

    print("\nTest completed.")


if __name__ == "__main__":
    asyncio.run(main())

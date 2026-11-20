import httpx
from fastapi import HTTPException

from app.auth.auth_context import AuthContext


# Existing backend addresses
USER_BACKEND_URL = "http://127.0.0.1:8080"
ADMIN_BACKEND_URL = "http://127.0.0.1:8081"

TIMEOUT = 5.0


async def verify_user_session(cookie: str) -> dict | None:
    """
    Verifies a user session through the User backend.

    Returns the user details if valid.
    Returns None if the session is invalid or expired.
    """

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:

        response = await client.get(
            f"{USER_BACKEND_URL}/api/users/me",
            cookies={"JSESSIONID": cookie}
        )

        if response.status_code in (401, 403):
            return None

        # A backend error is not the same as an invalid session.
        if response.status_code != 200:
            raise HTTPException(
                status_code=503,
                detail="User authentication service is unavailable."
            )

        return response.json()


async def verify_admin_session(cookie: str) -> dict | None:
    """
    Verifies an admin session through the Admin backend.

    Returns the admin details if valid.
    Returns None if the session is invalid or expired.
    """

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:

        response = await client.get(
            f"{ADMIN_BACKEND_URL}/api/admin/me",
            cookies={"ADMINSESSIONID": cookie}
        )

        if response.status_code in (401, 403):
            return None

        if response.status_code != 200:
            raise HTTPException(
                status_code=503,
                detail="Admin authentication service is unavailable."
            )

        return response.json()


async def authenticate_chat_request(
    user_cookie: str | None,
    admin_cookie: str | None
) -> AuthContext:
    """
    Validates incoming sessions and creates a trusted AuthContext.

    A valid admin session takes precedence over a user session.
    The role is determined ONLY by the backend verification response.
    """

    # Try admin authentication first.
    if admin_cookie:

        try:
            admin_details = await verify_admin_session(admin_cookie)

            if admin_details is not None:
                return AuthContext(
                    role="ADMIN",
                    user_id=int(admin_details["adminId"]),
                    username=admin_details["username"],
                    session_cookie=admin_cookie,
                    cookie_name="ADMINSESSIONID"
                )


        except httpx.ConnectError:
            raise HTTPException(
                status_code=503,
                detail="Admin authentication service is unavailable. Please try again later."
            )

    # If admin authentication failed, try the user session.
    if user_cookie:

        user_details = await verify_user_session(user_cookie)

        if user_details is not None:

            return AuthContext(
                role="USER",
                user_id=int(user_details["userId"]),
                username=user_details["username"],
                session_cookie=user_cookie,
                cookie_name="JSESSIONID"
            )

    # Neither session was verified.
    raise HTTPException(
        status_code=401,
        detail="Please log in to use the chatbot."
    )

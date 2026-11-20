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

        if response.status_code in (301, 302, 303, 307, 401, 403):
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

        if response.status_code in (301, 302, 303, 307, 401, 403):
            return None

        if response.status_code != 200:
            raise HTTPException(
                status_code=503,
                detail="Admin authentication service is unavailable."
            )

        return response.json()


async def authenticate_chat_request(
    user_cookie: str | None,
    admin_cookie: str | None,
    portal: str | None = None
) -> AuthContext:
    """
    Validates the session that belongs to THIS request and creates
    a trusted AuthContext.

    Why `portal` exists:
        The User app (8080) and Admin app (8081) use different cookie
        names (JSESSIONID / ADMINSESSIONID), so a browser can hold BOTH
        at once. The server cannot tell from the cookies alone which
        app the person is using. The frontend therefore states which
        portal the chat widget belongs to ("USER" or "ADMIN").

        This hint only SELECTS which cookie is checked. It never grants
        a role: the role is still decided solely by the matching Spring
        backend's verification response. Claiming "ADMIN" without a valid
        admin session is simply a 401.

    Rules:
        - Only the cookie for the selected portal is validated.
        - There is NO fallback to the other role's cookie, ever.
        - If no portal is given, it is accepted only when exactly one
          cookie is present. With two cookies it is ambiguous, so the
          request is rejected instead of guessing.
    """

    portal = (portal or "").strip().upper() or None

    if portal not in (None, "USER", "ADMIN"):
        raise HTTPException(
            status_code=400,
            detail="Invalid chat portal."
        )

    # Backward compatibility: infer the portal only when unambiguous.
    if portal is None:

        if user_cookie and admin_cookie:
            raise HTTPException(
                status_code=400,
                detail="Chat portal must be specified when both user and "
                       "admin sessions are present."
            )

        if admin_cookie:
            portal = "ADMIN"
        elif user_cookie:
            portal = "USER"

    # Nothing to validate.
    if portal == "ADMIN" and not admin_cookie:
        raise HTTPException(
            status_code=401,
            detail="Please log in to use the chatbot."
        )

    if portal == "USER" and not user_cookie:
        raise HTTPException(
            status_code=401,
            detail="Please log in to use the chatbot."
        )

    if portal is None:
        raise HTTPException(
            status_code=401,
            detail="Please log in to use the chatbot."
        )

    # -------------------------------------------------
    # Validate ONLY the selected portal's session.
    # -------------------------------------------------

    try:

        if portal == "ADMIN":

            admin_details = await verify_admin_session(admin_cookie)

            if admin_details is None:
                raise HTTPException(
                    status_code=401,
                    detail="Your admin session has expired. "
                           "Please log in again."
                )

            return AuthContext(
                role="ADMIN",
                user_id=int(admin_details["adminId"]),
                username=admin_details["username"],
                session_cookie=admin_cookie,
                cookie_name="ADMINSESSIONID"
            )

        user_details = await verify_user_session(user_cookie)

        if user_details is None:
            raise HTTPException(
                status_code=401,
                detail="Your session has expired. Please log in again."
            )

        return AuthContext(
            role="USER",
            user_id=int(user_details["userId"]),
            username=user_details["username"],
            session_cookie=user_cookie,
            cookie_name="JSESSIONID"
        )

    except httpx.RequestError:
        # Connect errors, timeouts, etc. The backend is unreachable,
        # which is not the same as an invalid session.
        raise HTTPException(
            status_code=503,
            detail="Authentication service is unavailable. "
                   "Please try again later."
        )
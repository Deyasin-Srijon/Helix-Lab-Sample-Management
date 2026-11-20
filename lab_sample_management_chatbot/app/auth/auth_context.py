from dataclasses import dataclass
from typing import Literal


# This represents a user or admin whose session has been
# successfully verified by the original Spring Boot backend.
@dataclass
class AuthContext:

    # Only these two roles are permitted.
    role: Literal["USER", "ADMIN"]

    # ID returned by the actual backend /me endpoint.
    user_id: int

    # Username returned by the backend.
    username: str

    # The actual verified session cookie value.
    # This must never be sent to Groq.
    session_cookie: str

    # Cookie name differs between User and Admin backends.
    cookie_name: Literal["JSESSIONID", "ADMINSESSIONID"]
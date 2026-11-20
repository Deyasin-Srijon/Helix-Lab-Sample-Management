import logging
logger = logging.getLogger(__name__)
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from app.auth.authentication import authenticate_chat_request

from app.schemas import ChatRequest, ChatResponse
from app.services.tool_call_service import process_chat_with_tools


# --------------------------------------------------
# Create the FastAPI application
# --------------------------------------------------

app = FastAPI(
    title="Lab Sample Management Chatbot API",
    description="AI chatbot API for the Lab Sample Management System",
    version="1.0.0"
)


# --------------------------------------------------
# Configure CORS
# --------------------------------------------------
# CORS allows our React frontend to communicate with
# this Python backend when they run on different ports.
#
# During development, React may run on port 5173
# (Vite) or 3000 (Create React App).
#
# We will adjust this configuration when integrating
# the actual frontend and authentication cookies.

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Health-check endpoint
# --------------------------------------------------
# This endpoint allows us to verify that the Python
# chatbot API is running properly.
#
# URL: GET /api/health

@app.get("/api/health")
def health_check():

    return {
        "status": "healthy",
        "service": "lab-sample-chatbot"
    }


# --------------------------------------------------
# Chat endpoint — Groq AI
# --------------------------------------------------
# This endpoint receives a user's message,
# sends it to the Groq AI service,
# and returns the AI-generated response.
#
# URL: POST /api/chat

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, http_request: Request):

    try:
        # ---------------------------------------------
        # STEP 1: Read session cookies from the request
        # ---------------------------------------------
        user_cookie = http_request.cookies.get("JSESSIONID")
        admin_cookie = http_request.cookies.get("ADMINSESSIONID")

        print("CHAT: Starting authentication")

        # ---------------------------------------------
        # STEP 2: Verify session and establish trusted role
        # ---------------------------------------------
        print("CHAT: User cookie present =", bool(user_cookie))
        print("CHAT: Admin cookie present =", bool(admin_cookie))
        auth_context = await authenticate_chat_request(
            user_cookie=user_cookie,
            admin_cookie=admin_cookie
        )

        print("CHAT: Authentication successful")
        print(f"CHAT: Authenticated role = {auth_context.role}")

        # ---------------------------------------------
        # STEP 3: Start chatbot processing
        # ---------------------------------------------
        print("CHAT: Starting chatbot processing")

        reply = await process_chat_with_tools(
            user_message=request.message,
            auth_context=auth_context
        )

        print("CHAT: Chatbot processing completed")

        # ---------------------------------------------
        # STEP 4: Return response
        # ---------------------------------------------
        return ChatResponse(
            reply=reply
        )

    except HTTPException:
        # Preserve authentication and service error codes
        raise


    except Exception:
        logger.exception("Unexpected error in chat endpoint")
        raise HTTPException(
            status_code=502,
            detail="The chatbot service is temporarily unavailable."

        )
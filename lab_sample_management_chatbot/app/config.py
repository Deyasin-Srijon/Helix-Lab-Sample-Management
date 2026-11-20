import os

from dotenv import load_dotenv


# Load environment variables from the .env file
# located in the project root.
load_dotenv()


# Groq API configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-120b"
)

# Chatbot server configuration
CHATBOT_HOST = os.getenv(
    "CHATBOT_HOST",
    "127.0.0.1"
)

CHATBOT_PORT = int(
    os.getenv("CHATBOT_PORT", "8000")
)


# Java MCP server configuration
MCP_SERVER_URL = os.getenv(
    "MCP_SERVER_URL",
    "http://127.0.0.1:8082/mcp"
)


# Validate the required API key
if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is missing. "
        "Please configure it in your .env file."
    )

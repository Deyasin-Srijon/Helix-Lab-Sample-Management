from pydantic import BaseModel, Field


# This model defines the data that the frontend
# is allowed to send to our chatbot API.
class ChatRequest(BaseModel):

    # The message typed by the user.
    # Field(...) means this field is required.
    # min_length=1 prevents empty messages.
    message: str = Field(
        ...,
        min_length=1,
        description="The user's message to the chatbot"
    )


# This model defines the response structure
# that our chatbot API will return to the frontend.
class ChatResponse(BaseModel):

    # The chatbot's reply.
    reply: str

    # Indicates whether the chatbot is awaiting
    # confirmation for a sensitive operation.
    requires_confirmation: bool = False

    # Optional operation identifier for a pending action.
    action_id: str | None = None

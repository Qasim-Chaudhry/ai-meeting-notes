from openai import OpenAI, APIError, APIConnectionError, RateLimitError
from fastapi import HTTPException, status

from app.core.config import settings
from app.schemas.ai import MeetingAIResponse

# Groq is OpenAI-compatible, so we just point the client at Groq's base URL
client = OpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

MODEL_NAME = "openai/gpt-oss-120b"

SYSTEM_PROMPT = """You are an assistant that extracts structured information from meeting notes.

Rules:
- Generate a concise summary of the meeting (2-4 sentences).
- Extract clear, concise action items (tasks) mentioned in the notes.
- NEVER invent an owner. If no owner is explicitly mentioned for a task, set owner to null.
- NEVER invent a deadline. If no deadline is explicitly mentioned for a task, set deadline to null.
- Do not guess or infer information that isn't explicitly stated in the notes.
- Keep each task description short and actionable.
"""


async def process_meeting_notes(notes: str) -> MeetingAIResponse:
    """
    Sends raw meeting notes to the AI model and returns a structured
    summary + list of action items.
    """
    try:
        completion = client.chat.completions.parse(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Meeting notes:\n\n{notes}"},
            ],
            response_format=MeetingAIResponse,
            temperature=0.2,
        )

        parsed = completion.choices[0].message.parsed
        if parsed is None:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI service returned an unparseable response.",
            )
        return parsed

    except RateLimitError:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="AI service rate limit exceeded. Please try again shortly.",
        )
    except APIConnectionError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not connect to the AI service. Please try again later.",
        )
    except APIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {str(e)}",
        )
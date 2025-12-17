from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

router = APIRouter()

N8N_WEBHOOK_URL = "http://localhost:5678/webhook/myhook"
class Question(BaseModel):
    question: str

@router.post("/ask-n8n")
async def ask_n8n(request: Question):
    """
    Receives a question, sends it to an n8n workflow, and returns the answer.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(N8N_WEBHOOK_URL, json={"question": request.question,
                                                                "session_id": "12345"})
            response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
            print(response.json())
            return response.json()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while requesting n8n workflow: {exc}",
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"n8n workflow returned an error: {exc.response.text}",
        )
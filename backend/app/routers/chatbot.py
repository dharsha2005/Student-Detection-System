from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
import requests
import os

from app.database import get_database
from app.auth import get_current_user_chat
from app.models import User

router = APIRouter()

# =========================
# OLLAMA CONFIG
# =========================
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3:3.8b")

# =========================
# REQUEST / RESPONSE MODELS
# =========================
class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_email: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    confidence: float
    data_sources: List[str]
    follow_up_questions: List[str]
    explanation: Optional[str] = None


# =========================
# CHATBOT SERVICE
# =========================
class ChatbotService:
    def __init__(self):
        self.sessions = {}
        self.ollama_available = None
        self.http = requests.Session()

    # ---------- INTENT ----------
    async def analyze_intent(self, message: str, role: str) -> str:
        msg = message.lower()

        if any(k in msg for k in ["my", "me", "my gpa", "my performance"]):
            return "student"
        if any(k in msg for k in ["how many", "total", "average", "overall"]):
            return "admin"
        if "risk" in msg:
            return "risk"
        if any(k in msg for k in ["recommend", "improve", "suggest"]):
            return "recommend"
        return "general"

    # ---------- DATA ----------
    async def fetch_data(self, intent: str, user: User, db):
        data = {}

        if intent == "student":
            student = await db.students.find_one({"email": user.email})
            if student:
                data["student"] = student
                pred = await db.predictions.find_one(
                    {"student_id": str(student["_id"])},
                    sort=[("created_at", -1)]
                )
                if pred:
                    data["prediction"] = pred

        else:
            students = await db.students.find({}).to_list(200)
            preds = await db.predictions.find({}).to_list(200)

            data["students"] = students
            data["predictions"] = preds

        return data

    # ---------- CONTEXT (VERY SMALL) ----------
    def build_context(self, intent: str, data: Dict[str, Any]) -> str:
        ctx = "STUDENT DATABASE DATA:\n"

        if intent == "student" and "student" in data:
            s = data["student"]
            ctx += (
                f"GPA: {s.get('previous_gpa')}\n"
                f"Attendance: {s.get('attendance_percentage')}%\n"
                f"Study Hours: {s.get('study_hours')}/week\n"
                f"Internal Marks: {s.get('internal_marks')}\n"
                f"Assignments: {s.get('assignment_scores')}\n"
                f"Lab: {s.get('lab_performance')}\n"
            )

            if "prediction" in data:
                p = data["prediction"]
                ctx += (
                    f"Risk Score: {p.get('risk_score')}\n"
                    f"Performance: {p.get('predicted_performance')}\n"
                )

        elif "students" in data:
            students = data["students"]
            preds = data.get("predictions", [])

            avg_gpa = sum(s.get("previous_gpa", 0) for s in students) / len(students)
            at_risk = len([p for p in preds if p.get("risk_score", 0) >= 0.6])

            ctx += (
                f"Total Students: {len(students)}\n"
                f"Average GPA: {avg_gpa:.2f}\n"
                f"At Risk Students: {at_risk}\n"
            )

        return ctx

    # ---------- OLLAMA CHECK (CACHED) ----------
    async def check_ollama(self):
        if self.ollama_available is not None:
            return self.ollama_available
        try:
            r = self.http.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=3)
            self.ollama_available = r.status_code == 200
        except:
            self.ollama_available = False
        return self.ollama_available

    # ---------- CALL OLLAMA (FAST MODE) ----------
    async def call_ollama(self, prompt: str, context: str) -> str:
        available = await self.check_ollama()
        if not available:
            return "AI engine not running. Please start Ollama."

        full_prompt = f"""
You are a student performance assistant.
Answer ONLY from the data below.
If data is missing, say so.

{context}

Question: {prompt}

Answer briefly in bullet points.
"""

        payload = {
            "model": OLLAMA_MODEL,
            "prompt": full_prompt,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "num_predict": 200,
                "top_k": 20,
                "repeat_penalty": 1.1
            }
        }

        try:
            res = await asyncio.to_thread(
                self.http.post,
                f"{OLLAMA_BASE_URL}/api/generate",
                json=payload,
                timeout=60
            )
            return res.json().get("response", "No response generated.")
        except:
            return "AI model timeout. Try again."

    # ---------- FOLLOW UPS ----------
    def followups(self, intent: str):
        if intent == "student":
            return [
                "Why is my risk score high?",
                "How can I improve my GPA?",
                "Which factor affects me most?"
            ]
        if intent == "admin":
            return [
                "Show high risk students",
                "Performance by major",
                "Attendance vs GPA"
            ]
        return ["Ask another performance question"]

    # ---------- MAIN ----------
    async def process(self, message: str, user: User, session_id: str):
        intent = await self.analyze_intent(message, user.role)
        db = get_database()
        data = await self.fetch_data(intent, user, db)
        context = self.build_context(intent, data)

        answer = await self.call_ollama(message, context)
        confidence = 0.9 if data else 0.6

        return ChatResponse(
            response=answer,
            confidence=confidence,
            data_sources=list(data.keys()),
            follow_up_questions=self.followups(intent),
            explanation=None if confidence > 0.85 else "Limited data available"
        )


chatbot = ChatbotService()

@router.post("/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    user = await get_current_user_chat(message.user_email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")

    return await chatbot.process(
        message.message,
        user,
        message.session_id or "default"
    )

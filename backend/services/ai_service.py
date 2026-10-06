from groq import Groq
import json
from core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)
MODEL = "llama-3.3-70b-versatile"

SYNOPSIS_PROMPT = """You are an educational content summarizer.
Given the following video transcript, write a clear and concise synopsis of 150-250 words
that captures the key concepts, main points, and important takeaways from the video.
Write in plain English. Do not use bullet points. Output only the synopsis text.

TRANSCRIPT:
{transcript}"""

QUIZ_PROMPT = """You are a quiz generator for educational content.
Based on the following synopsis, generate exactly 10 multiple-choice questions.
Each question must have 4 options labeled A, B, C, D with exactly one correct answer.

Return ONLY a valid JSON array in this exact format, no other text:
[
  {{
    "question": "Question text here?",
    "options": [
      {{"key": "A", "text": "Option A text"}},
      {{"key": "B", "text": "Option B text"}},
      {{"key": "C", "text": "Option C text"}},
      {{"key": "D", "text": "Option D text"}}
    ],
    "answer": "A"
  }}
]

SYNOPSIS:
{synopsis}"""

def generate_synopsis(transcript_chunks: list[dict]) -> str:
    transcript_text = " ".join(c["text"] for c in transcript_chunks[:300])
    response = client.chat.completions.create(
        model=MODEL,
        temperature=0,
        max_tokens=500,
        messages=[{"role": "user", "content": SYNOPSIS_PROMPT.format(transcript=transcript_text)}],
    )
    return response.choices[0].message.content.strip()

def generate_quiz(synopsis: str) -> list[dict]:
    response = client.chat.completions.create(
        model=MODEL,
        temperature=0,
        max_tokens=2000,
        messages=[{"role": "user", "content": QUIZ_PROMPT.format(synopsis=synopsis)}],
    )
    raw = response.choices[0].message.content.strip()
    return json.loads(raw)
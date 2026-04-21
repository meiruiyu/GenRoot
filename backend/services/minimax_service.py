import httpx
import json
from typing import Optional, Dict, Any
from ..core.config import settings


class MiniMaxService:
    def __init__(self):
        self.api_key = settings.MINIMAX_API_KEY
        self.base_url = settings.MINIMAX_API_BASE
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        } if self.api_key else {}

    async def speech_to_text(self, audio_url: str, language: str = "zh") -> Dict[str, Any]:
        if not self.api_key:
            return {"transcription": "API key not configured", "error": True}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/audio/speech-to-text",
                    headers=self.headers,
                    json={
                        "model": "speech-01",
                        "audio_url": audio_url,
                        "language": language
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            return {"transcription": "", "error": str(e)}

    async def translate_text(
        self,
        text: str,
        source_language: str = "zh",
        target_language: str = "en"
    ) -> Dict[str, Any]:
        if not self.api_key:
            return {"translation": text, "error": True}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/text/translate",
                    headers=self.headers,
                    json={
                        "model": "translation-01",
                        "text": text,
                        "source_language": source_language,
                        "target_language": target_language
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            return {"translation": text, "error": str(e)}

    async def summarize_text(self, text: str, language: str = "en") -> Dict[str, Any]:
        if not self.api_key:
            return {"summary": text[:200], "error": True}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/text/summarize",
                    headers=self.headers,
                    json={
                        "model": "abab6.5s-chat",
                        "text": text,
                        "language": language,
                        "max_length": 200
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            return {"summary": text[:200], "error": str(e)}

    async def extract_entities(self, text: str) -> Dict[str, Any]:
        if not self.api_key:
            return {
                "people": [],
                "locations": [],
                "years": [],
                "events": [],
                "error": True
            }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/text/extract",
                    headers=self.headers,
                    json={
                        "model": "abab6.5s-chat",
                        "text": text,
                        "extract_types": ["people", "locations", "years", "events"]
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            return {"people": [], "locations": [], "years": [], "events": [], "error": str(e)}

    async def generate_family_response(
        self,
        question: str,
        family_context: list,
        language: str = "en"
    ) -> Dict[str, Any]:
        if not self.api_key:
            return {
                "answer": "Family memories are being preserved...",
                "context_stories": [],
                "error": True
            }

        context_text = "\n".join([
            f"- {story.get('title', 'Story')}: {story.get('content', '')}"
            for story in family_context[:5]
        ])

        prompt = f"""Based on the following family memories, answer the question in {language}.
If the context doesn't contain enough information, provide a thoughtful response based on available information.

Family Memories:
{context_text}

Question: {question}

Answer:"""

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/text/chat completions",
                    headers=self.headers,
                    json={
                        "model": "abab6.5s-chat",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a knowledgeable family historian helping users understand their family heritage and memories."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.7
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            return {
                "answer": "I'm here to help preserve your family memories.",
                "context_stories": [],
                "error": str(e)
            }


minimax_service = MiniMaxService()
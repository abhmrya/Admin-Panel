import time

from django.conf import settings

from chatbot.clients.gemini_client import client
from chatbot.services.prompt_service import SYSTEM_PROMPT


class AIService:

    @staticmethod
    def generate_response(messages):
        history = []

        # System instruction
        history.append(
            {
                "role": "user",
                "parts": [{"text": SYSTEM_PROMPT}],
            }
        )

        for message in messages:
            role = "model" if message.role == "ASSISTANT" else "user"

            history.append(
                {
                    "role": role,
                    "parts": [
                        {
                            "text": message.content,
                        }
                    ],
                }
            )

        start = time.perf_counter()

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=history,
        )

        end = time.perf_counter()

        return {
            "content": response.text,
            "response_time": round(end - start, 2),
        }
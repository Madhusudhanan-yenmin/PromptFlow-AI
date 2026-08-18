import logging
from typing import List, Dict, Any, Optional
from .ollama_client import OllamaClient

logger = logging.getLogger("promptflow.ai.text")

TEXT_GEN_SYSTEM_PROMPT = """You are the Text Generation engine for PromptFlow AI.
Generate compelling, high-quality copy, social media captions, hashtags, and educational explanations tailored to the user's request.

Return ONLY a valid JSON object matching this schema:
{
  "caption": "Engaging social media caption or main promotional copy string",
  "hashtags": ["#RelevantHashtag1", "#RelevantHashtag2", "#RelevantHashtag3", "#RelevantHashtag4", "#RelevantHashtag5"],
  "bodyText": "Detailed explanation, body text, educational breakdown, or invitation message"
}

Ensure hashtags start with '#' and are relevant to the user's domain.
Return ONLY the JSON object. Do not add markdown prose outside the JSON.
"""

class TextGenerator:
    """
    Sub-service for generating captions, hashtags, and copy using Llama 3.1 8B.
    """
    def __init__(self, ollama_client: Optional[OllamaClient] = None):
        self.client = ollama_client or OllamaClient()

    async def generate_text(
        self,
        prompt: str,
        intent: Dict[str, Any],
        content_plan: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate social media captions, hashtags, and body text based on plan requirements.
        """
        planned_types = [item["type"] for item in content_plan]

        user_msg = (
            f"User Prompt: \"{prompt}\"\n"
            f"Intent Goal: {intent.get('goal')}\n"
            f"Target Audience: {intent.get('targetAudience')}\n"
            f"Planned Formats: {', '.join(planned_types)}\n"
            "Generate matching text content, captions, and hashtags."
        )

        try:
            raw_llm = await self.client.generate_completion(
                prompt=user_msg,
                system_prompt=TEXT_GEN_SYSTEM_PROMPT,
                format_json=True,
                temperature=0.3
            )
            parsed = self.client.parse_structured_json(raw_llm)

            caption = parsed.get("caption") if ("caption" in planned_types or "text" in planned_types) else None
            hashtags = parsed.get("hashtags") if "hashtags" in planned_types else []
            body_text = parsed.get("bodyText") if "text" in planned_types else None

            # Clean hashtag formatting
            if isinstance(hashtags, list):
                hashtags = [f"#{tag.lstrip('#')}" for tag in hashtags if isinstance(tag, str) and tag.strip()]
            else:
                hashtags = []

            return {
                "caption": caption or parsed.get("caption", f"Explore {prompt}!"),
                "hashtags": hashtags,
                "bodyText": body_text or parsed.get("bodyText")
            }

        except Exception as e:
            logger.error(f"Text generator error: {e}. Generating fallback copy.")
            clean_tags = [f"#{word.capitalize()}" for word in prompt.split()[:5] if word.isalnum()]
            return {
                "caption": f"Exciting new update: {prompt}. Stay tuned for more details!",
                "hashtags": clean_tags if "hashtags" in planned_types else [],
                "bodyText": f"Here is the details regarding {prompt}." if "text" in planned_types else None
            }

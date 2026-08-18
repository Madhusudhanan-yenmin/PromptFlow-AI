import logging
from typing import Dict, Any, Optional
from .ollama_client import OllamaClient

logger = logging.getLogger("promptflow.ai.intent")

INTENT_SYSTEM_PROMPT = """You are the Intent Analysis engine for PromptFlow AI.
Analyze the user's input prompt to understand their core objective, industry domain, and target audience.

You MUST return ONLY a valid JSON object matching this schema:
{
  "type": "intent_category_type",
  "goal": "Clear one sentence explanation of what the user wants to accomplish",
  "domain": "business | personal | education | entertainment | marketing | technology | general",
  "targetAudience": "Description of intended target audience"
}

Common intent category types include:
- brand_launch
- product_marketing
- personal_event
- educational_content
- social_media_campaign
- corporate_announcement
- creative_storytelling
- general_request

Return ONLY the JSON object. Do not add markdown text outside the JSON.
"""

class IntentAnalyzer:
    """
    Sub-service for analyzing user creative prompts to extract structured intent.
    """
    def __init__(self, ollama_client: Optional[OllamaClient] = None):
        self.client = ollama_client or OllamaClient()

    async def analyze_intent(self, prompt: str, image_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Send user prompt to Llama 3.1 8B to extract structured intent dictionary.
        """
        user_msg = f"User Request: \"{prompt}\""
        if image_context and image_context.get("has_image"):
            user_msg += f"\nNote: User attached reference image ({image_context.get('filename')})."

        try:
            raw_llm = await self.client.generate_completion(
                prompt=user_msg,
                system_prompt=INTENT_SYSTEM_PROMPT,
                format_json=True,
                temperature=0.1
            )
            data = self.client.parse_structured_json(raw_llm)
            
            # Format and validate structure
            return {
                "type": data.get("type") or data.get("intent") or "general_request",
                "goal": data.get("goal") or prompt[:100],
                "domain": data.get("domain") or "general",
                "targetAudience": data.get("targetAudience") or data.get("target_audience") or "general audience"
            }
        except Exception as e:
            logger.error(f"Intent analysis error: {e}. Falling back to default intent.")
            return {
                "type": "general_request",
                "goal": prompt[:100],
                "domain": "general",
                "targetAudience": "general audience"
            }

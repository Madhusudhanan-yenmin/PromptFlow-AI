import logging
from typing import List, Dict, Any, Optional
from .ollama_client import OllamaClient

logger = logging.getLogger("promptflow.ai.planner")

CONTENT_PLANNER_SYSTEM_PROMPT = """You are the AI Content Planning engine for PromptFlow AI.
Your job is to evaluate the user's creative prompt and intent, and decide which content output types are GENUINELY useful for their goal.

CRITICAL RULES:
1. For Brand Launches, Business Openings, Product Launches, or Marketing Campaigns:
   You MUST include: "logo", "image", "video", "caption", and "hashtags".
2. For Personal Events (e.g., Birthday Invitations, Greeting Cards):
   Include "image" and "text". Do NOT include logo, video, or hashtags.
3. For Educational Explanations:
   Include "text" and "image".

Available output types:
- logo (Brand identity mark)
- image (Visual poster, creative banner, graphic aid)
- video (Promotional clip, motion trailer, video concept)
- caption (Social media post text)
- hashtags (Social discovery tags)
- text (Educational explanation, article, message copy)
- audio (Voiceover narrative, background audio theme)

Return ONLY a valid JSON array of objects:
[
  {
    "type": "logo | image | video | caption | hashtags | text | audio",
    "required": true,
    "reason": "Clear explanation why this content type is needed for the goal"
  }
]

Return ONLY the JSON array. Do not include markdown codeblocks or prose outside the JSON.
"""

class ContentPlanner:
    """
    Sub-service for dynamically generating a content plan based on user intent.
    """
    def __init__(self, ollama_client: Optional[OllamaClient] = None):
        self.client = ollama_client or OllamaClient()

    async def generate_plan(self, prompt: str, intent: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Send prompt & intent context to Llama 3.1 8B and return structured list of planned content items.
        """
        user_msg = (
            f"User Request: \"{prompt}\"\n"
            f"Analyzed Intent Type: {intent.get('type')}\n"
            f"Goal: {intent.get('goal')}\n"
            f"Domain: {intent.get('domain')}\n"
            f"Target Audience: {intent.get('targetAudience')}\n"
            "Determine the complete, relevant content output plan for this request."
        )

        try:
            raw_llm = await self.client.generate_completion(
                prompt=user_msg,
                system_prompt=CONTENT_PLANNER_SYSTEM_PROMPT,
                format_json=True,
                temperature=0.1
            )
            parsed = self.client.parse_structured_json(raw_llm)

            if isinstance(parsed, dict) and "contentPlan" in parsed:
                items = parsed["contentPlan"]
            elif isinstance(parsed, list):
                items = parsed
            else:
                items = []

            validated_plan = []
            for item in items:
                if isinstance(item, dict) and "type" in item:
                    validated_plan.append({
                        "type": item.get("type", "text").lower(),
                        "required": bool(item.get("required", True)),
                        "reason": item.get("reason", "Required based on content request")
                    })

            # Check if this is a business/brand launch or marketing campaign
            intent_type = (intent.get('type') or '').lower()
            domain = (intent.get('domain') or '').lower()
            prompt_lower = prompt.lower()

            is_business_launch = (
                intent_type in ['brand_launch', 'product_marketing', 'business_launch', 'corporate_announcement', 'social_media_campaign']
                or domain in ['business', 'marketing']
                or any(k in prompt_lower for k in ['launch', 'brand', 'shop', 'store', 'business', 'product', 'company', 'restaurant', 'cafe', 'coffee'])
            )

            if is_business_launch:
                existing_types = [item['type'] for item in validated_plan]
                required_business_types = [
                    ('logo', 'Brand identity mark for business launch'),
                    ('image', 'Promotional creative banner'),
                    ('video', 'Short brand introduction & promotional video clip'),
                    ('caption', 'Social media marketing copy'),
                    ('hashtags', 'Discovery tags for social campaign')
                ]
                for b_type, b_reason in required_business_types:
                    if b_type not in existing_types:
                        validated_plan.append({
                            "type": b_type,
                            "required": True,
                            "reason": b_reason
                        })

            if not validated_plan:
                validated_plan = [
                    {"type": "text", "required": True, "reason": "Core content response"},
                    {"type": "image", "required": True, "reason": "Visual representation"}
                ]

            return validated_plan

        except Exception as e:
            logger.error(f"Content planner error: {e}. Falling back to default plan.")
            return [
                {"type": "logo", "required": True, "reason": "Brand identity mark"},
                {"type": "image", "required": True, "reason": "Visual creative asset"},
                {"type": "video", "required": True, "reason": "Promotional video concept"},
                {"type": "caption", "required": True, "reason": "Social media copy"},
                {"type": "hashtags", "required": True, "reason": "Social discovery tags"}
            ]

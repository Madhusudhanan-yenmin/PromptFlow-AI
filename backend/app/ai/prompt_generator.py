import logging
from typing import List, Dict, Any, Optional
from .ollama_client import OllamaClient

logger = logging.getLogger("promptflow.ai.prompt_gen")

PROMPT_GEN_SYSTEM_PROMPT = """You are the Prompt Engineering module for PromptFlow AI.
Your job is to create detailed, high-quality generation prompts for AI media models (such as FLUX.2 for images and Wan 2.2 for video).

IMPORTANT:
Do NOT pretend to generate actual images or videos.
Generate ONLY the text prompts that will be passed to image and video AI models in future phases.

Guidelines:
- Image Prompt: Highly descriptive, specifying lighting, composition, color palette, style, mood, and camera setup suitable for FLUX.2.
- Video Prompt: Specify motion description, camera movement (panning, zoom, cinematic angle), visual action, and duration cues suitable for Wan 2.2.
- Logo Prompt: Specify vector icon composition, minimal branding style, typography pairing, and color hex aesthetics.

Return ONLY a valid JSON object:
{
  "image": "Detailed image prompt string or null if not in plan",
  "video": "Detailed video prompt string or null if not in plan",
  "logo": "Detailed logo prompt string or null if not in plan"
}

Return ONLY the JSON object. Do not include extra text.
"""

class PromptGenerator:
    """
    Sub-service for generating specialized prompts for image (FLUX.2) and video (Wan 2.2) models.
    """
    def __init__(self, ollama_client: Optional[OllamaClient] = None):
        self.client = ollama_client or OllamaClient()

    async def generate_prompts(
        self,
        prompt: str,
        intent: Dict[str, Any],
        content_plan: List[Dict[str, Any]]
    ) -> Dict[str, Optional[str]]:
        """
        Generates detailed prompts for required media types in the content plan.
        """
        planned_types = [item["type"] for item in content_plan]

        needs_image = "image" in planned_types
        needs_video = "video" in planned_types
        needs_logo = "logo" in planned_types

        if not needs_image and not needs_video and not needs_logo:
            return {"image": None, "video": None, "logo": None}

        user_msg = (
            f"Original Request: \"{prompt}\"\n"
            f"Intent: {intent.get('goal')}\n"
            f"Required Output Formats: {', '.join(planned_types)}\n"
            "Generate detailed production prompts for image (FLUX.2), video (Wan 2.2), and logo design."
        )

        try:
            raw_llm = await self.client.generate_completion(
                prompt=user_msg,
                system_prompt=PROMPT_GEN_SYSTEM_PROMPT,
                format_json=True,
                temperature=0.3
            )
            parsed = self.client.parse_structured_json(raw_llm)

            img_p = parsed.get("image") if needs_image else None
            vid_p = parsed.get("video") if needs_video else None
            logo_p = parsed.get("logo") if needs_logo else None

            # Fallback prompt construction if LLM returned null for requested types
            if needs_image and not img_p:
                img_p = f"A modern, vibrant high-resolution promotional image for '{prompt}'. Professional lighting, rich colors, shallow depth of field, 8k resolution, cinematic aesthetic."
            
            if needs_video and not vid_p:
                vid_p = f"A 10-second cinematic 4K promotional video for '{prompt}'. Smooth camera panning, dynamic lighting, high energy motion, 24fps commercial film look."

            if needs_logo and not logo_p:
                logo_p = f"A sleek modern vector logo mark for '{prompt}'. Minimalist icon design, clean geometric line art, premium color gradient, versatile branding aesthetic on dark background."

            return {
                "image": img_p,
                "video": vid_p,
                "logo": logo_p
            }

        except Exception as e:
            logger.error(f"Prompt generator error: {e}. Generating fallback prompt templates.")
            return {
                "image": f"High quality cinematic 8k visual for {prompt}, professional lighting, hyper-realistic, detailed texture." if needs_image else None,
                "video": f"Cinematic 4k motion video depicting {prompt}, smooth camera panning, vibrant colors, 24fps film style." if needs_video else None,
                "logo": f"Modern minimalist vector logo mark for {prompt}, clean geometric lines, versatile icon." if needs_logo else None
            }

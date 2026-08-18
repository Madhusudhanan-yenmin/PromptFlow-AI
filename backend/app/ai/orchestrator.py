import logging
from typing import Dict, Any, Optional, List
from .ollama_client import OllamaClient
from .vision_analyzer import VisionAnalyzer
from .intent_analyzer import IntentAnalyzer
from .content_planner import ContentPlanner
from .prompt_generator import PromptGenerator
from .text_generator import TextGenerator
from app.core.config import settings

logger = logging.getLogger("promptflow.ai.orchestrator")

class AIOrchestrator:
    """
    Central Controller for PromptFlow AI multi-modal planning pipeline.
    Coordinates Intent Analyzer -> Content Planner -> Prompt Generator -> Text Generator.
    """
    def __init__(self, ollama_client: Optional[OllamaClient] = None):
        self.client = ollama_client or OllamaClient()
        self.vision_analyzer = VisionAnalyzer()
        self.intent_analyzer = IntentAnalyzer(self.client)
        self.content_planner = ContentPlanner(self.client)
        self.prompt_generator = PromptGenerator(self.client)
        self.text_generator = TextGenerator(self.client)

    async def process_pipeline(self, prompt: str, input_image_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute end-to-end AI planning pipeline using Llama 3.1 8B via Ollama.
        """
        logger.info(f"Starting AI Orchestrator pipeline for prompt: '{prompt}'")

        # Step 1: Vision / Image context extraction (abstraction)
        image_context = await self.vision_analyzer.extract_image_context(input_image_path) if input_image_path else None

        # Step 2: Intent Analysis
        logger.info("Executing Intent Analysis...")
        intent = await self.intent_analyzer.analyze_intent(prompt, image_context)

        # Step 3: Content Planning (LLM dynamically decides output types)
        logger.info("Executing Dynamic Content Planning...")
        content_plan = await self.content_planner.generate_plan(prompt, intent)

        # Step 4: Structured Prompt Generation for Media Models (FLUX.2 / Wan 2.2)
        logger.info("Generating Media Prompts (FLUX.2 / Wan 2.2)...")
        generated_prompts = await self.prompt_generator.generate_prompts(prompt, intent, content_plan)

        # Step 5: Text Generation (Captions, Hashtags, Copy)
        logger.info("Generating Text Content...")
        text_content = await self.text_generator.generate_text(prompt, intent, content_plan)

        logger.info("AI Orchestrator pipeline execution completed successfully.")

        return {
            "status": "completed",
            "intent": intent,
            "contentPlan": content_plan,
            "generatedPrompts": generated_prompts,
            "textContent": text_content,
            "model": settings.OLLAMA_MODEL,
            "provider": "ollama"
        }

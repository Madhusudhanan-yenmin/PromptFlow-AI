import asyncio
import logging
import sys
from app.schemas.generation import GenerateRequest
from app.services.generation_service import GenerationService

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

TEST_CASES = [
    {
        "name": "TEST 1: Brand Launch",
        "prompt": "I am launching a new coffee shop called Brew House.",
        "expected_domain": "business"
    },
    {
        "name": "TEST 2: Personal Event (Birthday Invitation)",
        "prompt": "Create a birthday invitation for my sister.",
        "expected_domain": "personal"
    },
    {
        "name": "TEST 3: Educational Content",
        "prompt": "Explain photosynthesis to a 10-year-old.",
        "expected_domain": "education"
    },
    {
        "name": "TEST 4: Product Marketing",
        "prompt": "Create a premium advertisement for this uploaded product.",
        "input_image": "/uploads/images/sample_product.jpg"
    }
]

async def run_all_tests():
    print("=" * 60)
    print("PROMPTFLOW AI - OLLAMA / LLAMA 3.1 8B ORCHESTRATOR TEST SUITE")
    print("=" * 60)

    # 1. Health Check
    health = await GenerationService.get_ai_health()
    print(f"\n[AI HEALTH CHECK]: {health.message}")
    if not health.ollama:
        print("ERROR: Ollama is unavailable. Exiting test.")
        sys.exit(1)

    # 2. Run Test Cases
    for idx, test_data in enumerate(TEST_CASES, start=1):
        print(f"\n------------------------------------------------------------")
        print(f"RUNNING {test_data['name']}")
        print(f"PROMPT: '{test_data['prompt']}'")
        print(f"------------------------------------------------------------")

        req = GenerateRequest(
            prompt=test_data["prompt"],
            inputImagePath=test_data.get("input_image")
        )

        try:
            response = await GenerationService.request_generation(req)
            print(f"STATUS: {response.status}")
            print(f"INTENT: Type='{response.intent.type}', Goal='{response.intent.goal}', Domain='{response.intent.domain}', Audience='{response.intent.targetAudience}'")
            print("CONTENT PLAN:")
            for item in response.contentPlan:
                print(f"  - [{item.type.upper()}] (Required: {item.required}) -> {item.reason}")
            
            print("\nGENERATED MEDIA PROMPTS:")
            if response.generatedPrompts.image:
                print(f"  - Image Prompt (FLUX.2): {response.generatedPrompts.image[:120]}...")
            if response.generatedPrompts.video:
                print(f"  - Video Prompt (Wan 2.2): {response.generatedPrompts.video[:120]}...")
            if response.generatedPrompts.logo:
                print(f"  - Logo Prompt: {response.generatedPrompts.logo[:120]}...")

            print("\nGENERATED TEXT CONTENT:")
            if response.textContent.caption:
                print(f"  - Caption: {response.textContent.caption[:100]}...")
            if response.textContent.hashtags:
                print(f"  - Hashtags: {' '.join(response.textContent.hashtags)}")
            if response.textContent.bodyText:
                print(f"  - Body Text: {response.textContent.bodyText[:100]}...")

            print(f"\nPASSED {test_data['name']} successfully.")

        except Exception as e:
            print(f"FAILED {test_data['name']}: {e}")

if __name__ == "__main__":
    asyncio.run(run_all_tests())

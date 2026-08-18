import json
import logging
import re
from typing import Dict, Any, Optional
import httpx
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger("promptflow.ai.ollama")

class OllamaClient:
    """
    Async client for communicating with local/remote Ollama LLM runtime.
    Manages prompt dispatch, timeouts, error handling, health checks, and JSON parsing.
    """
    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip('/')
        self.model = model or settings.OLLAMA_MODEL
        self.timeout = 90.0  # 90 seconds max timeout for model generation

    async def check_health(self) -> Dict[str, Any]:
        """Verify Ollama service availability and check if the configured model is present."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    model_found = any(self.model in m for m in models)
                    return {
                        "ollama": True,
                        "model": self.model,
                        "status": "available" if model_found else "model_missing",
                        "available_models": models,
                        "message": f"Ollama is running. Model '{self.model}' is {'available' if model_found else 'not downloaded yet'}."
                    }
                return {
                    "ollama": False,
                    "model": self.model,
                    "status": "unavailable",
                    "message": f"Ollama returned HTTP status {resp.status_code}."
                }
        except Exception as e:
            logger.warning(f"Ollama health check failed for {self.base_url}: {e}")
            return {
                "ollama": False,
                "model": self.model,
                "status": "unavailable",
                "message": f"Could not connect to Ollama at {self.base_url}. Please ensure Ollama service is active."
            }

    async def generate_completion(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        format_json: bool = True,
        temperature: float = 0.2
    ) -> str:
        """
        Send prompt payload to Ollama LLM runtime and return raw model response string.
        """
        payload: Dict[str, Any] = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }

        if system_prompt:
            payload["system"] = system_prompt

        if format_json:
            payload["format"] = "json"

        endpoint = f"{self.base_url}/api/generate"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info(f"Sending request to Ollama ({self.model}) at {endpoint}")
                resp = await client.post(endpoint, json=payload)
                
                if resp.status_code == 404:
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail=f"Model '{self.model}' was not found on Ollama. Please run 'ollama pull {self.model}'."
                    )
                
                if resp.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Ollama returned HTTP {resp.status_code}: {resp.text}"
                    )

                data = resp.json()
                raw_response = data.get("response", "")
                if not raw_response:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Ollama returned an empty response."
                    )
                return raw_response

        except httpx.ConnectError as e:
            logger.error(f"Failed to connect to Ollama at {self.base_url}: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Ollama service is unavailable at {self.base_url}. Please ensure Ollama is running and accessible."
            )
        except httpx.TimeoutException as e:
            logger.error(f"Ollama request timed out after {self.timeout}s: {e}")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail=f"Ollama generation timed out after {int(self.timeout)} seconds. Model took too long to process."
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error communicating with Ollama: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error communicating with AI runtime: {str(e)}"
            )

    def parse_structured_json(self, raw_text: str) -> Dict[str, Any]:
        """
        Safely extract and parse JSON object from raw LLM output text,
        stripping markdown blocks or surrounding prose text.
        """
        if not raw_text or not raw_text.strip():
            raise ValueError("Empty response string received from LLM.")

        cleaned = raw_text.strip()

        # Remove markdown codeblock wrapper if present
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
            cleaned = re.sub(r"\s*```$", "", cleaned)
            cleaned = cleaned.strip()

        # Try direct json parse first
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass

        # Search for first '{' and last '}'
        start_brace = cleaned.find("{")
        end_brace = cleaned.rfind("}")

        if start_brace != -1 and end_brace != -1 and end_brace > start_brace:
            json_substr = cleaned[start_brace:end_brace + 1]
            try:
                return json.loads(json_substr)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse extracted JSON substring: {e}. Raw text: {raw_text}")
                raise ValueError(f"Extracted JSON block is invalid: {e}")

        # Search for first '[' and last ']' if expecting list
        start_bracket = cleaned.find("[")
        end_bracket = cleaned.rfind("]")
        if start_bracket != -1 and end_bracket != -1 and end_bracket > start_bracket:
            json_substr = cleaned[start_bracket:end_bracket + 1]
            try:
                return json.loads(json_substr)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse extracted JSON list: {e}")
                raise ValueError(f"Extracted JSON list block is invalid: {e}")

        raise ValueError(f"No valid JSON structure found in LLM response: {cleaned[:100]}...")

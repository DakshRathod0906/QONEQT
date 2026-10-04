from fastapi import FastAPI
from pydantic import BaseModel
import ollama
import json

app = FastAPI(title="Qoneqt AI Content Engine")


class ContentRequest(BaseModel):
    topic: str
    duration: int = 30


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Qoneqt AI Content Engine"
    }


@app.post("/generate-blueprint")
def generate_blueprint(request: ContentRequest):

    prompt = f"""
Create a short-video content blueprint.

Topic: {request.topic}
Target duration: {request.duration} seconds.

Return ONLY valid JSON.
Do not include markdown.
Do not include explanations.

Use exactly this structure:

{{
  "title": "string",
  "hook": "string",
  "duration": {request.duration},
  "scenes": [
    {{
      "scene": 1,
      "duration": 5,
      "narration": "string",
      "visual_prompt": "string"
    }}
  ]
}}

Rules:
- Create 5 scenes.
- Scene durations must add up to the target duration.
- Keep narration concise.
- Make each visual_prompt suitable for an AI image generator.
"""

    response = ollama.chat(
        model="qwen3:4b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        options={
            "temperature": 0.3
        }
    )

    raw_output = response["message"]["content"]

    # Remove accidental markdown fences
    raw_output = raw_output.replace("```json", "").replace("```", "").strip()

    try:
        blueprint = json.loads(raw_output)
    except json.JSONDecodeError:
        return {
            "success": False,
            "error": "Qwen returned invalid JSON",
            "raw_output": raw_output
        }

    # Validate duration
    total_duration = sum(
        scene["duration"]
        for scene in blueprint["scenes"]
    )

    if total_duration != request.duration:
        return {
            "success": False,
            "error": "Scene durations do not match target duration",
            "expected": request.duration,
            "actual": total_duration,
            "blueprint": blueprint
        }

    return {
        "success": True,
        "blueprint": blueprint
    }
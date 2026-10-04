from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
import json

from comfy_client import generate_image
from tts_client import generate_voice


app = FastAPI(title="Qoneqt AI Content Engine")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Request Models
# --------------------------------------------------
class ContentRequest(BaseModel):
    topic: str
    content_type: str = "short"
    tone: str = "Cinematic"
    duration: int = 30


# --------------------------------------------------
# Root
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Qoneqt AI Content Engine"
    }


# --------------------------------------------------
# Qwen3 Blueprint Generation
# --------------------------------------------------
def generate_blueprint(request: ContentRequest):

    prompt = f"""
Create a short vertical video blueprint.

INPUT:
Topic: {request.topic}
Content type: {request.content_type}
Tone: {request.tone}
Target duration: {request.duration} seconds.

OBJECTIVE:
Create an engaging, coherent short-form video suitable for social media.
The video must have exactly 5 scenes.

DURATION RULE:
The total duration of all 5 scenes MUST equal exactly {request.duration} seconds.

Recommended distribution:
- 15 seconds: approximately 3, 3, 3, 3, 3
- 30 seconds: approximately 6, 6, 6, 6, 6
- 60 seconds: approximately 12, 12, 12, 12, 12

You may adjust individual scene durations when necessary,
but the final sum MUST be exactly {request.duration}.

CONTENT RULES:
- Create one coherent story from beginning to end.
- The hook must immediately capture attention.
- The script must summarize the complete story.
- Scene narrations must collectively form the complete narration.
- Each visual prompt must directly match its scene narration.
- Keep narration appropriate for the target duration.
- Make visual prompts detailed enough for an image/video generation model.
- Do not invent fields outside the required schema.

OUTPUT FORMAT:
Return ONLY valid JSON.
Do not return Markdown.
Do not use ```json.
Do not add explanations.
Do not add comments.
Do not add text before or after the JSON.

REQUIRED JSON SCHEMA:

{{
  "title": "Short engaging video title",
  "hook": "Strong opening hook",
  "script": "Complete short-form narration/script for the entire video",
  "duration": {request.duration},
  "scenes": [
    {{
      "scene": 1,
      "duration": 3,
      "narration": "Narration for scene 1",
      "visual_prompt": "Detailed visual description for scene 1"
    }},
    {{
      "scene": 2,
      "duration": 3,
      "narration": "Narration for scene 2",
      "visual_prompt": "Detailed visual description for scene 2"
    }},
    {{
      "scene": 3,
      "duration": 3,
      "narration": "Narration for scene 3",
      "visual_prompt": "Detailed visual description for scene 3"
    }},
    {{
      "scene": 4,
      "duration": 3,
      "narration": "Narration for scene 4",
      "visual_prompt": "Detailed visual description for scene 4"
    }},
    {{
      "scene": 5,
      "duration": 3,
      "narration": "Narration for scene 5",
      "visual_prompt": "Detailed visual description for scene 5"
    }}
  ]
}}

FINAL VALIDATION BEFORE RESPONDING:
- Exactly 5 scenes.
- Scene numbers are 1, 2, 3, 4, 5.
- duration equals exactly {request.duration}.
- Sum of all scene durations equals exactly {request.duration}.
- Every scene has narration.
- Every scene has visual_prompt.
- script is present.
- title is present.
- hook is present.
- Return JSON only.
"""

    response = ollama.chat(
        model="qwen3:4b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a strict JSON API. "
                    "Always follow the exact JSON schema requested. "
                    "Return JSON only."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        options={
            "temperature": 0
        }
    )

    raw_output = response["message"]["content"].strip()

    # Remove markdown if Qwen adds it
    raw_output = raw_output.replace("```json", "")
    raw_output = raw_output.replace("```", "")
    raw_output = raw_output.strip()

    # Extract JSON object
    start = raw_output.find("{")
    end = raw_output.rfind("}")

    if start != -1 and end != -1:
        raw_output = raw_output[start:end + 1]

    try:
        blueprint = json.loads(raw_output)
    except json.JSONDecodeError:

        return {
            "success": False,
            "error": "Qwen returned invalid JSON",
            "raw_output": raw_output
        }

    # ------------------------------------------------
    # VALIDATE BLUEPRINT
    # ------------------------------------------------
    required_fields = [
        "title",
        "hook",
        "script",
        "duration",
     "scenes"
    ]

    missing_fields = [
        field for field in required_fields
        if field not in blueprint
    ]

    if missing_fields:

        return {
            "success": False,
            "error": "Blueprint schema mismatch",
            "missing_fields": missing_fields,
            "raw_output": blueprint
        }

    if not isinstance(blueprint["scenes"], list):

        return {
            "success": False,
            "error": "Scenes must be a list",
            "blueprint": blueprint
        }

    if len(blueprint["scenes"]) != 5:

        return {
            "success": False,
            "error": "Blueprint must contain exactly 5 scenes",
            "blueprint": blueprint
        }

    # Validate each scene

    for index, scene in enumerate(blueprint["scenes"], start=1):

    # Qwen sometimes omits the scene number.
    # The backend can safely assign it because
    # scene order is already deterministic.
        scene["scene"] = index

    required_scene_fields = [
        "duration",
        "narration",
        "visual_prompt"
    ]

    for field in required_scene_fields:

        if field not in scene:

            return {
                "success": False,
                "error": f"Scene missing field: {field}",
                "blueprint": blueprint
            }

    # Check duration

    try:

        total_duration = sum(
            int(scene["duration"])
            for scene in blueprint["scenes"]
        )

    except Exception:

        return {
            "success": False,
            "error": "Invalid scene duration",
            "blueprint": blueprint
        }

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


# --------------------------------------------------
# Generate Blueprint Endpoint
# --------------------------------------------------

@app.post("/generate-blueprint")
def generate_blueprint_endpoint(request: ContentRequest):

    return generate_blueprint(request)


# --------------------------------------------------
# Generate Single Scene
# --------------------------------------------------

@app.post("/generate-scene")
def generate_scene(prompt: str):

    image_path = generate_image(prompt)

    return {
        "success": True,
        "prompt": prompt,
        "image": image_path
    }


# --------------------------------------------------
# Generate All Scenes
# Image + Voice
# --------------------------------------------------

@app.post("/generate-all-scenes")
def generate_all_scenes(request: ContentRequest):

    # Generate blueprint
    blueprint_response = generate_blueprint(request)

    if not blueprint_response.get("success"):
        return blueprint_response

    blueprint = blueprint_response["blueprint"]

    generated_scenes = []

    # Generate image + voice for every scene
    for scene in blueprint["scenes"]:

        scene_number = scene["scene"]

        # Generate image using ComfyUI
        image_path = generate_image(
            scene["visual_prompt"]
        )

        # Generate narration using Piper
        audio_filename = f"scene_{scene_number}.wav"

        audio_path = generate_voice(
            scene["narration"],
            audio_filename
        )

        generated_scenes.append({
            "scene": scene_number,
            "duration": scene["duration"],
            "narration": scene["narration"],
            "visual_prompt": scene["visual_prompt"],
            "image": image_path,
            "audio": audio_path
        })

    return {
        "success": True,
        "title": blueprint["title"],
        "hook": blueprint["hook"],
        "duration": blueprint["duration"],
        "scenes": generated_scenes
    }
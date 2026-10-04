from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
import json
import subprocess
import uuid
from pathlib import Path
from comfy_client import generate_image
from tts_client import generate_voice
from fastapi.responses import FileResponse


app = FastAPI(title="Qoneqt AI Content Engine")


# ==================================================
# GENERATED FILES
# ==================================================

GENERATED_DIR = Path("generated").resolve()
GENERATED_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/generated",
    StaticFiles(directory=str(GENERATED_DIR)),
    name="generated",
)


# ==================================================
# CORS
# ==================================================

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


# ==================================================
# REQUEST MODEL
# ==================================================

class ContentRequest(BaseModel):
    topic: str
    content_type: str = "short"
    tone: str = "Cinematic"
    duration: int = 30


# ==================================================
# ROOT
# ==================================================

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Qoneqt AI Content Engine",
    }


# ==================================================
# QWEN BLUEPRINT GENERATION
# ==================================================

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

IMPORTANT:

Generate the CONTENT for each scene.
The backend will assign the exact scene durations automatically.

CONTENT RULES:

- Create one coherent story from beginning to end.
- The hook must immediately capture attention.
- The script must summarize the complete story.
- Scene narrations must collectively form the complete narration.
- Each visual prompt must directly match its scene narration.
- Keep narration concise and appropriate for the target duration.
- Make visual prompts detailed enough for an image generation model.
- Do not invent fields outside the required schema.

IMPORTANT FACTUALITY RULE:

- Do not invent obviously false facts.
- Prefer well-known factual information.
- Keep claims concise and suitable for a short video.

REQUIRED JSON STRUCTURE:

{{
  "title": "Short engaging video title",
  "hook": "Strong opening hook",
  "script": "Complete short-form narration",
  "scenes": [
    {{
      "scene": 1,
      "narration": "Narration for scene 1",
      "visual_prompt": "Detailed visual description for scene 1"
    }},
    {{
      "scene": 2,
      "narration": "Narration for scene 2",
      "visual_prompt": "Detailed visual description for scene 2"
    }},
    {{
      "scene": 3,
      "narration": "Narration for scene 3",
      "visual_prompt": "Detailed visual description for scene 3"
    }},
    {{
      "scene": 4,
      "narration": "Narration for scene 4",
      "visual_prompt": "Detailed visual description for scene 4"
    }},
    {{
      "scene": 5,
      "narration": "Narration for scene 5",
      "visual_prompt": "Detailed visual description for scene 5"
    }}
  ]
}}

RULES:

- Exactly 5 scenes.
- Every scene must contain narration.
- Every scene must contain visual_prompt.
- Return JSON only.
- Do not return Markdown.
- Do not return ```json.
- Do not explain anything.
- Do not return normal conversational text.
"""

    # ==================================================
    # ASK QWEN
    # ==================================================

    raw_output = None
    blueprint = None

    for attempt in range(2):

        try:

            response = ollama.chat(
                model="qwen3:4b",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a strict JSON API. "
                            "Return ONLY valid JSON. "
                            "Never return normal conversational text. "
                            "Follow the requested schema exactly."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                format="json",
                options={
                    "temperature": 0,
                },
            )

            raw_output = response["message"]["content"].strip()

        except Exception as e:

            if attempt == 1:
                return {
                    "success": False,
                    "error": "Qwen generation failed",
                    "details": str(e),
                }

            continue

        # ==================================================
        # CLEAN OUTPUT
        # ==================================================

        cleaned_output = raw_output

        cleaned_output = cleaned_output.replace(
            "```json",
            "",
        )

        cleaned_output = cleaned_output.replace(
            "```",
            "",
        )

        cleaned_output = cleaned_output.strip()

        # ==================================================
        # PARSE JSON
        # ==================================================

        try:

            blueprint = json.loads(cleaned_output)
            break

        except json.JSONDecodeError:

            start = cleaned_output.find("{")
            end = cleaned_output.rfind("}")

            if start != -1 and end != -1:

                extracted = cleaned_output[
                    start:end + 1
                ]

                try:

                    blueprint = json.loads(
                        extracted
                    )

                    break

                except json.JSONDecodeError:
                    blueprint = None

            else:
                blueprint = None

            if attempt == 1:

                return {
                    "success": False,
                    "error": "Qwen returned invalid JSON",
                    "raw_output": raw_output,
                }

    # ==================================================
    # VALIDATE BLUEPRINT OBJECT
    # ==================================================

    if not isinstance(blueprint, dict):

        return {
            "success": False,
            "error": "Qwen returned an invalid blueprint",
            "raw_output": raw_output,
        }

    # ==================================================
    # REQUIRED TOP-LEVEL FIELDS
    # ==================================================

    required_fields = [
        "title",
        "hook",
        "script",
        "scenes",
    ]

    missing_fields = [
        field
        for field in required_fields
        if field not in blueprint
    ]

    if missing_fields:

        return {
            "success": False,
            "error": "Blueprint schema mismatch",
            "missing_fields": missing_fields,
            "blueprint": blueprint,
        }

    # ==================================================
    # VALIDATE SCENES
    # ==================================================

    if not isinstance(
        blueprint["scenes"],
        list,
    ):

        return {
            "success": False,
            "error": "Scenes must be a list",
            "blueprint": blueprint,
        }

    if len(blueprint["scenes"]) != 5:

        return {
            "success": False,
            "error": "Blueprint must contain exactly 5 scenes",
            "blueprint": blueprint,
        }

    # ==================================================
    # REPAIR / VALIDATE SCENES
    # ==================================================

    for index, scene in enumerate(
        blueprint["scenes"],
        start=1,
    ):

        if not isinstance(scene, dict):

            return {
                "success": False,
                "error": f"Scene {index} is not a valid object",
                "blueprint": blueprint,
            }

        scene["scene"] = index

        if (
            "narration" not in scene
            or not scene["narration"]
        ):

            return {
                "success": False,
                "error": f"Scene {index} missing narration",
                "blueprint": blueprint,
            }

        if (
            "visual_prompt" not in scene
            or not scene["visual_prompt"]
        ):

            scene["visual_prompt"] = (
                "Cinematic visual representation of: "
                f"{scene['narration']}. "
                "Vertical 9:16 composition, "
                "highly detailed, visually engaging, "
                "realistic lighting, "
                "suitable for short-form social media video."
            )

    # ==================================================
    # DETERMINISTIC SCENE DURATIONS
    # ==================================================

    base_duration = request.duration // 5
    remainder = request.duration % 5

    for index, scene in enumerate(
        blueprint["scenes"]
    ):

        scene["duration"] = base_duration

        if index < remainder:
            scene["duration"] += 1

    blueprint["duration"] = request.duration

    # ==================================================
    # SUCCESS
    # ==================================================

    return {
        "success": True,
        "blueprint": blueprint,
    }


# ==================================================
# GENERATE BLUEPRINT ENDPOINT
# ==================================================

@app.post("/generate-blueprint")
def generate_blueprint_endpoint(
    request: ContentRequest,
):

    return generate_blueprint(request)


# ==================================================
# GENERATE SINGLE SCENE
# ==================================================

@app.post("/generate-scene")
def generate_scene(prompt: str):

    try:

        image_path = generate_image(
            prompt
        )

        return {
            "success": True,
            "prompt": prompt,
            "image": image_path,
        }

    except Exception as e:

        return {
            "success": False,
            "error": "Image generation failed",
            "details": str(e),
        }


# ==================================================
# GENERATE ALL SCENES
# IMAGE + VOICE
# ==================================================

@app.post("/generate-all-scenes")
def generate_all_scenes(
    request: ContentRequest,
):

    blueprint_response = generate_blueprint(
        request
    )

    if not blueprint_response.get("success"):

        return blueprint_response

    blueprint = blueprint_response[
        "blueprint"
    ]

    generated_scenes = []

    for scene in blueprint["scenes"]:

        scene_number = scene["scene"]

        # --------------------------------------------------
        # IMAGE
        # --------------------------------------------------

        try:

            image_path = generate_image(
                scene["visual_prompt"]
            )

        except Exception as e:

            return {
                "success": False,
                "error": (
                    f"Image generation failed "
                    f"for scene {scene_number}"
                ),
                "details": str(e),
                "blueprint": blueprint,
                "completed_scenes": generated_scenes,
            }

        # --------------------------------------------------
        # VOICE
        # --------------------------------------------------

        audio_filename = (
            f"scene_{scene_number}.wav"
        )

        try:

            audio_path = generate_voice(
                scene["narration"],
                audio_filename,
            )

        except Exception as e:

            return {
                "success": False,
                "error": (
                    f"Voice generation failed "
                    f"for scene {scene_number}"
                ),
                "details": str(e),
                "blueprint": blueprint,
                "completed_scenes": generated_scenes,
            }

        # --------------------------------------------------
        # STORE SCENE
        # --------------------------------------------------

        generated_scenes.append(
            {
                "scene": scene_number,
                "duration": scene["duration"],
                "narration": scene["narration"],
                "visual_prompt": scene["visual_prompt"],
                "image": image_path,
                "audio": audio_path,
            }
        )

    # ==================================================
    # FINAL RESPONSE
    # ==================================================

    return {
        "success": True,
        "title": blueprint["title"],
        "hook": blueprint["hook"],
        "script": blueprint["script"],
        "duration": blueprint["duration"],
        "scenes": generated_scenes,
    }


# ==================================================
# COMPOSE FINAL VIDEO WITH FFMPEG
# ==================================================

class ComposeRequest(BaseModel):
    scenes: list


@app.post("/compose-video")
def compose_video(request: ComposeRequest):

    generated_dir = GENERATED_DIR
    temp_dir = generated_dir / "compose_temp"

    temp_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    if not request.scenes:

        return {
            "success": False,
            "error": "No scenes provided",
        }

    scene_videos = []

    try:

        # ----------------------------------------------
        # CREATE VIDEO FOR EACH SCENE
        # ----------------------------------------------

        for index, scene in enumerate(
            request.scenes,
            start=1,
        ):

            image_name = Path(
                str(scene.get("image", ""))
            ).name

            audio_name = Path(
                str(scene.get("audio", ""))
            ).name

            image_path = (
                generated_dir / image_name
            )

            audio_path = (
                generated_dir
                / "audio"
                / audio_name
            )

            if not image_path.exists():

                return {
                    "success": False,
                    "error": f"Image not found: {image_name}",
                }

            if not audio_path.exists():

                return {
                    "success": False,
                    "error": f"Audio not found: {audio_name}",
                }

            scene_video = (
                temp_dir
                / f"scene_{index}.mp4"
            )

            command = [
                "ffmpeg",
                "-y",

                # Image
                "-loop",
                "1",
                "-i",
                str(image_path),

                # Voice
                "-i",
                str(audio_path),

                # Vertical video
                "-vf",
                (
                    "scale=1080:1920:"
                    "force_original_aspect_ratio=increase,"
                    "crop=1080:1920,"
                    "format=yuv420p"
                ),

                "-c:v",
                "libx264",

                "-preset",
                "veryfast",

                "-tune",
                "stillimage",

                "-c:a",
                "aac",

                "-b:a",
                "128k",

                "-shortest",

                str(scene_video),
            ]

            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
            )

            if result.returncode != 0:

                return {
                    "success": False,
                    "error": (
                        f"FFmpeg failed on scene {index}"
                    ),
                    "details": result.stderr[-3000:],
                }

            scene_videos.append(
                scene_video
            )

        # ----------------------------------------------
        # CREATE CONCAT FILE
        # ----------------------------------------------

        concat_file = (
            temp_dir / "concat.txt"
        )

        with open(
            concat_file,
            "w",
            encoding="utf-8",
        ) as f:

            for video in scene_videos:

                safe_path = str(
                    video.resolve()
                ).replace(
                    "'",
                    "'\\''",
                )

                f.write(
                    f"file '{safe_path}'\n"
                )

        # ----------------------------------------------
        # FINAL VIDEO
        # ----------------------------------------------

        output_name = (
            f"qoneqt_video_{uuid.uuid4().hex[:8]}.mp4"
        )

        output_path = (
            generated_dir / output_name
        )

        command = [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_file),
            "-c",
            "copy",
            str(output_path),
        ]

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:

            return {
                "success": False,
                "error": "Final video composition failed",
                "details": result.stderr[-3000:],
            }

        # ----------------------------------------------
        # CLEAN TEMP FILES
        # ----------------------------------------------

        for video in scene_videos:

            try:
                video.unlink()
            except Exception:
                pass

        try:
            concat_file.unlink()
        except Exception:
            pass

        return {
            "success": True,
            "video": f"/generated/{output_name}",
            "filename": output_name,
        }

    except Exception as e:

        return {
            "success": False,
            "error": "Video composition failed",
            "details": str(e),
        }


# ==================================================
# DOWNLOAD FINAL VIDEO
# ==================================================

@app.get("/download-video/{filename}")
def download_video(filename: str):

    # Prevent directory traversal
    safe_filename = Path(filename).name

    file_path = GENERATED_DIR / safe_filename

    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail="Video not found",
        )

    if file_path.suffix.lower() != ".mp4":

        raise HTTPException(
            status_code=400,
            detail="Only MP4 video files can be downloaded",
        )

    return FileResponse(
        path=str(file_path),
        media_type="video/mp4",
        filename="qoneqt-ai-video.mp4",
        headers={
            "Content-Disposition": (
                'attachment; filename="qoneqt-ai-video.mp4"'
            )
        },
    )
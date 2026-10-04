import os
import time
import uuid
from pathlib import Path

from google import genai
from google.genai import types


BASE_DIR = Path(__file__).resolve().parent
VIDEO_DIR = BASE_DIR / "generated" / "veo"
VIDEO_DIR.mkdir(parents=True, exist_ok=True)


API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not set. "
        "Run: $env:GEMINI_API_KEY='YOUR_API_KEY'"
    )

client = genai.Client(api_key=API_KEY)


def generate_video(prompt: str, scene_number: int, duration: int = 6):
    print(f"\n🎬 Generating Veo scene {scene_number}...")
    print(f"Prompt: {prompt}")

    operation = client.models.generate_videos(
        model="veo-3.1-generate-preview",
        prompt=prompt,
        config=types.GenerateVideosConfig(
            aspect_ratio="9:16",
            duration_seconds=str(duration),
            resolution="720p",
        ),
    )

    while not operation.done:
        print("⏳ Waiting for Veo...")
        time.sleep(10)
        operation = client.operations.get(operation)

    if not operation.response:
        raise RuntimeError("Veo generation completed without a response.")

    generated_video = operation.response.generated_videos[0]

    output_path = (
        VIDEO_DIR
        / f"scene_{scene_number}_{uuid.uuid4().hex[:8]}.mp4"
    )

    client.files.download(
        file=generated_video.video,
        destination=str(output_path),
    )

    print(f"✅ Scene {scene_number} saved:")
    print(output_path)

    return str(output_path)
import json
import time
import uuid
from pathlib import Path

import requests


COMFY_URL = "http://127.0.0.1:8188"

BASE_DIR = Path(__file__).resolve().parent
WORKFLOW_FILE = BASE_DIR / "image_z_image_turbo_int8.json"

OUTPUT_DIR = BASE_DIR / "generated"
OUTPUT_DIR.mkdir(exist_ok=True)


def load_workflow():
    with open(WORKFLOW_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def generate_image(prompt: str):
    workflow = load_workflow()

    # Dynamic prompt
    workflow["57:27"]["inputs"]["text"] = prompt

    # Dynamic seed
    workflow["57:3"]["inputs"]["seed"] = uuid.uuid4().int % 2**32

    # Keep prototype resolution at 512x512
    workflow["57:13"]["inputs"]["width"] = 512
    workflow["57:13"]["inputs"]["height"] = 512
    workflow["57:13"]["inputs"]["batch_size"] = 1

    # Unique output filename
    workflow["9"]["inputs"]["filename_prefix"] = "qoneqt_scene"

    # Submit workflow
    response = requests.post(
        f"{COMFY_URL}/prompt",
        json={"prompt": workflow},
        timeout=30,
    )

    response.raise_for_status()

    result = response.json()
    prompt_id = result["prompt_id"]

    print(f"ComfyUI job started: {prompt_id}")

    # Wait for completion
    for _ in range(180):
        history_response = requests.get(
            f"{COMFY_URL}/history/{prompt_id}",
            timeout=30,
        )

        history_response.raise_for_status()
        history = history_response.json()

        if prompt_id in history:
            outputs = history[prompt_id].get("outputs", {})

            if "9" in outputs:
                images = outputs["9"].get("images", [])

                if images:
                    image_info = images[0]

                    image_response = requests.get(
                        f"{COMFY_URL}/view",
                        params={
                            "filename": image_info["filename"],
                            "subfolder": image_info.get("subfolder", ""),
                            "type": image_info.get("type", "output"),
                        },
                        timeout=60,
                    )

                    image_response.raise_for_status()

                    filename = (
                        f"scene_{uuid.uuid4().hex[:8]}.png"
                    )

                    output_path = OUTPUT_DIR / filename

                    output_path.write_bytes(image_response.content)

                    print(f"Image saved: {output_path}")

                    return str(output_path)

        time.sleep(1)

    raise TimeoutError("ComfyUI image generation timed out.")
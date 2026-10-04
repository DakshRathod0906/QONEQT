import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
VOICE_DIR = BASE_DIR / "generated" / "audio"
VOICE_DIR.mkdir(parents=True, exist_ok=True)

VOICE_MODEL = "en_US-lessac-medium"


def generate_voice(text: str, filename: str):
    output_path = VOICE_DIR / filename

    command = [
        "python",
        "-m",
        "piper",
        "-m",
        VOICE_MODEL,
        "-f",
        str(output_path),
        "--",
        text,
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"Piper TTS failed:\n{result.stderr}"
        )

    return str(output_path)
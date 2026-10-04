import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
VIDEO_DIR = BASE_DIR / "generated" / "video"
VIDEO_DIR.mkdir(parents=True, exist_ok=True)


def run_ffmpeg(command):
    print("\nRunning FFmpeg...")
    result = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print(result.stderr)
        raise RuntimeError("FFmpeg failed")

    return result


def create_scene_clip(image_path, audio_path, duration, scene_number):
    scene_dir = VIDEO_DIR / "scenes"
    scene_dir.mkdir(exist_ok=True)

    output = scene_dir / f"scene_{scene_number}.mp4"

    image_path = Path(image_path)
    audio_path = Path(audio_path)

    command = [
        "ffmpeg",
        "-y",

        # Image
        "-loop", "1",
        "-i", str(image_path),

        # Voice
        "-i", str(audio_path),

        # Exact scene duration
        "-t", str(duration),

        # Vertical video
        "-vf",
        (
            "scale=1080:1920:"
            "force_original_aspect_ratio=increase,"
            "crop=1080:1920,"
            "format=yuv420p"
        ),

        "-r", "30",

        # Video
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "23",

        # Audio
        "-c:a", "aac",
        "-b:a", "128k",
        "-ar", "44100",
        "-ac", "2",

        str(output)
    ]

    run_ffmpeg(command)

    print(f"Scene {scene_number} created: {output}")

    return output


def compose_video(scenes, output_filename="qoneqt_demo.mp4"):
    scene_files = []

    for scene in scenes:
        clip = create_scene_clip(
            scene["image"],
            scene["audio"],
            scene["duration"],
            scene["scene"]
        )

        scene_files.append(clip)

    # Create concat file
    concat_file = VIDEO_DIR / "concat.txt"

    with open(concat_file, "w", encoding="utf-8") as f:
        for clip in scene_files:
            # FFmpeg concat requires forward slashes
            path = str(clip.resolve()).replace("\\", "/")
            f.write(f"file '{path}'\n")

    output_path = VIDEO_DIR / output_filename

    command = [
        "ffmpeg",
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_file),
        "-c", "copy",
        str(output_path)
    ]

    run_ffmpeg(command)

    print("\n====================================")
    print("VIDEO CREATED SUCCESSFULLY")
    print("====================================")
    print(f"Output: {output_path}")

    return output_path


if __name__ == "__main__":

    scenes = [
        {
            "scene": 1,
            "duration": 6,
            "image": r"C:\Users\daksh\qoneqt-engine\backend\generated\scene_29c0db44.png",
            "audio": r"C:\Users\daksh\qoneqt-engine\backend\generated\audio\scene_1.wav"
        },
        {
            "scene": 2,
            "duration": 6,
            "image": r"C:\Users\daksh\qoneqt-engine\backend\generated\scene_4f06c375.png",
            "audio": r"C:\Users\daksh\qoneqt-engine\backend\generated\audio\scene_2.wav"
        },
        {
            "scene": 3,
            "duration": 6,
            "image": r"C:\Users\daksh\qoneqt-engine\backend\generated\scene_c7675f64.png",
            "audio": r"C:\Users\daksh\qoneqt-engine\backend\generated\audio\scene_3.wav"
        },
        {
            "scene": 4,
            "duration": 6,
            "image": r"C:\Users\daksh\qoneqt-engine\backend\generated\scene_a968d37b.png",
            "audio": r"C:\Users\daksh\qoneqt-engine\backend\generated\audio\scene_4.wav"
        },
        {
            "scene": 5,
            "duration": 6,
            "image": r"C:\Users\daksh\qoneqt-engine\backend\generated\scene_2c674b05.png",
            "audio": r"C:\Users\daksh\qoneqt-engine\backend\generated\audio\scene_5.wav"
        }
    ]

    compose_video(scenes)
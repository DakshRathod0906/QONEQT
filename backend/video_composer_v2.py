import subprocess
from pathlib import Path


# ============================================================
# QONEQT AI CONTENT ENGINE
# VIDEO COMPOSER V2
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

VIDEO_DIR = BASE_DIR / "generated" / "video_v2"
SCENE_DIR = VIDEO_DIR / "scenes"

VIDEO_DIR.mkdir(parents=True, exist_ok=True)
SCENE_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# FFMPEG RUNNER
# ============================================================

def run_ffmpeg(command):

    result = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print("\n========== FFMPEG ERROR ==========\n")
        print(result.stderr)
        print("\n==================================\n")
        raise RuntimeError("FFmpeg failed")

    return result


# ============================================================
# CREATE ANIMATED SCENE
# ============================================================

def create_scene_clip(scene):

    number = scene["scene"]

    image = Path(scene["image"])
    audio = Path(scene["audio"])

    duration = float(scene["duration"])

    output = SCENE_DIR / f"scene_{number}.mp4"

    total_frames = int(duration * 30)

    # --------------------------------------------------------
    # Different camera movement for each scene
    # --------------------------------------------------------

    if number == 1:

        # Dramatic zoom IN
        zoom = (
            f"1.0 + 0.22*on/{total_frames}"
        )

        x = (
            "iw/2-(iw/zoom/2)"
        )

        y = (
            "ih/2-(ih/zoom/2)"
            f"-80*on/{total_frames}"
        )

    elif number == 2:

        # Zoom OUT + move right
        zoom = (
            f"1.22 - 0.17*on/{total_frames}"
        )

        x = (
            "iw/2-(iw/zoom/2)"
            f"+140*on/{total_frames}"
        )

        y = (
            "ih/2-(ih/zoom/2)"
        )

    elif number == 3:

        # Zoom IN + move down
        zoom = (
            f"1.0 + 0.20*on/{total_frames}"
        )

        x = (
            "iw/2-(iw/zoom/2)"
        )

        y = (
            "ih/2-(ih/zoom/2)"
            f"+120*on/{total_frames}"
        )

    elif number == 4:

        # Strong horizontal pan
        zoom = "1.18"

        x = (
            "iw/2-(iw/zoom/2)"
            f"-160+320*on/{total_frames}"
        )

        y = (
            "ih/2-(ih/zoom/2)"
        )

    else:

        # Final scene:
        # stronger cinematic zoom
        zoom = (
            f"1.0 + 0.28*on/{total_frames}"
        )

        x = (
            "iw/2-(iw/zoom/2)"
        )

        y = (
            "ih/2-(ih/zoom/2)"
        )

    # --------------------------------------------------------
    # Build video filter
    # --------------------------------------------------------

    video_filter = (
        "scale=1080:1920:"
        "force_original_aspect_ratio=increase,"
        "crop=1080:1920,"
        "zoompan="
        f"z='{zoom}':"
        f"x='{x}':"
        f"y='{y}':"
        "d=1:"
        "s=1080x1920:"
        "fps=30,"
        f"fade=t=in:st=0:d=0.25,"
        f"fade=t=out:st={max(duration - 0.25, 0.25)}:d=0.25,"
        "format=yuv420p"
    )

    command = [
        "ffmpeg",
        "-y",

        # ----------------------------------------------------
        # IMAGE
        # ----------------------------------------------------

        "-loop", "1",
        "-i", str(image),

        # ----------------------------------------------------
        # AUDIO
        # ----------------------------------------------------

        "-i", str(audio),

        # ----------------------------------------------------
        # EXACT DURATION
        # ----------------------------------------------------

        "-t", str(duration),

        # ----------------------------------------------------
        # VIDEO
        # ----------------------------------------------------

        "-vf", video_filter,

        "-r", "30",

        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "22",

        "-pix_fmt", "yuv420p",

        # ----------------------------------------------------
        # AUDIO
        # ----------------------------------------------------

        "-c:a", "aac",
        "-b:a", "128k",
        "-ar", "44100",
        "-ac", "2",

        # Prevent short narration from ending scene early
        "-af", "apad",

        "-shortest",

        str(output)
    ]

    print(
        f"\nCreating animated scene {number} "
        f"({duration}s)..."
    )

    run_ffmpeg(command)

    print(f"Scene {number} complete.")

    return output


# ============================================================
# CONCAT SCENES
# ============================================================

def create_concat_file(scene_files):

    concat_file = VIDEO_DIR / "concat.txt"

    with open(
        concat_file,
        "w",
        encoding="utf-8"
    ) as f:

        for scene_file in scene_files:

            path = (
                str(scene_file.resolve())
                .replace("\\", "/")
            )

            f.write(
                f"file '{path}'\n"
            )

    return concat_file


# ============================================================
# CREATE ASS CAPTIONS
# ============================================================

def create_ass_file(scenes):

    ass_path = VIDEO_DIR / "captions.ass"

    current_time = 0.0

    def ass_time(seconds):

        hours = int(seconds // 3600)

        minutes = int(
            (seconds % 3600) // 60
        )

        secs = int(seconds % 60)

        centiseconds = int(
            round(
                (seconds - int(seconds)) * 100
            )
        )

        if centiseconds >= 100:

            secs += 1
            centiseconds -= 100

        return (
            f"{hours}:"
            f"{minutes:02}:"
            f"{secs:02}."
            f"{centiseconds:02}"
        )

    with open(
        ass_path,
        "w",
        encoding="utf-8"
    ) as f:

        # ----------------------------------------------------
        # ASS HEADER
        # ----------------------------------------------------

        f.write("[Script Info]\n")

        f.write(
            "Title: Qoneqt AI Content Engine\n"
        )

        f.write(
            "ScriptType: v4.00+\n"
        )

        f.write(
            "PlayResX: 1080\n"
        )

        f.write(
            "PlayResY: 1920\n"
        )

        f.write(
            "ScaledBorderAndShadow: yes\n\n"
        )

        # ----------------------------------------------------
        # STYLE
        # ----------------------------------------------------

        f.write("[V4+ Styles]\n")

        f.write(
            "Format: Name,Fontname,Fontsize,"
            "PrimaryColour,SecondaryColour,"
            "OutlineColour,BackColour,"
            "Bold,Italic,Underline,StrikeOut,"
            "ScaleX,ScaleY,Spacing,Angle,"
            "BorderStyle,Outline,Shadow,"
            "Alignment,MarginL,MarginR,MarginV,Encoding\n"
        )

        # Smaller, cleaner caption
        f.write(
            "Style: Qoneqt,Arial,42,"
            "&H00FFFFFF,"
            "&H000000FF,"
            "&H00000000,"
            "&H90000000,"
            "1,0,0,0,"
            "100,100,0,0,"
            "1,2,1,"
            "2,90,90,170,1\n"
        )

        f.write("\n")

        # ----------------------------------------------------
        # EVENTS
        # ----------------------------------------------------

        f.write("[Events]\n")

        f.write(
            "Format: Layer,Start,End,Style,"
            "Name,MarginL,MarginR,MarginV,"
            "Effect,Text\n"
        )

        # ----------------------------------------------------
        # CREATE CAPTIONS
        # ----------------------------------------------------

        for scene in scenes:

            start = current_time

            end = (
                current_time
                + float(scene["duration"])
            )

            narration = scene["narration"].strip()

            words = narration.split()

            # Keep captions compact.
            # Maximum roughly 8 words per line.

            if len(words) > 8:

                lines = []

                for i in range(
                    0,
                    len(words),
                    8
                ):

                    lines.append(
                        " ".join(
                            words[i:i + 8]
                        )
                    )

                caption = "\\N".join(lines)

            else:

                caption = narration

            # Escape ASS special characters

            caption = (
                caption
                .replace("\\", "")
                .replace("{", "\\{")
                .replace("}", "\\}")
            )

            f.write(
                "Dialogue: 0,"
                f"{ass_time(start)},"
                f"{ass_time(end)},"
                "Qoneqt,,0,0,0,,"
                f"{caption}\n"
            )

            current_time = end

    return ass_path


# ============================================================
# BURN CAPTIONS
# ============================================================

def add_captions(video_path, scenes):

    ass_path = create_ass_file(scenes)

    final_video = (
        VIDEO_DIR
        / "qoneqt_demo_v2.mp4"
    )

    # Windows path escaping for FFmpeg
    subtitle_path = (
        str(ass_path.resolve())
        .replace("\\", "/")
        .replace(":", r"\:")
    )

    subtitle_filter = (
        f"ass='{subtitle_path}'"
    )

    command = [
        "ffmpeg",
        "-y",

        "-i", str(video_path),

        "-vf", subtitle_filter,

        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "22",

        "-c:a", "copy",

        "-movflags", "+faststart",

        str(final_video)
    ]

    print(
        "\nAdding cinematic captions..."
    )

    run_ffmpeg(command)

    return final_video


# ============================================================
# MAIN COMPOSITOR
# ============================================================

def compose_video(scenes):

    print("\n")
    print("========================================")
    print("      QONEQT VIDEO ENGINE V2")
    print("========================================")
    print("")

    # --------------------------------------------------------
    # STEP 1
    # Create animated scene clips
    # --------------------------------------------------------

    scene_files = []

    for scene in scenes:

        scene_file = (
            create_scene_clip(scene)
        )

        scene_files.append(
            scene_file
        )

    # --------------------------------------------------------
    # STEP 2
    # Create concat file
    # --------------------------------------------------------

    concat_file = (
        create_concat_file(
            scene_files
        )
    )

    # --------------------------------------------------------
    # STEP 3
    # Join scenes
    # --------------------------------------------------------

    base_video = (
        VIDEO_DIR
        / "qoneqt_base_v2.mp4"
    )

    command = [
        "ffmpeg",
        "-y",

        "-f", "concat",
        "-safe", "0",

        "-i", str(concat_file),

        "-c", "copy",

        str(base_video)
    ]

    print(
        "\nJoining animated scenes..."
    )

    run_ffmpeg(command)

    # --------------------------------------------------------
    # STEP 4
    # Add captions
    # --------------------------------------------------------

    final_video = (
        add_captions(
            base_video,
            scenes
        )
    )

    # --------------------------------------------------------
    # COMPLETE
    # --------------------------------------------------------

    print("")
    print("========================================")
    print("       VIDEO CREATED SUCCESSFULLY")
    print("========================================")
    print("")
    print(
        f"Final video:\n{final_video}"
    )
    print("")

    return final_video


# ============================================================
# DEMO DATA
# ============================================================

if __name__ == "__main__":

    scenes = [

        {
            "scene": 1,
            "duration": 6,

            "image":
                r"C:\Users\daksh\qoneqt-engine\backend\generated\scene_29c0db44.png",

            "audio":
                r"C:\Users\daksh\qoneqt-engine\backend\generated\audio\scene_1.wav",

            "narration":
                "From the Himalayas to the Arabian Sea, India's diversity is reflected in its many languages and scripts."
        },

        {
            "scene": 2,
            "duration": 6,

            "image":
                r"C:\Users\daksh\qoneqt-engine\backend\generated\scene_4f06c375.png",

            "audio":
                r"C:\Users\daksh\qoneqt-engine\backend\generated\audio\scene_2.wav",

            "narration":
                "The northern plains echo with Punjabi and Urdu scripts across a landscape shaped by centuries of culture."
        },

        {
            "scene": 3,
            "duration": 6,

            "image":
                r"C:\Users\daksh\qoneqt-engine\backend\generated\scene_c7675f64.png",

            "audio":
                r"C:\Users\daksh\qoneqt-engine\backend\generated\audio\scene_3.wav",

            "narration":
                "The Deccan Plateau pulses with languages including Telugu and Kannada."
        },

        {
            "scene": 4,
            "duration": 6,

            "image":
                r"C:\Users\daksh\qoneqt-engine\backend\generated\scene_a968d37b.png",

            "audio":
                r"C:\Users\daksh\qoneqt-engine\backend\generated\audio\scene_4.wav",

            "narration":
                "The Northeast adds another layer of linguistic and cultural diversity."
        },

        {
            "scene": 5,
            "duration": 6,

            "image":
                r"C:\Users\daksh\qoneqt-engine\backend\generated\scene_2c674b05.png",

            "audio":
                r"C:\Users\daksh\qoneqt-engine\backend\generated\audio\scene_5.wav",

            "narration":
                "India is not just a country. It is a living mosaic of voices."
        }
    ]

    compose_video(scenes)
from veo_client import generate_video


prompt = """
Vertical 9:16 cinematic social media video.

A futuristic Indian space scientist stands on a rooftop at night,
looking up at a massive glowing Earth projected in the sky.

The camera slowly moves forward toward her,
then gently circles around her shoulder.

Stars move naturally in the background.
Her hair and clothing react subtly to the night wind.

Realistic human movement.
Cinematic lighting.
Photorealistic.
High detail.
Dynamic camera movement.
Modern premium science documentary style.

No text.
No subtitles.
No logos.
No watermark.
"""


video = generate_video(
    prompt=prompt,
    scene_number=1,
    duration=6,
)

print("\nVIDEO GENERATED:")
print(video)
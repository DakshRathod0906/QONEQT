import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Circle,
  Clapperboard,
  Download,
  Image as ImageIcon,
  Loader2,
  Mic2,
  Play,
  Sparkles,
  Video,
  Volume2,
} from "lucide-react";

const BACKEND_URL = "http://127.0.0.1:8000";

export default function Studio() {
  const location = useLocation();
  const navigate = useNavigate();

  const blueprint = location.state?.blueprint;
  const input = location.state?.input;

  const [status, setStatus] = useState("idle");
  const [scenes, setScenes] = useState([]);
  const [selectedScene, setSelectedScene] = useState(0);
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    if (!blueprint) {
      navigate("/create");
    }
  }, [blueprint, navigate]);

  if (!blueprint) {
    return null;
  }

  // ==================================================
  // PIPELINE
  // ==================================================

  const pipeline = [
    {
      id: "blueprint",
      label: "Blueprint",
      icon: Sparkles,
      description: "Story structure",
      done: true,
    },
    {
      id: "visuals",
      label: "Visuals",
      icon: ImageIcon,
      description: "AI visuals",
      done: scenes.length > 0,
      active: status === "generating",
    },
    {
      id: "voice",
      label: "Voice",
      icon: Mic2,
      description: "Narration",
      done: scenes.length > 0,
    },
    {
      id: "compose",
      label: "Compose",
      icon: Video,
      description: "Final video",
      done: Boolean(videoUrl),
      active: status === "composing",
    },
    {
      id: "quality",
      label: "Quality Check",
      icon: Check,
      description: "Ready to publish",
      done: Boolean(videoUrl),
    },
  ];

  // ==================================================
  // FILE NAME HELPER
  // ==================================================

  const getFileName = (path) => {
    if (!path) return "";

    return path
      .replaceAll("\\", "/")
      .split("/")
      .pop();
  };

  // ==================================================
  // COMPOSE VIDEO
  // ==================================================

  const composeVideo = async (generatedScenes) => {
    setStatus("composing");
    setError("");

    try {
      const response = await fetch(
        `${BACKEND_URL}/compose-video`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scenes: generatedScenes.map((scene) => ({
              image: scene.image,
              audio: scene.audio,
              duration: scene.duration,
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Video composition failed"
        );
      }

      const finalVideoUrl =
        `${BACKEND_URL}${data.video}`;

      setVideoUrl(finalVideoUrl);
      setStatus("complete");

    } catch (err) {
      console.error("Composition error:", err);

      setError(
        err.message ||
        "Video composition failed."
      );

      setStatus("error");
    }
  };

  // ==================================================
  // GENERATE MEDIA
  // ==================================================

  const generateMedia = async () => {
    setStatus("generating");
    setError("");
    setVideoUrl("");
    setScenes([]);

    try {
      const response = await fetch(
        `${BACKEND_URL}/generate-all-scenes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic:
              input?.idea ||
              blueprint.title ||
              "AI generated video",

            content_type:
              input?.contentType ||
              "short",

            tone:
              input?.tone ||
              "Cinematic",

            duration:
              Number(input?.duration) ||
              Number(blueprint.duration) ||
              30,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
          "Media generation failed"
        );
      }

      // ==================================================
      // PREPARE GENERATED SCENES
      // ==================================================

      const preparedScenes =
        data.scenes.map((scene) => ({
          ...scene,

          imageUrl:
            `${BACKEND_URL}/generated/${getFileName(
              scene.image
            )}`,

          audioUrl:
            `${BACKEND_URL}/generated/audio/${getFileName(
              scene.audio
            )}`,
        }));

      setScenes(preparedScenes);

      // ==================================================
      // AUTOMATICALLY COMPOSE VIDEO
      // ==================================================

      await composeVideo(
        preparedScenes
      );

    } catch (err) {
      console.error(
        "Media generation error:",
        err
      );

      setError(
        err.message ||
        "Media generation failed."
      );

      setStatus("error");
    }
  };

  // ==================================================
  // BACK TO BLUEPRINT
  // ==================================================

  const goBack = () => {
    navigate("/blueprint", {
      state: {
        blueprint,
        input,
      },
    });
  };

  // ==================================================
  // CURRENT SCENE
  // ==================================================

  const currentScene =
    scenes[selectedScene];

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-8 py-5">

          {/* LEFT */}

          <div className="flex items-center gap-4">

            <button
              onClick={goBack}
              className="rounded-xl border border-white/10 p-2.5 text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>

            <div>

              <div className="flex items-center gap-2">

                <Clapperboard
                  size={18}
                  className="text-blue-400"
                />

                <span className="text-sm font-semibold">
                  Qoneqt Studio
                </span>

              </div>

              <p className="mt-1 text-xs text-white/40">
                AI Content Production Pipeline
              </p>

            </div>

          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-3">

            {status === "complete" && (
              <div className="flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/5 px-3 py-1.5 text-xs text-green-300">

                <Check size={14} />

                Video ready

              </div>
            )}

            {status === "composing" && (
              <div className="flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-3 py-1.5 text-xs text-blue-300">

                <Loader2
                  size={14}
                  className="animate-spin"
                />

                Composing video...

              </div>
            )}

            <button
              onClick={generateMedia}
              disabled={
                status === "generating" ||
                status === "composing"
              }
              className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {status === "generating" ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Generating...
                </>
              ) : status === "composing" ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Composing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />

                  Generate Media
                </>
              )}

            </button>

          </div>

        </div>

      </header>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="mx-auto max-w-[1500px] px-8 py-8">

        {/* TITLE */}

        <div className="mb-8">

          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-blue-400">
            Video Studio
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            {blueprint.title}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
            {blueprint.hook}
          </p>

        </div>

        {/* ==================================================
            PIPELINE
        ================================================== */}

        <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <h2 className="text-sm font-semibold">
                Production pipeline
              </h2>

              <p className="mt-1 text-xs text-white/35">
                One coordinated workflow from
                blueprint to publish-ready media.
              </p>

            </div>

            {status === "generating" && (
              <div className="flex items-center gap-2 text-xs text-blue-300">

                <Loader2
                  size={14}
                  className="animate-spin"
                />

                AI production running

              </div>
            )}

            {status === "composing" && (
              <div className="flex items-center gap-2 text-xs text-blue-300">

                <Loader2
                  size={14}
                  className="animate-spin"
                />

                Composing final video

              </div>
            )}

          </div>

          <div className="grid grid-cols-5 gap-3">

            {pipeline.map(
              (step) => {

                const Icon = step.icon;

                return (
                  <div
                    key={step.id}
                    className={`relative rounded-xl border p-4 ${step.done
                      ? "border-green-400/20 bg-green-400/[0.04]"
                      : step.active
                        ? "border-blue-400/30 bg-blue-400/[0.05]"
                        : "border-white/10 bg-white/[0.02]"
                      }`}
                  >

                    <div className="flex items-center justify-between">

                      <Icon
                        size={18}
                        className={
                          step.done
                            ? "text-green-400"
                            : step.active
                              ? "text-blue-400"
                              : "text-white/30"
                        }
                      />

                      {step.done ? (
                        <Check
                          size={15}
                          className="text-green-400"
                        />
                      ) : step.active ? (
                        <Loader2
                          size={15}
                          className="animate-spin text-blue-400"
                        />
                      ) : (
                        <Circle
                          size={12}
                          className="text-white/20"
                        />
                      )}

                    </div>

                    <p className="mt-4 text-sm font-medium">
                      {step.label}
                    </p>

                    <p className="mt-1 text-[11px] text-white/35">
                      {step.description}
                    </p>

                  </div>
                );
              }
            )}

          </div>

        </section>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4">

            <p className="text-sm font-medium text-red-300">
              Generation failed
            </p>

            <p className="mt-1 text-xs text-red-200/60">
              {error}
            </p>

          </div>
        )}

        {/* ==================================================
            MAIN STUDIO GRID
        ================================================== */}

        <div className="grid grid-cols-[1fr_360px] gap-6">

          {/* ==================================================
              VIDEO PREVIEW
          ================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h2 className="text-sm font-semibold">
                  Video preview
                </h2>

                <p className="mt-1 text-xs text-white/35">
                  {blueprint.duration}s vertical content
                </p>

              </div>

              {videoUrl && (
                <a
                  href={videoUrl}
                  download="qoneqt-ai-video.mp4"
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  <Download size={14} />
                  Export MP4
                </a>
              )}

            </div>

            <div className="flex min-h-[650px] items-center justify-center rounded-2xl border border-white/10 bg-black">

              {/* FINAL VIDEO */}

              {videoUrl ? (

                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="max-h-[620px] max-w-full rounded-xl"
                />

              ) : currentScene ? (

                /* SCENE PREVIEW */

                <div className="relative overflow-hidden rounded-xl">

                  <img
                    src={currentScene.imageUrl}
                    alt={`Scene ${currentScene.scene}`}
                    className="max-h-[620px] max-w-full object-contain"
                  />

                  <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-black/70 p-4 backdrop-blur-xl">

                    <p className="text-xs text-white/40">
                      Scene {currentScene.scene}
                    </p>

                    <p className="mt-1 text-sm leading-5">
                      {currentScene.narration}
                    </p>

                  </div>

                </div>

              ) : (

                /* EMPTY STATE */

                <div className="max-w-sm text-center">

                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">

                    <Play
                      size={24}
                      className="text-white/30"
                    />

                  </div>

                  <h3 className="text-sm font-semibold">
                    Ready to generate
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-white/35">
                    Generate the visual scenes,
                    narration and final video from
                    your AI blueprint.
                  </p>

                  <button
                    onClick={generateMedia}
                    className="mt-5 rounded-xl bg-blue-500 px-5 py-2.5 text-xs font-semibold hover:bg-blue-400"
                  >
                    Generate Media
                  </button>

                </div>

              )}

            </div>

          </section>

          {/* ==================================================
              SCENE TIMELINE
          ================================================== */}

          <aside className="rounded-2xl border border-white/10 bg-white/[0.02]">

            <div className="border-b border-white/10 p-5">

              <h2 className="text-sm font-semibold">
                Scene timeline
              </h2>

              <p className="mt-1 text-xs text-white/35">
                {scenes.length ||
                  blueprint.scenes.length}{" "}
                scenes
              </p>

            </div>

            <div className="max-h-[700px] overflow-y-auto p-3">

              {(scenes.length
                ? scenes
                : blueprint.scenes
              ).map(
                (scene, index) => {

                  const generated =
                    scenes.length > 0;

                  return (
                    <button
                      key={scene.scene}
                      onClick={() =>
                        generated &&
                        setSelectedScene(index)
                      }
                      className={`mb-2 w-full rounded-xl border p-3 text-left transition ${selectedScene === index
                        ? "border-blue-400/30 bg-blue-400/[0.06]"
                        : "border-white/5 bg-white/[0.015] hover:bg-white/[0.03]"
                        }`}
                    >

                      <div className="flex gap-3">

                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black">

                          {generated ? (

                            <img
                              src={scene.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />

                          ) : (

                            <div className="flex h-full items-center justify-center">

                              <ImageIcon
                                size={18}
                                className="text-white/20"
                              />

                            </div>

                          )}

                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center justify-between">

                            <span className="text-[11px] font-medium text-blue-400">
                              SCENE {scene.scene}
                            </span>

                            <span className="text-[10px] text-white/30">
                              {scene.duration}s
                            </span>

                          </div>

                          <p className="mt-1 line-clamp-3 text-xs leading-4 text-white/55">
                            {scene.narration}
                          </p>

                        </div>

                      </div>

                    </button>
                  );
                }
              )}

            </div>

          </aside>

        </div>

        {/* ==================================================
            SELECTED SCENE DETAILS
        ================================================== */}

        {currentScene && (

          <section className="mt-6 grid grid-cols-2 gap-6">

            {/* NARRATION */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">

              <div className="flex items-center gap-2">

                <Volume2
                  size={16}
                  className="text-blue-400"
                />

                <h3 className="text-sm font-semibold">
                  Narration
                </h3>

              </div>

              <p className="mt-4 text-sm leading-6 text-white/60">
                {currentScene.narration}
              </p>

              {currentScene.audioUrl && (
                <audio
                  controls
                  src={currentScene.audioUrl}
                  className="mt-5 w-full"
                />
              )}

            </div>

            {/* VISUAL PROMPT */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">

              <div className="flex items-center gap-2">

                <ImageIcon
                  size={16}
                  className="text-blue-400"
                />

                <h3 className="text-sm font-semibold">
                  Visual prompt
                </h3>

              </div>

              <p className="mt-4 text-sm leading-6 text-white/45">
                {currentScene.visual_prompt}
              </p>

            </div>

          </section>

        )}

        {/* ==================================================
            FINAL VIDEO STATUS
        ================================================== */}

        {videoUrl && (

          <section className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/[0.03] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-400/10">

                  <Check
                    size={20}
                    className="text-green-400"
                  />

                </div>

                <div>

                  <h3 className="text-sm font-semibold">
                    Video ready
                  </h3>

                  <p className="mt-1 text-xs text-white/40">
                    Your AI-generated video has
                    been successfully composed.
                  </p>

                </div>

              </div>

              <a
                href={videoUrl}
                download="qoneqt-ai-video.mp4"
                className="flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-green-400"
              >
                <Download size={15} />
                Export MP4
              </a>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}
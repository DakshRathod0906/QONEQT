import {
  ArrowLeft,
  CheckCircle2,
  Clapperboard,
  Download,
  Film,
  Loader2,
  Mic2,
  Play,
  RefreshCw,
  Sparkles,
  WandSparkles,
  Volume2,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import mockBlueprint from '../data/mockBlueprint'

const pipeline = [
  { label: 'Script', icon: Sparkles },
  { label: 'Scene Blueprint', icon: Film },
  { label: 'Visuals', icon: WandSparkles },
  { label: 'Voice', icon: Mic2 },
  { label: 'Captions', icon: Clapperboard },
  { label: 'Composition', icon: Film },
]

function Studio() {
  const navigate = useNavigate()
  const location = useLocation()

  const blueprint = location.state?.blueprint || mockBlueprint
  const input = location.state?.input

  const scenes = blueprint.scenes || []

  return (
    <div className="min-h-full bg-zinc-950 px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate('/blueprint', {
              state: { blueprint, input },
            })}
            className="mb-4 flex items-center gap-2 text-xs text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to Blueprint
          </button>

          <div className="flex items-center gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">
                Video Studio
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                {blueprint.title}
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Assemble and review your AI-generated content.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white">
            <Download size={16} />
            Export
          </button>

          <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500">
            <Sparkles size={16} />
            Publish
          </button>
        </div>
      </div>

      {/* Main Studio */}
      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-6">
        {/* Left */}
        <div className="space-y-6">
          {/* Video Preview */}
          <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-white">Video Preview</p>
                <p className="mt-1 text-xs text-zinc-600">
                  Final composition preview
                </p>
              </div>

              <span className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[11px] text-zinc-500">
                9:16 • {input?.duration || 30}s
              </span>
            </div>

            <div className="flex min-h-[560px] items-center justify-center bg-black p-8">
              <div className="relative aspect-[9/16] h-[500px] overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black shadow-2xl">
                {/* Fake visual background */}
                <div className="absolute inset-0 opacity-70">
                  <div className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
                  <div className="absolute bottom-20 left-10 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl" />
                </div>

                <div className="relative flex h-full flex-col items-center justify-between p-6">
                  <div className="mt-8 text-center">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-blue-400">
                      AI GENERATED
                    </p>

                    <h2 className="mt-3 text-lg font-semibold leading-tight text-white">
                      {blueprint.title}
                    </h2>
                  </div>

                  <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-lg transition hover:scale-105">
                    <Play size={21} fill="currentColor" />
                  </button>

                  <div className="w-full">
                    <p className="line-clamp-2 text-center text-xs leading-relaxed text-zinc-300">
                      {scenes[0]?.narration || blueprint.hook}
                    </p>

                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-zinc-800">
                      <div className="h-full w-1/4 rounded-full bg-blue-500" />
                    </div>

                    <div className="mt-2 flex justify-between text-[9px] text-zinc-600">
                      <span>00:00</span>
                      <span>00:{String(input?.duration || 30).padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Scene Timeline */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <div className="border-b border-zinc-800 px-5 py-4">
              <p className="text-sm font-medium text-white">Scene Timeline</p>
              <p className="mt-1 text-xs text-zinc-600">
                {scenes.length} scenes • {input?.duration || 30}s total
              </p>
            </div>

            <div className="grid grid-cols-5 gap-3 p-5">
              {scenes.map((scene, index) => (
                <div
                  key={scene.scene || index}
                  className={`group cursor-pointer rounded-xl border p-3 transition ${
                    index === 0
                      ? 'border-blue-500/40 bg-blue-500/5'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <div className="mb-3 flex aspect-video items-center justify-center rounded-lg bg-zinc-900">
                    <Film size={18} className="text-zinc-600" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-300">
                      Scene {index + 1}
                    </span>

                    <span className="text-[10px] text-zinc-600">
                      {scene.duration}s
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Scene Details */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-white">
                  Scene 1 Details
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Review generated content before composition.
                </p>
              </div>

              <button className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400 transition hover:text-white">
                <RefreshCw size={13} />
                Regenerate
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                  Narration
                </p>

                <p className="text-sm leading-7 text-zinc-300">
                  {scenes[0]?.narration || 'No narration available.'}
                </p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                  Visual Direction
                </p>

                <p className="text-sm leading-7 text-zinc-400">
                  {scenes[0]?.visual_prompt || 'No visual direction available.'}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right */}
        <aside className="space-y-6">
          {/* Pipeline */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="mb-5">
              <p className="text-sm font-medium text-white">
                Generation Pipeline
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                AI production status
              </p>
            </div>

            <div className="space-y-1">
              {pipeline.map((item, index) => {
                const Icon = item.icon
                const completed = index < 3
                const active = index === 3

                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl px-3 py-3"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        completed
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : active
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-zinc-900 text-zinc-600'
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 size={16} />
                      ) : active ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Icon size={16} />
                      )}
                    </div>

                    <div className="flex-1">
                      <p
                        className={`text-xs font-medium ${
                          completed || active
                            ? 'text-zinc-200'
                            : 'text-zinc-600'
                        }`}
                      >
                        {item.label}
                      </p>

                      <p className="mt-0.5 text-[10px] text-zinc-600">
                        {completed
                          ? 'Completed'
                          : active
                            ? 'Generating...'
                            : 'Waiting'}
                      </p>
                    </div>

                    {completed && (
                      <CheckCircle2
                        size={14}
                        className="text-emerald-500"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Audio */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <Volume2 size={17} />
              </div>

              <div>
                <p className="text-sm font-medium text-white">Voice Track</p>
                <p className="text-[11px] text-zinc-600">
                  AI generated narration
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] text-zinc-600">
                  en-US • AI Voice
                </span>

                <span className="text-[10px] text-zinc-600">
                  00:30
                </span>
              </div>

              <div className="flex items-center gap-1">
                {Array.from({ length: 32 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-1 rounded-full bg-zinc-700"
                    style={{
                      height: `${8 + ((index * 17) % 22)}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Quality Check */}
          <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0 text-emerald-400"
              />

              <div>
                <p className="text-sm font-medium text-emerald-300">
                  Quality Check Passed
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  All generated assets are available and the composition is
                  ready for final rendering.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default Studio
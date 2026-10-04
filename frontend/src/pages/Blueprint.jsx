import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Play } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import mockBlueprint from '../data/mockBlueprint'

function Blueprint() {
  const navigate = useNavigate()
  const location = useLocation()

  const blueprint = location.state?.blueprint || mockBlueprint
  const input = location.state?.input

  const scenes = Array.isArray(blueprint?.scenes)
    ? blueprint.scenes
    : []

  const totalDuration =
    Number(blueprint?.duration) ||
    scenes.reduce((total, scene) => total + Number(scene.duration || 0), 0)

  const handleGenerateMedia = () => {
    navigate('/studio', {
      state: {
        blueprint,
        input,
      },
    })
  }

  return (
    <div className="min-h-full bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate('/create')}
            className="group flex w-fit items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft
              size={17}
              className="transition group-hover:-translate-x-0.5"
            />
            Back to Create
          </button>

          <button
            type="button"
            onClick={handleGenerateMedia}
            disabled={scenes.length === 0}
            className={`group flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition ${
              scenes.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'cursor-not-allowed bg-zinc-800 text-zinc-600'
            }`}
          >
            Generate Media
            <ArrowRight
              size={17}
              className="transition group-hover:translate-x-0.5"
            />
          </button>
        </div>

        {/* Title */}
        <div className="mb-10">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
              AI CONTENT BLUEPRINT
            </span>

            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              READY
            </span>
          </div>

          <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {blueprint?.title || 'Untitled Video'}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Clock3 size={15} />
              {totalDuration}s
            </span>

            {input?.contentType && (
              <span className="capitalize">
                {input.contentType}
              </span>
            )}

            {input?.tone && (
              <span>
                {input.tone}
              </span>
            )}

            <span>9:16 Vertical</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Main content */}
          <main className="space-y-8">
            {/* Hook */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Opening Hook
                </p>
              </div>

              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] p-6">
                <p className="text-lg leading-8 text-zinc-200">
                  {blueprint?.hook || 'No hook generated.'}
                </p>
              </div>
            </section>

            {/* Script */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Story Direction
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
                <p className="text-sm leading-7 text-zinc-300">
                  {blueprint?.script || 'No script generated.'}
                </p>
              </div>
            </section>

            {/* Scenes */}
            <section>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Scene Blueprint
                    </p>
                  </div>

                  <p className="text-sm text-zinc-500">
                    {scenes.length} scenes · {totalDuration} seconds
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {scenes.map((scene, index) => {
                  const sceneNumber = Number(scene?.scene || index + 1)
                  const duration = Number(scene?.duration || 0)

                  const startTime = scenes
                    .slice(0, index)
                    .reduce(
                      (total, currentScene) =>
                        total + Number(currentScene?.duration || 0),
                      0,
                    )

                  const endTime = startTime + duration

                  return (
                    <article
                      key={sceneNumber}
                      className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-700 hover:bg-zinc-900"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row">
                        {/* Scene number */}
                        <div className="flex shrink-0 items-start gap-3 sm:w-32">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-sm font-semibold text-zinc-300">
                            {String(sceneNumber).padStart(2, '0')}
                          </div>

                          <div className="pt-1">
                            <p className="text-xs font-medium text-zinc-500">
                              TIMING
                            </p>

                            <p className="mt-1 whitespace-nowrap text-xs text-zinc-400">
                              {String(Math.floor(startTime / 60)).padStart(2, '0')}:
                              {String(startTime % 60).padStart(2, '0')}
                              {' — '}
                              {String(Math.floor(endTime / 60)).padStart(2, '0')}:
                              {String(endTime % 60).padStart(2, '0')}
                            </p>
                          </div>
                        </div>

                        {/* Scene content */}
                        <div className="min-w-0 flex-1 space-y-4">
                          <div>
                            <div className="mb-2 flex items-center justify-between gap-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                Narration
                              </p>

                              <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-500">
                                {duration}s
                              </span>
                            </div>

                            <p className="text-sm leading-6 text-zinc-200">
                              {scene?.narration || 'No narration generated.'}
                            </p>
                          </div>

                          <div className="border-t border-zinc-800 pt-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                              Visual Direction
                            </p>

                            <p className="text-sm leading-6 text-zinc-400">
                              {scene?.visual_prompt ||
                                'No visual direction generated.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          </main>

          {/* Right sidebar */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">
                    Blueprint Ready
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Production plan generated successfully
                  </p>
                </div>

                <CheckCircle2
                  size={20}
                  className="shrink-0 text-emerald-400"
                />
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                  <p className="text-xs text-zinc-500">Scenes</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {scenes.length}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                  <p className="text-xs text-zinc-500">Duration</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {totalDuration}s
                  </p>
                </div>
              </div>

              {/* Pipeline */}
              <div className="mt-6 border-t border-zinc-800 pt-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Production Pipeline
                </p>

                <div className="space-y-3">
                  <PipelineStep label="Idea" status="complete" />
                  <PipelineStep label="Blueprint" status="complete" />
                  <PipelineStep label="Media" status="next" />
                  <PipelineStep label="Compose" status="pending" />
                  <PipelineStep label="Publish" status="pending" />
                </div>
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={handleGenerateMedia}
                disabled={scenes.length === 0}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm transition ${
                  scenes.length > 0
                    ? 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-zinc-600 hover:text-white'
                    : 'cursor-not-allowed border-zinc-800 bg-zinc-950 text-zinc-600'
                }`}
              >
                <Play size={15} />
                Continue to Studio
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function PipelineStep({ label, status }) {
  const isComplete = status === 'complete'
  const isNext = status === 'next'

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
          isComplete
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            : isNext
              ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
              : 'border-zinc-800 bg-zinc-950 text-zinc-600'
        }`}
      >
        {isComplete ? (
          <CheckCircle2 size={14} />
        ) : (
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              isNext ? 'bg-blue-400' : 'bg-zinc-700'
            }`}
          />
        )}
      </div>

      <span
        className={`text-sm ${
          isComplete
            ? 'text-zinc-300'
            : isNext
              ? 'font-medium text-blue-400'
              : 'text-zinc-600'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

export default Blueprint
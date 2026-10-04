import {
  ArrowRight,
  Loader2,
  Clock3,
  Film,
  Lightbulb,
  Mic2,
  Sparkles,
  WandSparkles,
} from 'lucide-react'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const contentTypes = [
  {
    id: 'short',
    label: 'Short Video',
    description: 'Fast-paced social content',
    icon: Film,
  },
  {
    id: 'explainer',
    label: 'Explainer',
    description: 'Educational storytelling',
    icon: Lightbulb,
  },
]

const tones = [
  'Cinematic',
  'Energetic',
  'Educational',
  'Casual',
]

const durations = [
  {
    value: '15',
    label: '15s',
  },
  {
    value: '30',
    label: '30s',
  },
  {
    value: '60',
    label: '60s',
  },
]

function Create() {
  const navigate = useNavigate()

  const [idea, setIdea] = useState('')

  const [contentType, setContentType] = useState('short')

  const [tone, setTone] = useState('Cinematic')

  const [duration, setDuration] = useState('30')
  const [generating, setGenerating] = useState(false)

  const handleExample = () => {
    setIdea(
      "5 surprising facts about space that most people don't know",
    )
  }

  const handleGenerate = async () => {
    if (!idea.trim()) return

    setGenerating(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/generate-blueprint',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: idea.trim(),
            content_type: contentType,
            tone,
            duration: Number(duration),
          }),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to generate blueprint')
      }

      const data = await response.json()

      const blueprint = data.blueprint ?? data

      if (
        !blueprint ||
        !blueprint.title ||
        !blueprint.hook ||
        !blueprint.script ||
        !Array.isArray(blueprint.scenes)
      ) {
        console.error('Invalid blueprint response:', data)
        throw new Error('Blueprint schema mismatch')
      }

      navigate('/blueprint', {
        state: {
          blueprint,
          input: {
            idea: idea.trim(),
            contentType,
            tone,
            duration: Number(duration),
          },
        },
      })
    } catch (error) {
      console.error(error)
      alert('Could not generate blueprint. Make sure the backend is running.')
    } finally {
      setGenerating(false)
    }
  }
  return (
    <div className="mx-auto max-w-6xl p-8">

      {/* Header */}
      <div className="max-w-2xl">

        <div className="mb-3 flex items-center gap-2 text-sm text-blue-400">
          <Sparkles size={16} />
          AI CONTENT ENGINE
        </div>

        <h2 className="text-3xl font-semibold tracking-tight">
          Turn an idea into a story.
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Give Qoneqt a topic. We'll structure the story, plan the
          scenes, generate the visuals and prepare everything for
          publishing.
        </p>

      </div>

      {/* Main */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* LEFT */}
        <div className="space-y-6">

          {/* Idea */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
                <WandSparkles
                  size={18}
                  className="text-blue-400"
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold">
                  Your idea
                </h3>

                <p className="text-xs text-zinc-600">
                  Start with a topic, question or concept.
                </p>
              </div>

            </div>

            <textarea
              value={idea}
              onChange={(event) => setIdea(event.target.value.slice(0, 500))}
              placeholder="Example: 5 surprising facts about space that most people don't know..."
              className="min-h-44 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-700 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
            />

            <div className="mt-3 flex items-center justify-between">

              <span className="text-xs text-zinc-700">
                {idea.length} / 500 characters
              </span>

              <button
                type="button"
                onClick={handleExample}
                className="text-xs text-zinc-500 transition hover:text-zinc-300"
              >
                Use an example
              </button>

            </div>

          </section>

          {/* Content Type */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">

            <div className="mb-5">

              <h3 className="text-sm font-semibold">
                Content format
              </h3>

              <p className="mt-1 text-xs text-zinc-600">
                Choose how Qoneqt should structure the content.
              </p>

            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              {contentTypes.map((type) => {
                const Icon = type.icon
                const selected = contentType === type.id

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setContentType(type.id)}
                    className={`relative rounded-xl border p-4 text-left transition ${selected
                      ? 'border-blue-500/50 bg-blue-500/5'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                      }`}
                  >

                    {selected && (
                      <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-blue-500" />
                    )}

                    <Icon
                      size={19}
                      className={
                        selected
                          ? 'text-blue-400'
                          : 'text-zinc-500'
                      }
                    />

                    <p className="mt-4 text-sm font-medium">
                      {type.label}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      {type.description}
                    </p>

                  </button>
                )
              })}

            </div>

          </section>

          {/* Tone + Duration */}
          <section className="grid gap-6 sm:grid-cols-2">

            {/* Tone */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">

              <div className="mb-4 flex items-center gap-3">

                <Mic2
                  size={18}
                  className="text-zinc-500"
                />

                <div>
                  <h3 className="text-sm font-semibold">
                    Tone
                  </h3>

                  <p className="text-xs text-zinc-600">
                    How should it feel?
                  </p>
                </div>

              </div>

              <select
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-300 outline-none focus:border-blue-500/50"
              >
                {tones.map((item) => (
                  <option key={item}>
                    {item}
                  </option>
                ))}
              </select>

            </div>

            {/* Duration */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">

              <div className="mb-4 flex items-center gap-3">

                <Clock3
                  size={18}
                  className="text-zinc-500"
                />

                <div>
                  <h3 className="text-sm font-semibold">
                    Duration
                  </h3>

                  <p className="text-xs text-zinc-600">
                    Target video length
                  </p>
                </div>

              </div>

              <div className="flex gap-2">

                {durations.map((item) => {
                  const selected = duration === item.value

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setDuration(item.value)}
                      className={`flex-1 rounded-xl border py-3 text-sm transition ${selected
                        ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                      {item.label}
                    </button>
                  )
                })}

              </div>

            </div>

          </section>

        </div>

        {/* RIGHT */}
        <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 lg:sticky lg:top-8">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
              <Sparkles
                size={18}
                className="text-blue-400"
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold">
                Generation pipeline
              </h3>

              <p className="text-xs text-zinc-600">
                What happens next
              </p>
            </div>

          </div>

          <div className="my-6 h-px bg-zinc-800" />

          <div className="space-y-5">

            {[
              ['01', 'Understand idea'],
              ['02', 'Build story'],
              ['03', 'Plan scenes'],
              ['04', 'Generate assets'],
              ['05', 'Compose video'],
            ].map(([number, label], index) => (

              <div
                key={number}
                className="flex items-center gap-3"
              >

                <span className="font-mono text-[10px] text-zinc-700">
                  {number}
                </span>

                <div
                  className={`h-1.5 w-1.5 rounded-full ${index === 0
                    ? 'bg-blue-500'
                    : 'bg-zinc-700'
                    }`}
                />

                <span className="text-xs text-zinc-500">
                  {label}
                </span>

              </div>

            ))}

          </div>

          <div className="my-6 h-px bg-zinc-800" />
          <button
            type="button"
            disabled={!idea.trim() || generating}
            onClick={handleGenerate}
            className={`group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-medium transition ${idea.trim() && !generating
              ? 'bg-blue-600 text-white hover:bg-blue-500'
              : 'cursor-not-allowed bg-zinc-800 text-zinc-600'
              }`}
          >
            {generating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Building Blueprint...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Content
              </>
            )}
          </button>

          <p className="mt-3 text-center text-[10px] leading-4 text-zinc-700">
            Qoneqt will create a content blueprint before
            generating any media.
          </p>

        </aside>

      </div>
    </div>
  )
}

export default Create
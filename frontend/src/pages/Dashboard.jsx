import {
  ArrowUpRight,
  Clapperboard,
  Clock3,
  FolderOpen,
  Plus,
  Sparkles,
} from 'lucide-react'

const projects = [
  {
    title: '5 Surprising Facts About Space',
    type: 'Short Video',
    status: 'Published',
    date: 'Today',
  },
  {
    title: 'Future of Artificial Intelligence',
    type: 'Explainer',
    status: 'In Production',
    date: 'Yesterday',
  },
  {
    title: 'How Black Holes Work',
    type: 'Educational',
    status: 'Draft',
    date: 'Sep 30',
  },
]

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl p-8">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm text-blue-400">
            AI CONTENT ENGINE
          </p>

          <h2 className="text-3xl font-semibold tracking-tight">
            Create something worth watching.
          </h2>

          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Turn an idea into a structured story, generated scenes,
            narration and a publish-ready video.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium transition hover:bg-blue-500">
          <Plus size={18} />
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between">
            <FolderOpen size={20} className="text-zinc-500" />
            <ArrowUpRight size={16} className="text-zinc-600" />
          </div>

          <p className="mt-6 text-3xl font-semibold">
            12
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Total Projects
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between">
            <Clapperboard size={20} className="text-zinc-500" />
            <ArrowUpRight size={16} className="text-zinc-600" />
          </div>

          <p className="mt-6 text-3xl font-semibold">
            27
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Videos Generated
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between">
            <Clock3 size={20} className="text-zinc-500" />
            <Sparkles size={16} className="text-blue-500" />
          </div>

          <p className="mt-6 text-3xl font-semibold">
            8m
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Generation Time Saved
          </p>
        </div>

      </div>

      {/* Recent projects */}
      <div className="mt-10">

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Recent Projects
            </h3>

            <p className="mt-1 text-sm text-zinc-600">
              Your latest content pipeline activity.
            </p>
          </div>

          <button className="text-sm text-zinc-500 transition hover:text-white">
            View all
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className={`flex items-center justify-between px-5 py-4 transition hover:bg-zinc-900/60 ${
                index !== projects.length - 1
                  ? 'border-b border-zinc-800'
                  : ''
              }`}
            >
              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900">
                  <Clapperboard
                    size={19}
                    className="text-zinc-500"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {project.title}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    {project.type} · {project.date}
                  </p>
                </div>

              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  project.status === 'Published'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : project.status === 'In Production'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {project.status}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Dashboard

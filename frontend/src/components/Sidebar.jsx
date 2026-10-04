import {
  LayoutDashboard,
  Plus,
  FolderKanban,
  Clapperboard,
  Send,
  Settings,
  Sparkles,
} from 'lucide-react'

import { NavLink } from 'react-router-dom'

const navigation = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    label: 'Create',
    icon: Plus,
    path: '/create',
  },
  {
    label: 'Projects',
    icon: FolderKanban,
    path: '/projects',
  },
  {
    label: 'Studio',
    icon: Clapperboard,
    path: '/studio',
  },
  {
    label: 'Published',
    icon: Send,
    path: '/published',
  },
]

function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">

      {/* Brand */}
      <div className="flex h-20 items-center gap-3 border-b border-zinc-800 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
          <Sparkles size={18} />
        </div>

        <div>
          <h1 className="text-sm font-bold tracking-wide">
            QONEQT
          </h1>

          <p className="text-[10px] tracking-widest text-zinc-500">
            AI CONTENT ENGINE
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Workspace
        </p>

        {navigation.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-blue-500/10 text-white'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    className={
                      isActive
                        ? 'text-blue-400'
                        : 'text-zinc-500'
                    }
                  />

                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-zinc-800 p-3">

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
              isActive
                ? 'bg-blue-500/10 text-white'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Settings
                size={18}
                strokeWidth={1.8}
                className={
                  isActive
                    ? 'text-blue-400'
                    : 'text-zinc-500'
                }
              />

              <span>Settings</span>
            </>
          )}
        </NavLink>

        <div className="mt-3 rounded-xl bg-zinc-900 p-3">
          <p className="text-xs font-medium text-zinc-300">
            Null Fordge
          </p>

          <p className="mt-1 text-[11px] text-zinc-600">
            Hackathon Workspace
          </p>
        </div>

      </div>
    </aside>
  )
}

export default Sidebar
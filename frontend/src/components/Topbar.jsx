
import { Bell, Search } from 'lucide-react'

function Topbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-8">
      
      {/* Search */}
      <div className="flex w-80 items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5">
        <Search size={17} className="text-zinc-500" />

        <input
          type="text"
          placeholder="Search projects..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <button className="relative rounded-xl p-2.5 text-zinc-400 transition hover:bg-zinc-900 hover:text-white">
          <Bell size={19} />

          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
        </button>

        <div className="h-7 w-px bg-zinc-800" />

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">
            D
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-zinc-200">
              Daksh
            </p>

            <p className="text-[11px] text-zinc-600">
              Creator
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Topbar
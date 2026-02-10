import { NavLink, useLocation } from 'react-router-dom'
import { FolderKanban, Sparkles } from 'lucide-react'

function Sidebar() {
  const location = useLocation()
  const isProjectsActive = location.pathname.startsWith('/projects')

  return (
    <aside className="sticky top-0 h-screen w-20 shrink-0 border-r border-slate-200 bg-white/90 backdrop-blur sm:w-72">
      <div className="border-b border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-center gap-3 sm:justify-start">
          <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700">
            <Sparkles size={18} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">ClawJira</h1>
            <p className="text-xs text-slate-500">Project cockpit</p>
          </div>
        </div>
      </div>

      <nav className="p-3 sm:p-4">
        <NavLink
          to="/projects"
          className={`flex items-center justify-center gap-3 rounded-xl px-3 py-3 transition sm:justify-start sm:px-4 ${
            isProjectsActive
              ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <FolderKanban size={18} />
          <span className="hidden text-sm font-medium sm:inline">Projects</span>
        </NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar

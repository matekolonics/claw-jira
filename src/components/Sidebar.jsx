import { NavLink, useLocation } from 'react-router-dom'
import { FolderKanban, Sparkles } from 'lucide-react'

function Sidebar() {
  const location = useLocation()
  const isProjectsActive = location.pathname.startsWith('/projects')

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white/90 backdrop-blur lg:block">
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">ClawJira</h1>
            <p className="text-xs text-slate-500">Project cockpit</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <NavLink
          to="/projects"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
            isProjectsActive
              ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <FolderKanban size={18} />
          <span className="text-sm font-medium">Projects</span>
        </NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar

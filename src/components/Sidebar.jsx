import { NavLink, useLocation } from 'react-router-dom'
import { LayoutGrid, FolderKanban, Settings } from 'lucide-react'

function Sidebar() {
  const location = useLocation()
  
  const navItems = [
    { path: '/projects', label: 'Projects', icon: FolderKanban },
  ]

  const isProjectsActive = location.pathname.startsWith('/projects')

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-blue-600">ClawJira</h1>
        <p className="text-xs text-gray-500 mt-1">Project Management</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = item.path === '/projects' ? isProjectsActive : location.pathname === item.path
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
      
      <div className="p-4 border-t">
        <button className="flex items-center gap-3 px-4 py-2.5 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
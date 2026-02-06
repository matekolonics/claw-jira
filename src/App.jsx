import { useState } from 'react'

function App() {
  const [view, setView] = useState('list')

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">ClawJira</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded ${view === 'list' ? 'bg-blue-800' : 'hover:bg-blue-700'}`}
            >
              List
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`px-4 py-2 rounded ${view === 'kanban' ? 'bg-blue-800' : 'hover:bg-blue-700'}`}
            >
              Kanban
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4">
        {view === 'list' ? <ListView /> : <KanbanView />}
      </main>
    </div>
  )
}

function ListView() {
  const [projects] = useState([])
  const [loading] = useState(false)

  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Projects</h2>
      {loading ? (
        <p>Loading...</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-500">No projects found (placeholder)</p>
      ) : (
        <ul className="divide-y">
          {projects.map(p => (
            <li key={p.id} className="py-2">{p.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function KanbanView() {
  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Kanban Board (placeholder)</h2>
      <p className="text-gray-500">Drag-and-drop coming soon with react-beautiful-dnd</p>
    </div>
  )
}

export default App

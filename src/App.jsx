import { useState, useEffect } from 'react'

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
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const API_URL = '/api/projects'

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error('Failed to fetch projects')
      const data = await res.json()
      setProjects(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      setIsSubmitting(true)
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed to create project')
      const newProject = await res.json()
      setProjects(prev => [...prev, newProject])
      setFormData({ name: '', description: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete project')
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = async (id) => {
    const project = projects.find(p => p.id === id)
    const newName = prompt('Edit project name:', project?.name || '')
    if (newName === null || newName.trim() === '') return

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...project, name: newName.trim() })
      })
      if (!res.ok) throw new Error('Failed to update project')
      const updatedProject = await res.json()
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-4">
      {/* New Project Form */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Project</h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Project name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isSubmitting ? 'Adding...' : 'Add Project'}
          </button>
        </form>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b">Projects</h2>
        {loading ? (
          <p className="p-4 text-gray-500">Loading...</p>
        ) : error ? (
          <p className="p-4 text-red-500">Error: {error}</p>
        ) : projects.length === 0 ? (
          <p className="p-4 text-gray-500">No projects found. Create one above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Description</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {projects.map(project => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{project.name}</td>
                    <td className="px-4 py-3 text-gray-600">{project.description || '-'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(project.id)}
                        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function KanbanView() {
  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Kanban Board (Coming Soon)</h2>
      <p className="text-gray-500">Drag-and-drop kanban board with react-beautiful-dnd is coming soon!</p>
    </div>
  )
}

export default App
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import useSpacesStore from '../stores/useSpaces'

function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { spaces, loading, error, fetchSpaces, createSpace, updateSpace, deleteSpace } = useSpacesStore()
  const [project, setProject] = useState(null)
  const [taskCounts, setTaskCounts] = useState({})
  const [newSpaceName, setNewSpaceName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    const loadProject = async () => {
      const res = await fetch(`/api/projects/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProject(data)
      }
    }
    loadProject()
    fetchSpaces(id)
  }, [id])

  useEffect(() => {
    const loadTaskCounts = async () => {
      const counts = {}
      for (const space of spaces) {
        try {
          const res = await fetch(`/api/spaces/${space.id}/count`)
          if (res.ok) {
            const count = await res.text()
            counts[space.id] = parseInt(count, 10) || 0
          }
        } catch (err) {
          console.error('Failed to fetch task count for space', space.id, err)
        }
      }
      setTaskCounts(counts)
    }
    if (spaces.length > 0) {
      loadTaskCounts()
    }
  }, [spaces])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newSpaceName.trim()) return
    await createSpace(id, newSpaceName.trim())
    setNewSpaceName('')
  }

  const handleEdit = (space) => {
    setEditingId(space.id)
    setEditName(space.name)
  }

  const handleSave = async () => {
    if (!editName.trim()) return
    await updateSpace(id, editingId, editName.trim())
    setEditingId(null)
    setEditName('')
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditName('')
  }

  const handleDelete = async (spaceId) => {
    await deleteSpace(id, spaceId)
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/projects" className="text-blue-600 hover:underline text-sm">
            ← Back to Projects
          </Link>
          <h1 className="text-2xl font-bold mt-1">{project.name} - Spaces</h1>
          {project.description && (
            <p className="text-gray-600 mt-1">{project.description}</p>
          )}
        </div>
      </div>

      {/* Create Space Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Space</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            placeholder="Space name"
            value={newSpaceName}
            onChange={(e) => setNewSpaceName(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Space
          </button>
        </form>
      </div>

      {/* Spaces List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Spaces</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-2"></div>
            <p>Loading spaces...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>Error: {error}</p>
          </div>
        ) : spaces.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No spaces in this project yet. Create one above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Tasks</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {spaces.map(space => (
                  <tr
                    key={space.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={editingId !== space.id ? () => navigate(`/projects/${id}/spaces/${space.id}/kanban`) : undefined}
                  >
                    <td className="px-6 py-4">
                      {editingId === space.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                          className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium">{space.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{taskCounts[space.id] || 0} tasks</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {editingId === space.id ? (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSave(); }}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to={`/projects/${id}/spaces/${space.id}/kanban`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 inline-block mr-2"
                          >
                            Kanban
                          </Link>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(space); }}
                            className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(space.id); }}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </>
                      )}
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

export default ProjectDetail
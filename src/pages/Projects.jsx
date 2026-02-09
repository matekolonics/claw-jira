import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useProjectsStore from '../stores/useProjects'

function Projects() {
  const { projects, loading, error, fetchProjects, createProject, updateProject, deleteProject } = useProjectsStore()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({ name: '', description: '' })

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    await createProject(formData)
    setFormData({ name: '', description: '' })
  }

  const handleEdit = (project) => {
    setEditingId(project.id)
    setEditData({ name: project.name, description: project.description || '' })
  }

  const handleSaveEdit = async () => {
    if (!editData.name.trim()) return
    await updateProject(editingId, editData)
    setEditingId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData({ name: '', description: '' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return
    await deleteProject(id)
  }

  return (
    <div className="space-y-6">
      {/* Create Project Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Project</h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Project name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Project
          </button>
        </form>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Projects</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-2"></div>
            <p>Loading projects...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>Error: {error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No projects found. Create one above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Spaces</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Description</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map(project => (
                  <tr 
                    key={project.id} 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${editingId === project.id ? 'opacity-50' : ''}`}
                    onClick={() => !editingId && navigate(`/projects/${project.id}`)}
                  >
                    <td className="px-6 py-4">
                      {editingId === project.id ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium">{project.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                        View Spaces →
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {editingId === project.id ? (
                        <input
                          type="text"
                          value={editData.description}
                          onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        project.description || '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {editingId === project.id ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSaveEdit()
                            }}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCancelEdit()
                            }}
                            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(project)}
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

export default Projects
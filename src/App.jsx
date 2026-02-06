import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

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
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedProjects, setExpandedProjects] = useState({})
  const [newSpaceForms, setNewSpaceForms] = useState({})
  const [newTaskForms, setNewTaskForms] = useState({})

  const STATUS_COLUMNS = [
    { id: 'ToDo', title: 'To Do' },
    { id: 'InProgress', title: 'In Progress' },
    { id: 'Done', title: 'Done' }
  ]

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/projects')
      if (!res.ok) throw new Error('Failed to fetch projects')
      const data = await res.json()
      setProjects(data)
      // Auto-expand first project
      if (data.length > 0) {
        setExpandedProjects({ [data[0].id]: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSpacesForProject = async (projectId) => {
    const res = await fetch(`/api/projects/${projectId}/spaces`)
    if (!res.ok) throw new Error('Failed to fetch spaces')
    return res.json()
  }

  const fetchTasksForSpace = async (spaceId) => {
    const res = await fetch(`/api/spaces/${spaceId}/tasks`)
    if (!res.ok) throw new Error('Failed to fetch tasks')
    return res.json()
  }

  const toggleProject = async (projectId) => {
    const isExpanded = expandedProjects[projectId]
    if (isExpanded) {
      setExpandedProjects(prev => ({ ...prev, [projectId]: false }))
    } else {
      setExpandedProjects(prev => ({ ...prev, [projectId]: true }))
      // Fetch spaces for this project
      try {
        const spaces = await fetchSpacesForProject(projectId)
        setProjects(prev => prev.map(p => {
          if (p.id === projectId) {
            return { ...p, spaces: spaces }
          }
          return p
        }))
        // Initialize task fetching for each space
        for (const space of spaces) {
          const tasks = await fetchTasksForSpace(space.id)
          setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
              return {
                ...p,
                spaces: p.spaces.map(s => s.id === space.id ? { ...s, tasks } : s)
              }
            }
            return p
          }))
        }
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const handleCreateSpace = async (projectId, e) => {
    e.preventDefault()
    const formData = newSpaceForms[projectId] || { name: '' }
    if (!formData.name.trim()) return

    try {
      const res = await fetch(`/api/projects/${projectId}/spaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed to create space')
      const newSpace = await res.json()
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return { ...p, spaces: [...(p.spaces || []), newSpace] }
        }
        return p
      }))
      setNewSpaceForms(prev => ({ ...prev, [projectId]: { name: '' } }))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCreateTask = async (spaceId, projectId, e) => {
    e.preventDefault()
    const formData = newTaskForms[spaceId] || { title: '', description: '' }
    if (!formData.title.trim()) return

    try {
      const res = await fetch(`/api/spaces/${spaceId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed to create task')
      const newTask = await res.json()
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            spaces: p.spaces.map(s => s.id === spaceId ? { ...s, tasks: [...(s.tasks || []), newTask] } : s)
          }
        }
        return p
      }))
      setNewTaskForms(prev => ({ ...prev, [spaceId]: { title: '', description: '' } }))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const sourceStatus = source.droppableId
    const destStatus = destination.droppableId

    // Find the task and update locally
    let taskToMove = null
    let sourceProjectId = null
    let sourceSpaceId = null

    // Find the task in nested structure
    for (const project of projects) {
      for (const space of project.spaces || []) {
        const task = (space.tasks || []).find(t => t.id.toString() === draggableId)
        if (task) {
          taskToMove = task
          sourceProjectId = project.id
          sourceSpaceId = space.id
          break
        }
      }
      if (taskToMove) break
    }

    if (!taskToMove) return

    // Optimistic update
    setProjects(prev => prev.map(p => {
      if (p.id !== sourceProjectId) return p
      return {
        ...p,
        spaces: p.spaces.map(s => {
          if (s.id !== sourceSpaceId) return s
          const tasks = s.tasks.filter(t => t.id.toString() !== draggableId)
          return { ...s, tasks }
        })
      }
    }))

    // If moving to same project/different space, add to destination
    if (destStatus !== 'remove') {
      // Find destination space (same space or first space of project)
      let destProjectId = sourceProjectId
      let destSpaceId = sourceSpaceId

      // For now, move within same space (task stays in same space, only status changes)
      setProjects(prev => prev.map(p => {
        if (p.id !== sourceProjectId) return p
        return {
          ...p,
          spaces: p.spaces.map(s => {
            if (s.id !== sourceSpaceId) return s
            const updatedTask = { ...taskToMove, status: destStatus }
            const tasks = [...(s.tasks || [])]
            tasks.splice(destination.index, 0, updatedTask)
            return { ...s, tasks }
          })
        }
      }))
    }

    // Update backend
    try {
      const res = await fetch(`/api/tasks/${draggableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: destStatus })
      })
      if (!res.ok) {
        // Revert on error
        setProjects(prev => prev.map(p => {
          if (p.id !== sourceProjectId) return p
          return {
            ...p,
            spaces: p.spaces.map(s => {
              if (s.id !== sourceSpaceId) return s
              const tasks = [...(s.tasks || [])]
              tasks.splice(source.index, 0, taskToMove)
              return { ...s, tasks }
            })
          }
        }))
        throw new Error('Failed to update task status')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const getTasksByStatus = (space) => {
    const tasks = space.tasks || []
    const byStatus = { ToDo: [], InProgress: [], Done: [] }
    tasks.forEach(task => {
      if (byStatus[task.status]) {
        byStatus[task.status].push(task)
      } else {
        byStatus.ToDo.push(task)
      }
    })
    return byStatus
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading projects...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Kanban Board</h2>
        
        {projects.length === 0 ? (
          <div className="bg-white rounded shadow p-6">
            <p className="text-gray-500">No projects found. Create one in the List view!</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="bg-white rounded shadow overflow-hidden">
              {/* Project Header */}
              <div 
                className="p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 flex items-center justify-between"
                onClick={() => toggleProject(project.id)}
              >
                <div className="flex items-center gap-2">
                  <span className={`transform transition-transform ${expandedProjects[project.id] ? 'rotate-90' : ''}`}>
                    ▶
                  </span>
                  <h3 className="font-semibold">{project.name}</h3>
                  <span className="text-sm text-gray-500">
                    {project.spaces?.length || 0} space(s)
                  </span>
                </div>
                <span className="text-gray-400 text-sm">
                  {expandedProjects[project.id] ? 'Collapse' : 'Expand'}
                </span>
              </div>

              {/* Spaces Accordion Content */}
              {expandedProjects[project.id] && (
                <div className="p-4 space-y-6">
                  {/* Spaces List */}
                  {project.spaces?.length > 0 ? (
                    project.spaces.map(space => {
                      const tasksByStatus = getTasksByStatus(space)
                      return (
                        <div key={space.id} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-4 text-lg">{space.name}</h4>
                          
                          {/* Kanban Columns */}
                          <div className="grid grid-cols-3 gap-4">
                            {STATUS_COLUMNS.map(column => (
                              <div key={column.id} className="bg-gray-50 rounded p-3">
                                <h5 className="font-medium text-sm text-gray-600 mb-3 uppercase tracking-wide">
                                  {column.title}
                                </h5>
                                <Droppable droppableId={column.id}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className={`space-y-2 min-h-[100px] ${
                                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      {tasksByStatus[column.id]?.map((task, index) => (
                                        <Draggable 
                                          key={task.id} 
                                          draggableId={task.id.toString()}
                                          index={index}
                                        >
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className={`bg-white p-3 rounded shadow-sm border cursor-move hover:shadow-md transition-shadow ${
                                                snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400' : ''
                                              }`}
                                            >
                                              <p className="font-medium">{task.title}</p>
                                              {task.description && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                  {task.description}
                                                </p>
                                              )}
                                              <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-xs px-2 py-0.5 rounded ${
                                                  task.status === 'ToDo' ? 'bg-gray-200' :
                                                  task.status === 'InProgress' ? 'bg-yellow-100 text-yellow-800' :
                                                  'bg-green-100 text-green-800'
                                                }`}>
                                                  {task.status}
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </div>
                            ))}
                          </div>

                          {/* Add Task Form */}
                          <form 
                            onSubmit={(e) => handleCreateTask(space.id, project.id, e)}
                            className="mt-4 pt-4 border-t flex gap-2"
                          >
                            <input
                              type="text"
                              placeholder="New task title"
                              value={newTaskForms[space.id]?.title || ''}
                              onChange={(e) => setNewTaskForms(prev => ({
                                ...prev,
                                [space.id]: { 
                                  ...prev?.[space.id], 
                                  title: e.target.value 
                                }
                              }))}
                              className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Description (optional)"
                              value={newTaskForms[space.id]?.description || ''}
                              onChange={(e) => setNewTaskForms(prev => ({
                                ...prev,
                                [space.id]: { 
                                  ...prev?.[space.id], 
                                  description: e.target.value 
                                }
                              }))}
                              className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Add Task
                            </button>
                          </form>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No spaces in this project yet.</p>
                  )}

                  {/* Add Space Form */}
                  <form 
                    onSubmit={(e) => handleCreateSpace(project.id, e)}
                    className="pt-4 border-t flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="New space name"
                      value={newSpaceForms[project.id]?.name || ''}
                      onChange={(e) => setNewSpaceForms(prev => ({
                        ...prev,
                        [project.id]: { name: e.target.value }
                      }))}
                      className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Add Space
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </DragDropContext>
  )
}

export default App
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import useTasksStore from '../stores/useTasks'

const STATUS_COLUMNS = [
  { id: 'ToDo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'InProgress', title: 'In Progress', color: 'bg-yellow-50' },
  { id: 'Done', title: 'Done', color: 'bg-green-50' }
]

function SpaceKanban() {
  const { projectId, spaceId } = useParams()
  const { tasks, loading, error, fetchTasks, createTask, moveTask } = useTasksStore()
  const [space, setSpace] = useState(null)
  const [project, setProject] = useState(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')

  useEffect(() => {
    const loadData = async () => {
      const [projectRes, spaceRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/spaces/${spaceId}`)
      ])
      if (projectRes.ok) setProject(await projectRes.json())
      if (spaceRes.ok) setSpace(await spaceRes.json())
      fetchTasks(spaceId)
    }
    loadData()
  }, [projectId, spaceId])

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId) return
    
    await moveTask(draggableId, destination.droppableId)
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    await createTask(spaceId, {
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      status: 'ToDo'
    })
    setNewTaskTitle('')
    setNewTaskDesc('')
  }

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status)

  if (!project || !space) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link to="/projects" className="hover:underline">Projects</Link>
          <span>/</span>
          <Link to={`/projects/${projectId}`} className="hover:underline">{project.name}</Link>
          <span>/</span>
          <span>{space.name}</span>
        </div>
        <h1 className="text-2xl font-bold">{space.name} - Kanban Board</h1>
      </div>

      {/* Create Task Form */}
      <div className="bg-white rounded-lg shadow p-4">
        <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="New task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Task
          </button>
        </form>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">Error: {error}</div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STATUS_COLUMNS.map(column => (
              <div key={column.id} className={`${column.color} rounded-lg p-4`}>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-700">
                  {column.title}
                  <span className="ml-2 text-xs bg-white px-2 py-0.5 rounded-full">
                    {getTasksByStatus(column.id).length}
                  </span>
                </h3>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 min-h-[200px] rounded transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-100/50' : ''
                      }`}
                    >
                      {getTasksByStatus(column.id).map((task, index) => (
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
                              className={`bg-white p-3 rounded-lg shadow-sm border cursor-move transition-all ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400 rotate-2' : 'hover:shadow-md'
                              }`}
                            >
                              <p className="font-medium text-sm">{task.title}</p>
                              {task.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  task.priority === 'High' ? 'bg-red-100 text-red-700' :
                                  task.priority === 'Med' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {task.priority || 'Med'}
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
        </DragDropContext>
      )}
    </div>
  )
}

export default SpaceKanban
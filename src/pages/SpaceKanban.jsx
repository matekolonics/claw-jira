import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { LayoutGrid, ListFilter, Plus } from 'lucide-react'
import TaskEditModal from '../components/TaskEditModal'
import useTasksStore from '../stores/useTasks'

const STATUS_COLUMNS = [
  { id: 'ToDo', title: 'To Do', tone: 'bg-slate-100' },
  { id: 'InProgress', title: 'In Progress', tone: 'bg-amber-50' },
  { id: 'Done', title: 'Done', tone: 'bg-emerald-50' },
]

function Badge({ children, color = 'slate' }) {
  const map = {
    slate: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    rose: 'bg-rose-100 text-rose-700',
  }
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${map[color]}`}>{children}</span>
}

function SpaceKanban() {
  const { projectId, spaceId } = useParams()
  const { tasks, loading, error, fetchTasks, createTask, moveTask } = useTasksStore()
  const [space, setSpace] = useState(null)
  const [project, setProject] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [viewMode, setViewMode] = useState('kanban')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedTask, setSelectedTask] = useState(null)

  useEffect(() => {
    const load = async () => {
      const [projectRes, spaceRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/spaces/${spaceId}`),
      ])
      if (projectRes.ok) setProject(await projectRes.json())
      if (spaceRes.ok) setSpace(await spaceRes.json())
      fetchTasks(spaceId)
    }
    load()
  }, [projectId, spaceId])

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const byQuery = !query || t.title?.toLowerCase().includes(query.toLowerCase()) || t.description?.toLowerCase().includes(query.toLowerCase())
      const byStatus = statusFilter === 'All' || t.status === statusFilter
      return byQuery && byStatus
    })
  }, [tasks, query, statusFilter])

  const byStatus = (status) => filtered.filter((t) => t.status === status)

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    await createTask(spaceId, {
      title: title.trim(),
      description: description.trim() || null,
      status: 'ToDo',
    })
    setTitle('')
    setDescription('')
  }

  const handleDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return
    if (source.droppableId === destination.droppableId) return
    await moveTask(draggableId, destination.droppableId)
  }

  if (!project || !space) {
    return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading space…</div>
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link to="/projects" className="hover:text-slate-900">Projects</Link>
          <span>/</span>
          <Link to={`/projects/${projectId}`} className="hover:text-slate-900">{project.name}</Link>
          <span>/</span>
          <span className="text-slate-700">{space.name}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{space.name}</h1>
            <p className="text-sm text-slate-500">Manage tasks in board or list mode.</p>
          </div>
          <button
            onClick={() => setViewMode((v) => (v === 'kanban' ? 'list' : 'kanban'))}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            {viewMode === 'kanban' ? <ListFilter size={16} /> : <LayoutGrid size={16} />}
            {viewMode === 'kanban' ? 'List view' : 'Board view'}
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={handleCreateTask} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-indigo-500 focus:ring-2"
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-indigo-500 focus:ring-2"
          />
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700">
            <Plus size={16} /> Add task
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or description"
            className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-indigo-500 focus:ring-2"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-2.5"
          >
            <option value="All">All statuses</option>
            <option value="ToDo">To Do</option>
            <option value="InProgress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </section>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading tasks…</div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">Error: {error}</div>
      ) : viewMode === 'kanban' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-4 lg:grid-cols-3">
            {STATUS_COLUMNS.map((column) => (
              <div key={column.id} className={`rounded-2xl p-4 ${column.tone}`}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{column.title}</h3>
                  <Badge>{byStatus(column.id).length}</Badge>
                </div>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-40 space-y-2 rounded-xl p-1 transition ${snapshot.isDraggingOver ? 'bg-white/60' : ''}`}
                    >
                      {byStatus(column.id).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <button
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              onClick={() => setSelectedTask(task)}
                              className={`w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition ${
                                dragSnapshot.isDragging ? 'rotate-1 shadow-lg ring-2 ring-indigo-300' : 'hover:shadow'
                              }`}
                            >
                              <p className="font-medium text-slate-900">{task.title}</p>
                              {task.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{task.description}</p>}
                              <div className="mt-2 flex items-center gap-2">
                                <Badge color={task.priority === 'High' ? 'rose' : task.priority === 'Med' ? 'amber' : 'emerald'}>
                                  {task.priority || 'Med'}
                                </Badge>
                                {task.assignee && <Badge>{task.assignee}</Badge>}
                              </div>
                            </button>
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
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((task) => (
                  <tr key={task.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedTask(task)}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{task.title}</p>
                      {task.description && <p className="text-sm text-slate-500">{task.description}</p>}
                    </td>
                    <td className="px-4 py-3"><Badge>{task.status}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge color={task.priority === 'High' ? 'rose' : task.priority === 'Med' ? 'amber' : 'emerald'}>
                        {task.priority || 'Med'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{task.assignee || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{new Date(task.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTask && <TaskEditModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </div>
  )
}

export default SpaceKanban

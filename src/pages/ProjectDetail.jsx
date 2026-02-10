import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, LayoutPanelLeft, Pencil, Trash2, Plus } from 'lucide-react'
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
      if (res.ok) setProject(await res.json())
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
            const data = await res.json()
            counts[space.id] = data.count || 0
          }
        } catch {
          counts[space.id] = 0
        }
      }
      setTaskCounts(counts)
    }

    if (spaces.length > 0) loadTaskCounts()
    else setTaskCounts({})
  }, [spaces])

  if (!project) {
    return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading project…</div>
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft size={15} /> Back to projects
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{project.name}</h1>
        <p className="mt-1 text-sm text-slate-500">{project.description || 'No description yet.'}</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">New space</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!newSpaceName.trim()) return
            await createSpace(id, newSpaceName.trim())
            setNewSpaceName('')
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={newSpaceName}
            onChange={(e) => setNewSpaceName(e.target.value)}
            placeholder="Space name"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-indigo-500 focus:ring-2"
            required
          />
          <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700">
            <Plus size={16} /> Create
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold">Spaces</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading spaces…</div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">Error: {error}</div>
        ) : spaces.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No spaces yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {spaces.map((space) => {
              const isEditing = editingId === space.id
              return (
                <div key={space.id} className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center">
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        autoFocus
                      />
                    ) : (
                      <>
                        <p className="truncate text-base font-semibold text-slate-900">{space.name}</p>
                        <p className="text-sm text-slate-500">{taskCounts[space.id] || 0} tasks</p>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {!isEditing ? (
                      <>
                        <button
                          onClick={() => navigate(`/projects/${id}/spaces/${space.id}/kanban`)}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                        >
                          <LayoutPanelLeft size={16} /> Open board
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(space.id)
                            setEditName(space.name)
                          }}
                          className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50"
                          aria-label="Edit space"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this space and all tasks in it?')) return
                            await deleteSpace(id, space.id)
                          }}
                          className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                          aria-label="Delete space"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={async () => {
                            if (!editName.trim()) return
                            await updateSpace(id, space.id, editName.trim())
                            setEditingId(null)
                            setEditName('')
                          }}
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null)
                            setEditName('')
                          }}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default ProjectDetail

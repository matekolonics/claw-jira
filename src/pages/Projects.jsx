import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderOpen, Pencil, Trash2, Plus } from 'lucide-react'
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
    await createProject({
      name: formData.name.trim(),
      description: formData.description.trim() || null,
    })
    setFormData({ name: '', description: '' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all of its spaces/tasks?')) return
    await deleteProject(id)
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="mt-1 text-sm text-indigo-100">Create, organize, and jump into your delivery spaces.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">New project</h2>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            type="text"
            placeholder="Project name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-indigo-500 transition focus:ring-2"
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-indigo-500 transition focus:ring-2"
          />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700">
            <Plus size={16} /> Add
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">All projects</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading projects…</div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">Error: {error}</div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No projects yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {projects.map((project) => {
              const isEditing = editingId === project.id
              return (
                <div key={project.id} className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center">
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        <input
                          value={editData.name}
                          onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
                          className="rounded-lg border border-slate-300 px-3 py-2"
                          autoFocus
                        />
                        <input
                          value={editData.description}
                          onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))}
                          className="rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="truncate text-base font-semibold text-slate-900">{project.name}</p>
                        <p className="truncate text-sm text-slate-500">{project.description || 'No description'}</p>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {!isEditing ? (
                      <>
                        <button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                        >
                          <FolderOpen size={16} /> Open
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(project.id)
                            setEditData({ name: project.name, description: project.description || '' })
                          }}
                          className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50"
                          aria-label="Edit project"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                          aria-label="Delete project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={async () => {
                            if (!editData.name.trim()) return
                            await updateProject(project.id, {
                              name: editData.name.trim(),
                              description: editData.description.trim() || null,
                            })
                            setEditingId(null)
                          }}
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
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

export default Projects

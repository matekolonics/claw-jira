import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import toast from 'react-hot-toast'

const useProjectsStore = create(
  devtools(
    (set, get) => ({
      projects: [],
      loading: false,
      error: null,
      
      fetchProjects: async () => {
        set({ loading: true, error: null })
        try {
          const response = await fetch('/api/projects')
          if (!response.ok) throw new Error('Failed to fetch')
          const data = await response.json()
          set({ projects: data, loading: false })
        } catch (error) {
          set({ error: error.message, loading: false })
          toast.error('Failed to fetch projects')
        }
      },
      
      createProject: async (projectData) => {
        try {
          const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData),
          })
          if (!response.ok) throw new Error('Failed to create')
          const newProject = await response.json()
          set({ projects: [...get().projects, newProject] })
          toast.success('Project created')
          return newProject
        } catch (error) {
          toast.error('Failed to create project')
          throw error
        }
      },
      
      updateProject: async (id, projectData) => {
        try {
          const response = await fetch(`/api/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData),
          })
          if (!response.ok) throw new Error('Failed to update')
          const updated = await response.json()
          set({
            projects: get().projects.map(p => p.id === id ? updated : p)
          })
          toast.success('Project updated')
          return updated
        } catch (error) {
          toast.error('Failed to update project')
          throw error
        }
      },
      
      deleteProject: async (id) => {
        try {
          const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
          if (!response.ok) throw new Error('Failed to delete')
          set({ projects: get().projects.filter(p => p.id !== id) })
          toast.success('Project deleted')
        } catch (error) {
          toast.error('Failed to delete project')
          throw error
        }
      },
    }),
    { name: 'ProjectsStore' }
  )
)

export default useProjectsStore
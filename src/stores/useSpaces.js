import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import toast from 'react-hot-toast'

const useSpacesStore = create(
  devtools(
    (set, get) => ({
      spaces: [],
      currentProjectId: null,
      loading: false,
      error: null,
      
      fetchSpaces: async (projectId) => {
        set({ loading: true, error: null, currentProjectId: projectId })
        try {
          const response = await fetch(`/api/projects/${projectId}/spaces`)
          if (!response.ok) throw new Error('Failed to fetch')
          const data = await response.json()
          set({ spaces: data, loading: false })
        } catch (error) {
          set({ error: error.message, loading: false })
          toast.error('Failed to fetch spaces')
        }
      },
      
      createSpace: async (projectId, name) => {
        try {
          const response = await fetch(`/api/projects/${projectId}/spaces`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
          })
          if (!response.ok) throw new Error('Failed to create')
          const newSpace = await response.json()
          set({ spaces: [...get().spaces, newSpace] })
          toast.success('Space created')
          return newSpace
        } catch (error) {
          toast.error('Failed to create space')
          throw error
        }
      },
      
      updateSpace: async (projectId, spaceId, name) => {
        try {
          const response = await fetch(`/api/projects/${projectId}/spaces/${spaceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
          })
          if (!response.ok) throw new Error('Failed to update')
          const updated = await response.json()
          set({
            spaces: get().spaces.map(s => s.id === spaceId ? updated : s)
          })
          toast.success('Space updated')
          return updated
        } catch (error) {
          toast.error('Failed to update space')
          throw error
        }
      },
      
      deleteSpace: async (projectId, spaceId) => {
        if (!confirm('Are you sure you want to delete this space?')) return
        try {
          const response = await fetch(`/api/projects/${projectId}/spaces/${spaceId}`, {
            method: 'DELETE',
          })
          if (!response.ok) throw new Error('Failed to delete')
          set({ spaces: get().spaces.filter(s => s.id !== spaceId) })
          toast.success('Space deleted')
        } catch (error) {
          toast.error('Failed to delete space')
          throw error
        }
      },
    }),
    { name: 'SpacesStore' }
  )
)

export default useSpacesStore
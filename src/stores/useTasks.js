import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import toast from 'react-hot-toast'

const useTasksStore = create(
  devtools(
    (set, get) => ({
      tasks: [],
      currentSpaceId: null,
      loading: false,
      error: null,
      
      fetchTasks: async (spaceId) => {
        set({ loading: true, error: null, currentSpaceId: spaceId, tasks: [] })
        try {
          const response = await fetch(`/api/spaces/${spaceId}/tasks?_t=${Date.now()}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' },
          })
          if (!response.ok) throw new Error('Failed to fetch')
          const data = await response.json()
          set({ tasks: data, loading: false })
        } catch (error) {
          set({ tasks: [], error: error.message, loading: false })
          toast.error('Failed to fetch tasks')
        }
      },
      
      createTask: async (spaceId, taskData) => {
        try {
          const response = await fetch(`/api/spaces/${spaceId}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData),
          })
          if (!response.ok) throw new Error('Failed to create')
          const newTask = await response.json()
          await get().fetchTasks(spaceId)
          toast.success('Task created')
          return newTask
        } catch (error) {
          toast.error('Failed to create task')
          throw error
        }
      },
      
      updateTask: async (taskId, taskData) => {
        try {
          const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData),
          })
          if (!response.ok) throw new Error('Failed to update')
          const updated = await response.json()
          if (updated.spaceId) {
            await get().fetchTasks(updated.spaceId)
          }
          toast.success('Task updated')
          return updated
        } catch (error) {
          toast.error('Failed to update task')
          throw error
        }
      },
      
      deleteTask: async (taskId) => {
        if (!confirm('Are you sure you want to delete this task?')) return
        try {
          const currentSpaceId = get().currentSpaceId
          const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
          if (!response.ok) throw new Error('Failed to delete')
          if (currentSpaceId) {
            await get().fetchTasks(currentSpaceId)
          }
          toast.success('Task deleted')
        } catch (error) {
          toast.error('Failed to delete task')
          throw error
        }
      },
      
      moveTask: async (taskId, newStatus) => {
        const task = get().tasks.find(t => t.id === taskId)
        if (!task) return

        const currentSpaceId = get().currentSpaceId

        // Optimistic update
        set({
          tasks: get().tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
        })

        try {
          const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          })
          if (!response.ok) throw new Error('Failed to move')

          // Re-sync with server to avoid stale/local drift
          if (currentSpaceId) {
            await get().fetchTasks(currentSpaceId)
          }
          toast.success('Task moved')
        } catch (error) {
          // Revert on error
          set({ tasks: get().tasks.map(t => t.id === taskId ? task : t) })
          toast.error('Failed to move task')
          throw error
        }
      },
    }),
    { name: 'TasksStore' }
  )
)

export default useTasksStore
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import SpaceKanban from './pages/SpaceKanban'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex w-full">
          <Sidebar />
          <main className="min-h-screen min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10">
            <Routes>
              <Route path="/" element={<Navigate to="/projects" replace />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/projects/:projectId/spaces/:spaceId/kanban" element={<SpaceKanban />} />
            </Routes>
          </main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'text-sm',
            style: { borderRadius: '12px', border: '1px solid #e2e8f0' },
          }}
        />
      </div>
    </Router>
  )
}

export default App

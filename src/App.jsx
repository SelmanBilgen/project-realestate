import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from './components/ui/toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Admin from './pages/Admin'
import Login from './pages/Login'
import { useSession, useIsAdmin } from './hooks/useAuth'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { data: session, isLoading } = useSession()
  const { isAdmin } = useIsAdmin()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Projects />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <Admin />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/premium" 
                  element={
                    <ProtectedRoute>
                      <Projects />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
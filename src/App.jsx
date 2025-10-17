import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "./components/ui/toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import { useSession, useIsAdmin } from "./hooks/useAuth";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPasword";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { session, loading: isLoading } = useSession();
  const { isAdmin, isAdminLoading } = useIsAdmin();

  console.log('ProtectedRoute Debug:', {
    session: session?.user?.email,
    isLoading,
    isAdmin,
    isAdminLoading,
    requireAdmin
  });

  if (isLoading || (requireAdmin && isAdminLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    console.log('No session, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.log('Admin required but user is not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  return children;
};

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
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route path="/admin-test" element={<Admin />} />
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
  );
}

export default App;

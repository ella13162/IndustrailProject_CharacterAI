import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { AICharacterProvider } from './contexts/AICharacterContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SessionProvider } from './contexts/SessionContext';
import Navbar from './components/shared/Navbar';
import ProtectedRoute from './components/routing/ProtectedRoute';
import AdminRoute from './components/routing/AdminRoute';

// Public pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import SignUp from './pages/public/SignUp';

// Protected pages
import Dashboard from './pages/protected/Dashboard';
import Chat from './pages/protected/Chat';
import Profile from './pages/protected/Profile';
import Settings from './pages/protected/Settings';

// Admin pages
import AdminDashboard from './pages/protected/Admin/AdminDashboard';

const NavbarWrapper = () => {
  const location = useLocation();
  return location.pathname !== '/chat' ? <Navbar /> : null;
};

// Wrap protected routes with SessionProvider
const ProtectedRoutesWrapper = () => {
  return (
    <SessionProvider>
      <Outlet />
    </SessionProvider>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AdminProvider>
            <AICharacterProvider>
              <NavbarWrapper />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />

                {/* Protected routes with session management */}
                <Route element={<ProtectedRoutesWrapper />}>
                  <Route
                    path="/dashboard"
                    element={<ProtectedRoute component={Dashboard} />}
                  />
                  <Route
                    path="/chat"
                    element={<ProtectedRoute component={Chat} />}
                  />
                  <Route
                    path="/profile"
                    element={<ProtectedRoute component={Profile} />}
                  />
                  <Route
                    path="/settings"
                    element={<ProtectedRoute component={Settings} />}
                  />
                  {/* Admin routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                </Route>
              </Routes>
            </AICharacterProvider>
          </AdminProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;

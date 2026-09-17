import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage       from './pages/Homepage';
import AdminDashboard  from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import AuthModal       from './components/AuthModal';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070E1C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C', fontFamily: 'sans-serif', fontSize: 18 }}>
      ⚓ Chargement...
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const [authModal, setAuthModal] = useState(null);

  const onOpenAuth = (mode) => setAuthModal(mode);
  const onCloseAuth = () => setAuthModal(null);

  return (
    <>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/"          element={<HomePage onOpenAuth={onOpenAuth} />} />
        <Route path="/admin"     element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute roles={['client']}><ClientDashboard /></ProtectedRoute>} />
        <Route path="*"          element={<Navigate to="/" replace />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={onCloseAuth}
          onSwitchMode={(newMode) => setAuthModal(newMode)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
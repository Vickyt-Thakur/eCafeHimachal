import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ roles, children }) {
  const { user, checkingSession } = useAuth();
  if (checkingSession) return <main className="mx-auto max-w-6xl px-5 py-20 text-slate-600">Checking your session…</main>;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'PARTNER' ? '/partner/dashboard' : '/customer/dashboard'} replace />;
  return children;
}

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SuperadminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--bg-card)', borderTopColor: 'var(--accent-blue)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user || user.username !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

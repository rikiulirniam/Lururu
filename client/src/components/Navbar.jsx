import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'rgba(10, 15, 30, 0.9)', borderColor: 'var(--border-color)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            {/* <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' }}>
              L
            </div> */}
            <span className="text-xl font-bold " >
              Lururu
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: isActive('/') ? 'var(--accent-blue)' : 'var(--text-secondary)' }}
            >
              Explore
            </Link>
            {user && user.username === 'superadmin' && (
              <Link
                to="/admin"
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: isActive('/admin') ? 'var(--accent-blue)' : 'var(--text-secondary)' }}
              >
                Admin Dashboard
              </Link>
            )}
            {user && (
              <Link
                to="/dashboard"
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: isActive('/dashboard') ? 'var(--accent-blue)' : 'var(--text-secondary)' }}
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <Link to={`/users/${user._id}`} className="flex items-center gap-2 group transition-opacity hover:opacity-80">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', color: 'white' }}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium group-hover:underline" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 hover:opacity-80"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                  >
                    Keluar
                  </button>
                </div>
                <button
                  className="md:hidden p-2 rounded-lg"
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 hover:opacity-80"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', color: 'white' }}
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>

        {menuOpen && user && (
          <div className="md:hidden pb-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex flex-col gap-2 pt-3">
              <Link to="/" className="px-3 py-2 rounded-lg text-sm" style={{ color: 'var(--text-secondary)' }} onClick={() => setMenuOpen(false)}>Explore</Link>
              {user.username === 'superadmin' && (
                <Link to="/admin" className="px-3 py-2 rounded-lg text-sm" style={{ color: 'var(--text-secondary)' }} onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
              )}
              <Link to="/dashboard" className="px-3 py-2 rounded-lg text-sm" style={{ color: 'var(--text-secondary)' }} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="px-3 py-2 rounded-lg text-sm text-left" style={{ color: '#ef4444' }}>Keluar</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

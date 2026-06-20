import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function UserProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/${id}`);
      setProfile(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = {
    open: 'Terbuka untuk tim baru',
    busy: 'Sedang sibuk',
    closed: 'Tidak tersedia',
  };

  const statusColor = {
    open:   { bg: 'rgba(16,185,129,0.1)',  text: '#34d399',  dot: '#34d399' },
    busy:   { bg: 'rgba(245,158,11,0.1)',  text: '#fbbf24',  dot: '#fbbf24' },
    closed: { bg: 'rgba(239,68,68,0.1)',   text: '#f87171',  dot: '#f87171' },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent-blue)' }}></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Profil Tidak Ditemukan</h2>
          <Link to="/" className="text-sm hover:underline" style={{ color: 'var(--accent-blue)' }}>← Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  const sc = statusColor[profile.availability_status] || statusColor.closed;

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm mb-6 hover:opacity-75 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>

        {/* Kartu profil utama */}
        <div className="rounded border p-6 mb-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded flex items-center justify-center text-2xl font-bold shrink-0" style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}>
              {profile.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{profile.name}</h1>
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>@{profile.username}</p>
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded font-medium" style={{ backgroundColor: sc.bg, color: sc.text }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.dot }}></span>
                {statusLabel[profile.availability_status] || 'Tidak tersedia'}
              </span>
            </div>
          </div>
        </div>

        {/* Keahlian */}
        {profile.skills?.length > 0 && (
          <div className="rounded border p-5 mb-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Keahlian</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(s => (
                <span key={s} className="px-2.5 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {profile.portfolio_link && (
          <div className="rounded border p-5 mb-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Portfolio / GitHub</h2>
            <a
              href={profile.portfolio_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm hover:underline"
              style={{ color: 'var(--accent-blue)' }}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {profile.portfolio_link}
            </a>
          </div>
        )}

        {/* Tim yang diikuti */}
        {profile.joined_teams?.length > 0 && (
          <div className="rounded border p-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
              Tim yang Diikuti ({profile.joined_teams.length})
            </h2>
            <div className="space-y-2">
              {profile.joined_teams.map(team => {
                const teamId = team._id || team;
                const teamTitle = team.title || 'Tim';
                return (
                  <Link
                    key={teamId}
                    to={`/teams/${teamId}`}
                    className="flex items-center gap-3 p-3 rounded border hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                  >
                    <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#0d9488', color: 'white' }}>
                      {teamTitle.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{teamTitle}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

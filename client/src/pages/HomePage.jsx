import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import TeamCard from '../components/TeamCard';
import toast from 'react-hot-toast';

const CATEGORIES = ['', 'Project', 'Competitive', 'Startup', 'Study'];

export default function HomePage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('open');
  const [page, setPage] = useState(1);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (status) params.status = status;
      const { data } = await api.get('/teams', { params });
      setTeams(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat data tim');
    } finally {
      setLoading(false);
    }
  }, [search, category, status, page]);

  useEffect(() => {
    const timer = setTimeout(fetchTeams, 300);
    return () => clearTimeout(timer);
  }, [fetchTeams]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const selectStyle = {
    backgroundColor: 'var(--bg-card)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-secondary)',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="py-14 px-4 text-center border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: 'var(--accent-blue)' }}>
            Platform Matchmaking Proyek IT
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Temukan Tim Impianmu
          </h1>
          <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
            Bergabung dengan tim developer berbakat, wujudkan proyek IT yang luar biasa bersama.
          </p>
          <div className="relative max-w-xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="home-search"
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Cari tim berdasarkan nama..."
              className="w-full pl-11 pr-4 py-3 rounded border text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <select
            id="filter-category"
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded border text-sm outline-none"
            style={selectStyle}
          >
            <option value="">Semua Kategori</option>
            {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>

          <select
            id="filter-status"
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded border text-sm outline-none"
            style={selectStyle}
          >
            <option value="">Semua Status</option>
            <option value="open">Buka Rekrutmen</option>
            <option value="closed">Ditutup</option>
            <option value="full">Penuh</option>
          </select>

          {(search || category || status) && (
            <button
              onClick={() => { setSearch(''); setCategory(''); setStatus(''); setPage(1); }}
              className="px-3 py-2 rounded text-sm border hover:opacity-80 transition-opacity"
              style={{ borderColor: 'var(--border-color)', color: '#f87171' }}
            >
              Reset Filter
            </button>
          )}

          <span className="ml-auto text-sm" style={{ color: 'var(--text-muted)' }}>
            {teams.length} tim ditemukan
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded p-5 border animate-pulse" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="h-4 rounded mb-3 w-3/4" style={{ backgroundColor: 'var(--bg-primary)' }}></div>
                <div className="h-3 rounded mb-2 w-full" style={{ backgroundColor: 'var(--bg-primary)' }}></div>
                <div className="h-3 rounded w-2/3" style={{ backgroundColor: 'var(--bg-primary)' }}></div>
              </div>
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Tidak Ada Tim Ditemukan</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Coba ubah filter pencarian atau buat tim baru</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-opacity hover:opacity-85"
              style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}
            >
              Buat Tim Baru
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {teams.map(team => <TeamCard key={team._id} team={team} />)}
            </div>
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded text-sm border disabled:opacity-40 transition-opacity hover:opacity-80"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                ← Sebelumnya
              </button>
              <span className="px-4 py-2 rounded text-sm" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                Halaman {page}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={teams.length < 12}
                className="px-4 py-2 rounded text-sm border disabled:opacity-40 transition-opacity hover:opacity-80"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                Berikutnya →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

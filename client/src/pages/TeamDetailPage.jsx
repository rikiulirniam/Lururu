import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const statusConfig = {
  'open':   { label: 'Buka Rekrutmen', color: '#10b981' },
  'closed': { label: 'Ditutup',        color: '#ef4444' },
  'full':   { label: 'Tim Penuh',      color: '#f59e0b' },
};

const appStatusConfig = {
  'pending':  { label: 'Menunggu', bg: 'rgba(245,158,11,0.1)',  color: '#fbbf24' },
  'accepted': { label: 'Diterima', bg: 'rgba(16,185,129,0.1)',  color: '#34d399' },
  'rejected': { label: 'Ditolak',  bg: 'rgba(239,68,68,0.1)',  color: '#f87171' },
};

export default function TeamDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({ role_applied: '', message: '' });
  const [applying, setApplying] = useState(false);
  const [updatingApp, setUpdatingApp] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, [id]);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/teams/${id}`);
      setTeam(data);
      setEditForm({ title: data.title, objective: data.objective || '', category: data.category || '', status: data.status || 'open' });
      const leaderId = String(data.leader_id?._id || data.leader_id);
      if (leaderId === String(user._id)) {
        try {
          const appsRes = await api.get('/applications', { params: { team_id: id } });
          setApplications(appsRes.data);
        } catch { setApplications([]); }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat data tim');
    } finally {
      setLoading(false);
    }
  };

  const isLeader = team && String(team.leader_id?._id || team.leader_id) === String(user._id);
  const isMember = team?.members?.some(m => String(m._id || m) === String(user._id));

  const handleApply = async () => {
    if (!applyForm.role_applied) { toast.error('Pilih role yang ingin dilamar'); return; }
    setApplying(true);
    try {
      await api.post('/applications', { team_id: id, applicant_id: user._id, role_applied: applyForm.role_applied, message: applyForm.message, status: 'pending' });
      toast.success('Lamaran berhasil dikirim!');
      setShowApplyModal(false);
      setApplyForm({ role_applied: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim lamaran');
    } finally {
      setApplying(false);
    }
  };

  const handleUpdateApp = async (appId, newStatus) => {
    setUpdatingApp(appId);
    try {
      await api.put(`/applications/${appId}`, { status: newStatus });
      toast.success(`Lamaran ${newStatus === 'accepted' ? 'diterima' : 'ditolak'}`);
      fetchTeam();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui lamaran');
    } finally {
      setUpdatingApp(null);
    }
  };

  const handleSaveTeam = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/teams/${id}`, editForm);
      setTeam(prev => ({ ...prev, ...data }));
      setShowEditModal(false);
      toast.success('Tim berhasil diperbarui!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui tim');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm('Yakin ingin menghapus tim ini?')) return;
    try {
      await api.delete(`/teams/${id}`);
      toast.success('Tim berhasil dihapus');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus tim');
    }
  };

  const inputStyle = { backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent-blue)' }}></div>
      </div>
    );
  }

  if (!team) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="text-center">
        <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Tim Tidak Ditemukan</h2>
        <Link to="/" className="text-sm hover:underline" style={{ color: 'var(--accent-blue)' }}>← Kembali ke Beranda</Link>
      </div>
    </div>
  );

  const status = statusConfig[team.status] || statusConfig.open;
  const leader = team.leader_id;

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm mb-6 hover:opacity-75 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Kembali
        </Link>

        {/* Header tim */}
        <div className="rounded border p-6 mb-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{team.title}</h1>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }}></div>
                  <span className="text-xs" style={{ color: status.color }}>{status.label}</span>
                </div>
              </div>
              {team.category && (
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-3" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                  {team.category}
                </span>
              )}
              {team.objective && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{team.objective}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {isLeader && (
                <>
                  <button id="edit-team-btn" onClick={() => setShowEditModal(true)} className="px-3 py-1.5 rounded text-sm border transition-opacity hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                    Edit
                  </button>
                  <Link id="manage-team-btn" to={`/teams/${id}/chat`} className="px-3 py-1.5 rounded text-sm font-medium transition-opacity hover:opacity-85" style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}>
                    💬 Chat
                  </Link>
                  <button onClick={handleDeleteTeam} className="px-3 py-1.5 rounded text-sm border transition-opacity hover:opacity-80" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
                    Hapus
                  </button>
                </>
              )}
              {isMember && !isLeader && (
                <Link to={`/teams/${id}/chat`} className="px-3 py-1.5 rounded text-sm font-medium transition-opacity hover:opacity-85" style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}>
                  💬 Chat Tim
                </Link>
              )}
              {!isLeader && !isMember && team.status === 'open' && (
                <button id="apply-team-btn" onClick={() => setShowApplyModal(true)} className="px-4 py-1.5 rounded text-sm font-medium transition-opacity hover:opacity-85" style={{ backgroundColor: '#10b981', color: 'white' }}>
                  Lamar Sekarang
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Pemimpin</p>
              <Link to={`/users/${leader?._id || leader}`} className="flex items-center gap-3 p-3 rounded hover:opacity-80 transition-opacity" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="w-9 h-9 rounded flex items-center justify-center font-semibold text-sm" style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}>
                  {leader?.name?.charAt(0).toUpperCase() || 'L'}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{leader?.name || 'Unknown'}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{leader?.username || '-'}</p>
                </div>
              </Link>
            </div>

            <div>
              <p className="text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Anggota ({team.members?.length || 0})</p>
              <div className="flex flex-wrap gap-2">
                {team.members?.length ? team.members.map(m => (
                  <Link key={m._id || m} to={`/users/${m._id || m}`} className="flex items-center gap-2 px-3 py-1.5 rounded hover:opacity-80 transition-opacity" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: '#0d9488', color: 'white' }}>
                      {(m.name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{m.name || m}</span>
                  </Link>
                )) : (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Belum ada anggota</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Role yang dibutuhkan */}
        {team.roles_needed?.length > 0 && (
          <div className="rounded border p-6 mb-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Role yang Dibutuhkan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {team.roles_needed.map((r, i) => (
                <div key={i} className="p-4 rounded border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{r.role}</span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
                      Kuota: {r.quota}
                    </span>
                  </div>
                  {r.required_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {r.required_skills.map(s => (
                        <span key={s} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daftar pelamar (hanya leader) */}
        {isLeader && (
          <div className="rounded border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Daftar Pelamar ({applications.length})
            </h2>
            {applications.filter(app => app.status !== 'rejected').length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Belum ada pelamar</p>
            ) : (
              <div className="space-y-3">
                {applications.filter(app => app.status !== 'rejected').map(app => {
                  const appStatus = appStatusConfig[app.status] || appStatusConfig.pending;
                  const applicant = app.applicant_id;
                  const applicantId = applicant?._id || app.applicant_id;
                  return (
                    <div key={app._id} className="p-4 rounded border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                      {/* Baris atas: profil + status + aksi */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        {/* Info pelamar */}
                        <div className="flex items-start gap-3 flex-1">
                          <Link to={`/users/${applicantId}`} className="shrink-0">
                            <div className="w-10 h-10 rounded flex items-center justify-center font-bold text-sm hover:opacity-80 transition-opacity" style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}>
                              {(applicant?.name || '?').charAt(0).toUpperCase()}
                            </div>
                          </Link>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                              <Link to={`/users/${applicantId}`} className="text-sm font-semibold hover:underline" style={{ color: 'var(--text-primary)' }}>
                                {applicant?.name || 'Pengguna'}
                              </Link>
                              {applicant?.username && (
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>@{applicant.username}</span>
                              )}
                              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: appStatus.bg, color: appStatus.color }}>
                                {appStatus.label}
                              </span>
                            </div>
                            <p className="text-xs mb-2" style={{ color: 'var(--accent-blue)' }}>
                              Melamar sebagai: <span className="font-medium">{app.role_applied}</span>
                            </p>
                            {/* Skills pelamar */}
                            {applicant?.skills?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {applicant.skills.slice(0, 5).map(s => (
                                  <span key={s} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                                    {s}
                                  </span>
                                ))}
                                {applicant.skills.length > 5 && (
                                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>+{applicant.skills.length - 5}</span>
                                )}
                              </div>
                            )}
                            {/* Pesan lamaran */}
                            {app.message && (
                              <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>"{app.message}"</p>
                            )}
                            {/* Link portfolio */}
                            {applicant?.portfolio_link && (
                              <a href={applicant.portfolio_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs mt-1.5 hover:underline" style={{ color: 'var(--accent-blue)' }}>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                Portfolio
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Tombol aksi */}
                        {app.status === 'pending' && (
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleUpdateApp(app._id, 'accepted')}
                              disabled={updatingApp === app._id}
                              className="px-3 py-1.5 rounded text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
                              style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}
                            >
                              Terima
                            </button>
                            <button
                              onClick={() => handleUpdateApp(app._id, 'rejected')}
                              disabled={updatingApp === app._id}
                              className="px-3 py-1.5 rounded text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
                              style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
                            >
                              Tolak
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Lamar */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-md rounded border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Lamar ke Tim</h2>
              <button onClick={() => setShowApplyModal(false)} style={{ color: 'var(--text-muted)' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Role yang Dilamar *</label>
                <select id="apply-role" value={applyForm.role_applied} onChange={e => setApplyForm({ ...applyForm, role_applied: e.target.value })} className="w-full px-3 py-2.5 rounded border text-sm outline-none" style={inputStyle}>
                  <option value="">Pilih role</option>
                  {team.roles_needed?.map((r, i) => <option key={i} value={r.role}>{r.role}</option>)}
                  <option value="Other">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Pesan / Motivasi</label>
                <textarea id="apply-message" rows={4} value={applyForm.message} onChange={e => setApplyForm({ ...applyForm, message: e.target.value })} placeholder="Ceritakan mengapa Anda cocok..." className="w-full px-3 py-2.5 rounded border text-sm outline-none resize-none" style={inputStyle} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowApplyModal(false)} className="flex-1 py-2.5 rounded text-sm border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Batal</button>
              <button onClick={handleApply} disabled={applying} className="flex-1 py-2.5 rounded text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-50" style={{ backgroundColor: '#10b981', color: 'white' }}>
                {applying ? 'Mengirim...' : 'Kirim Lamaran'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Tim */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-md rounded border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Edit Tim</h2>
              <button onClick={() => setShowEditModal(false)} style={{ color: 'var(--text-muted)' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nama Tim</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-3 py-2.5 rounded border text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Deskripsi</label>
                <textarea rows={3} value={editForm.objective} onChange={e => setEditForm({ ...editForm, objective: e.target.value })} className="w-full px-3 py-2.5 rounded border text-sm outline-none resize-none" style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Kategori</label>
                  <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="w-full px-3 py-2.5 rounded border text-sm outline-none" style={inputStyle}>
                    <option value="">Pilih</option>
                    <option value="web">Web</option>
                    <option value="mobile">Mobile</option>
                    <option value="ai">AI / ML</option>
                    <option value="data">Data</option>
                    <option value="game">Game</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
                  <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-3 py-2.5 rounded border text-sm outline-none" style={inputStyle}>
                    <option value="open">Buka Rekrutmen</option>
                    <option value="closed">Ditutup</option>
                    <option value="full">Penuh</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 rounded text-sm border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Batal</button>
              <button onClick={handleSaveTeam} disabled={saving} className="flex-1 py-2.5 rounded text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-50" style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

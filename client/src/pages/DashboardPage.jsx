import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import TeamCard from '../components/TeamCard';

export default function DashboardPage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [teamForm, setTeamForm] = useState({
    title: '', objective: '', category: '', status: 'open', roles_needed: [],
  });
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [roleForm, setRoleForm] = useState({ role: '', required_skills: '', quota: 1 });

  useEffect(() => {
    if (!user?._id) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, teamsRes] = await Promise.all([
        api.get(`/users/${user._id}`),
        api.get('/teams', { params: { limit: 100 } }),
      ]);
      setProfile(userRes.data);
      const allTeams = teamsRes.data;
      const myTeams = allTeams.filter(t =>
        String(t.leader_id?._id || t.leader_id) === String(user._id) ||
        t.members?.some(m => String(m._id || m) === String(user._id))
      );
      setTeams(myTeams);
      setEditForm({
        name: userRes.data.name,
        portfolio_link: userRes.data.portfolio_link || '',
        availability_status: userRes.data.availability_status || 'open',
        skills: userRes.data.skills || [],
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/users/${user._id}`, editForm);
      updateUser(data);
      setProfile(data);
      setEditMode(false);
      toast.success('Profil berhasil diperbarui!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !editForm.skills.includes(trimmed)) {
      setEditForm({ ...editForm, skills: [...editForm.skills, trimmed] });
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => setEditForm({ ...editForm, skills: editForm.skills.filter(s => s !== skill) });

  const addRole = () => {
    if (!roleForm.role) return;
    const role = {
      role: roleForm.role,
      required_skills: roleForm.required_skills.split(',').map(s => s.trim()).filter(Boolean),
      quota: Number(roleForm.quota),
      status: 'open',
    };
    setTeamForm({ ...teamForm, roles_needed: [...teamForm.roles_needed, role] });
    setRoleForm({ role: '', required_skills: '', quota: 1 });
  };

  const handleCreateTeam = async () => {
    if (!teamForm.title) { toast.error('Judul tim wajib diisi'); return; }
    setCreatingTeam(true);
    try {
      await api.post('/teams', { ...teamForm, leader_id: user._id });
      toast.success('Tim berhasil dibuat!');
      setShowCreateModal(false);
      setTeamForm({ title: '', objective: '', category: '', status: 'open', roles_needed: [] });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat tim');
    } finally {
      setCreatingTeam(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--bg-primary)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent-blue)' }}></div>
      </div>
    );
  }

  const isLeader = (team) => String(team.leader_id?._id || team.leader_id) === String(user._id);

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Sidebar profil */}
          <div className="lg:col-span-1">
            <div className="rounded border p-6 sticky top-20" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Profil Saya</h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="text-xs px-3 py-1.5 rounded border transition-opacity hover:opacity-80"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  {editMode ? 'Batal' : 'Edit'}
                </button>
              </div>

              <div className="flex flex-col items-center mb-5">
                <div className="w-16 h-16 rounded flex items-center justify-center text-2xl font-bold mb-3" style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}>
                  {profile?.name?.charAt(0).toUpperCase()}
                </div>
                {editMode ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="text-center text-base font-semibold w-full px-3 py-1.5 rounded border text-sm outline-none"
                    style={inputStyle}
                  />
                ) : (
                  <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{profile?.name}</h3>
                )}
                <span className="text-xs mt-1 mb-2" style={{ color: 'var(--text-muted)' }}>@{profile?.username}</span>
                
                {!editMode && (
                  <Link 
                    to={`/users/${user._id}`} 
                    className="text-xs font-medium px-3 py-1 rounded border transition-opacity hover:opacity-80" 
                    style={{ borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)' }}
                  >
                    Lihat Profil Publik
                  </Link>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Status</label>
                  {editMode ? (
                    <select value={editForm.availability_status} onChange={e => setEditForm({ ...editForm, availability_status: e.target.value })} className="w-full px-3 py-2 rounded border text-sm outline-none" style={inputStyle}>
                      <option value="open">Terbuka</option>
                      <option value="busy">Sibuk</option>
                      <option value="closed">Tidak Tersedia</option>
                    </select>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded font-medium" style={{
                      backgroundColor: profile?.availability_status === 'open' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: profile?.availability_status === 'open' ? '#34d399' : '#f87171',
                    }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: profile?.availability_status === 'open' ? '#34d399' : '#f87171' }}></span>
                      {profile?.availability_status === 'open' ? 'Terbuka' : profile?.availability_status === 'busy' ? 'Sibuk' : 'Tidak Tersedia'}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Portfolio</label>
                  {editMode ? (
                    <input type="url" value={editForm.portfolio_link} onChange={e => setEditForm({ ...editForm, portfolio_link: e.target.value })} placeholder="https://github.com/..." className="w-full px-3 py-2 rounded border text-sm outline-none" style={inputStyle} />
                  ) : profile?.portfolio_link ? (
                    <a href={profile.portfolio_link} target="_blank" rel="noreferrer" className="text-xs hover:underline truncate block" style={{ color: 'var(--accent-blue)' }}>{profile.portfolio_link}</a>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Belum diisi</span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Keahlian</label>
                  {editMode ? (
                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {editForm.skills.map(s => (
                          <span key={s} className="flex items-center gap-1 px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.2)' }}>
                            {s} <button type="button" onClick={() => removeSkill(s)}>×</button>
                          </span>
                        ))}
                      </div>
                      <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }} placeholder="Tambah keahlian..." className="w-full px-3 py-2 rounded border text-xs outline-none" style={inputStyle} />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {profile?.skills?.length ? profile.skills.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.2)' }}>{s}</span>
                      )) : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Belum ada keahlian</span>}
                    </div>
                  )}
                </div>
              </div>

              {editMode && (
                <button onClick={handleSaveProfile} disabled={saving} className="w-full mt-5 py-2.5 rounded text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-50" style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}>
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              )}
            </div>
          </div>

          {/* Konten utama */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Kelola tim dan pantau aktivitas Anda</p>
              </div>
              <button
                id="create-team-btn"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-opacity hover:opacity-85"
                style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Buat Tim
              </button>
            </div>

            {teams.length === 0 ? (
              <div className="rounded border p-12 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="w-14 h-14 rounded flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Belum Ada Tim</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Buat tim baru atau jelajahi tim yang ada</p>
                <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: 'var(--accent-blue)' }}>
                  Jelajahi Tim →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Tim Saya ({teams.length})</p>
                <div className="grid gap-3">
                  {teams.map(team => (
                    <div key={team._id} className="rounded border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                      <TeamCard team={team} />
                      {isLeader(team) && (
                        <div className="flex items-center gap-2 px-4 py-2.5 border-t" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                          <Link
                            to={`/teams/${team._id}`}
                            className="px-3 py-1.5 rounded text-xs font-medium transition-opacity hover:opacity-85"
                            style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}
                          >
                            Kelola Tim
                          </Link>
                          <Link
                            to={`/teams/${team._id}/chat`}
                            className="px-3 py-1.5 rounded text-xs font-medium border transition-opacity hover:opacity-80"
                            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                          >
                            💬 Chat
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Buat Tim */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-lg rounded border p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Buat Tim Baru</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ color: 'var(--text-muted)' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nama Tim *</label>
                <input type="text" value={teamForm.title} onChange={e => setTeamForm({ ...teamForm, title: e.target.value })} placeholder="Nama tim Anda" className="w-full px-3 py-2.5 rounded border text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Deskripsi / Tujuan</label>
                <textarea rows={3} value={teamForm.objective} onChange={e => setTeamForm({ ...teamForm, objective: e.target.value })} placeholder="Deskripsikan tujuan tim..." className="w-full px-3 py-2.5 rounded border text-sm outline-none resize-none" style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Kategori</label>
                  <select value={teamForm.category} onChange={e => setTeamForm({ ...teamForm, category: e.target.value })} className="w-full px-3 py-2.5 rounded border text-sm outline-none" style={inputStyle}>
                    <option value="">Pilih kategori</option>
                    <option value="web">Web</option>
                    <option value="mobile">Mobile</option>
                    <option value="ai">AI / ML</option>
                    <option value="data">Data</option>
                    <option value="game">Game</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
                  <select value={teamForm.status} onChange={e => setTeamForm({ ...teamForm, status: e.target.value })} className="w-full px-3 py-2.5 rounded border text-sm outline-none" style={inputStyle}>
                    <option value="open">Buka Rekrutmen</option>
                    <option value="closed">Ditutup</option>
                    <option value="full">Penuh</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tambah Role yang Dibutuhkan</label>
                <div className="rounded border p-3 space-y-2" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" value={roleForm.role} onChange={e => setRoleForm({ ...roleForm, role: e.target.value })} placeholder="Nama role" className="px-2.5 py-2 rounded border text-xs outline-none" style={inputStyle} />
                    <input type="text" value={roleForm.required_skills} onChange={e => setRoleForm({ ...roleForm, required_skills: e.target.value })} placeholder="Skills (koma)" className="px-2.5 py-2 rounded border text-xs outline-none" style={inputStyle} />
                    <div className="flex gap-1.5">
                      <input type="number" min={1} value={roleForm.quota} onChange={e => setRoleForm({ ...roleForm, quota: e.target.value })} className="w-14 px-2 py-2 rounded border text-xs outline-none" style={inputStyle} />
                      <button type="button" onClick={addRole} className="flex-1 rounded text-xs font-medium transition-opacity hover:opacity-85" style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}>+</button>
                    </div>
                  </div>
                  {teamForm.roles_needed.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {teamForm.roles_needed.map((r, i) => (
                        <div key={i} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded" style={{ backgroundColor: 'var(--bg-card)' }}>
                          <span style={{ color: 'var(--text-primary)' }}>{r.role}</span>
                          <span style={{ color: 'var(--text-muted)' }}>Kuota: {r.quota}</span>
                          <button onClick={() => setTeamForm({ ...teamForm, roles_needed: teamForm.roles_needed.filter((_, idx) => idx !== i) })} style={{ color: '#f87171' }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 rounded text-sm border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Batal</button>
              <button onClick={handleCreateTeam} disabled={creatingTeam} className="flex-1 py-2.5 rounded text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-50" style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}>
                {creatingTeam ? 'Membuat...' : 'Buat Tim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

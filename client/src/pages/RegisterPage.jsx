import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const SKILLS_SUGGESTIONS = ['React', 'Vue', 'Angular', 'Node.js', 'Express', 'Python', 'Django', 'Flutter', 'Kotlin', 'Swift', 'MongoDB', 'PostgreSQL', 'MySQL', 'Docker', 'Kubernetes', 'Machine Learning', 'UI/UX Design', 'Figma'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    portfolio_link: '',
    availability_status: 'open',
    skills: [],
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm({ ...form, skills: [...form.skills, trimmed] });
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => setForm({ ...form, skills: form.skills.filter(s => s !== skill) });

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.password) {
      toast.error('Nama, username, dan password wajib diisi');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Registrasi berhasil! Silakan masuk.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--bg-primary)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">

          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Buat Akun Baru</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Bergabung dengan komunitas developer Lururu</p>
        </div>

        <div className="rounded border p-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Nama Lengkap *</label>
                <input
                  id="register-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nama Anda"
                  className="w-full px-4 py-2.5 rounded border text-sm outline-none transition-colors"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Username *</label>
                <input
                  id="register-username"
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="username_anda"
                  className="w-full px-4 py-2.5 rounded border text-sm outline-none transition-colors"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password *</label>
              <input
                id="register-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Buat password yang kuat"
                className="w-full px-4 py-2.5 rounded border text-sm outline-none transition-colors"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Portfolio / GitHub URL</label>
              <input
                id="register-portfolio"
                type="url"
                name="portfolio_link"
                value={form.portfolio_link}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full px-4 py-2.5 rounded border text-sm outline-none transition-colors"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Status Ketersediaan</label>
              <select
                id="register-availability"
                name="availability_status"
                value={form.availability_status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded border text-sm outline-none transition-colors"
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="open">Terbuka untuk tim baru</option>
                <option value="busy">Sedang sibuk</option>
                <option value="closed">Tidak tersedia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Keahlian (tekan Enter untuk menambah)</label>
              <div className="rounded border p-3" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.skills.map(skill => (
                    <span key={skill} className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(59,130,246,0.12)', color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.25)' }}>
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:opacity-60 transition-opacity">×</button>
                    </span>
                  ))}
                </div>
                <input
                  id="register-skill-input"
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Tambah keahlian..."
                  className="w-full text-sm outline-none bg-transparent"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SKILLS_SUGGESTIONS.filter(s => !form.skills.includes(s)).slice(0, 8).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSkill(s)}
                    className="px-2 py-0.5 rounded text-xs border hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded font-semibold text-sm transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses...
                </span>
              ) : 'Buat Akun'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Sudah punya akun?{' '}
            <Link to="/login" className="font-medium hover:underline" style={{ color: 'var(--accent-blue)' }}>
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

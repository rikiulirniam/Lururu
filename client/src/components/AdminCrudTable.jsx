import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const SCHEMAS = {
  users: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'username', label: 'Username', type: 'text' },
    { key: 'password', label: 'Password', type: 'text' },
    { key: 'skills', label: 'Skills', type: 'string_array' },
    { key: 'portfolio_link', label: 'Portfolio Link', type: 'text' },
    { key: 'availability_status', label: 'Availability', type: 'select', options: ['open', 'closed'] },
    { key: 'joined_teams', label: 'Joined Teams', type: 'teams_multi_select' },
  ],
  teams: [
    { key: 'leader_id', label: 'Leader', type: 'user_select' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'objective', label: 'Objective', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ['open', 'closed', 'full'] },
    { key: 'last_message', label: 'Last Message', type: 'text' },
    { key: 'members', label: 'Members', type: 'users_multi_select' },
    { key: 'roles_needed', label: 'Roles Needed', type: 'roles_needed_array' },
  ],
  applications: [
    { key: 'team_id', label: 'Team', type: 'team_select' },
    { key: 'applicant_id', label: 'Applicant', type: 'user_select' },
    { key: 'role_applied', label: 'Role Applied', type: 'text' },
    { key: 'message', label: 'Message', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ['pending', 'accepted', 'rejected'] },
  ],
  messages: [
    { key: 'team_id', label: 'Team', type: 'team_select' },
    { key: 'sender_id', label: 'Sender', type: 'user_select' },
    { key: 'message_text', label: 'Message Text', type: 'text' },
    { key: 'attachments', label: 'Attachments', type: 'attachments_array' },
  ]
};

export default function AdminCrudTable({ collectionName, endpoint }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // Dictionaries for relations
  const [usersList, setUsersList] = useState([]);
  const [teamsList, setTeamsList] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const schema = SCHEMAS[endpoint] || [];

  useEffect(() => {
    fetchDictionaries();
  }, [token]);

  useEffect(() => {
    fetchData();
    setCurrentPage(1); // Reset page on tab change
  }, [endpoint]);

  const fetchDictionaries = async () => {
    try {
      const [resUsers, resTeams] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_URL}/teams`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (resUsers.ok) setUsersList(await resUsers.json());
      if (resTeams.ok) setTeamsList(await resTeams.json());
    } catch (e) {
      console.error('Failed to fetch dictionaries', e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      setData(json);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (id) => {
    if (typeof id === 'object' && id !== null && id.name) return id.name;
    const userId = typeof id === 'object' && id !== null ? id._id : id;
    const user = usersList.find(u => u._id === userId || u._id?.toString() === userId?.toString());
    return user ? user.name : userId;
  };

  const getTeamTitle = (id) => {
    if (typeof id === 'object' && id !== null && id.title) return id.title;
    const teamId = typeof id === 'object' && id !== null ? id._id : id;
    const team = teamsList.find(t => t._id === teamId || t._id?.toString() === teamId?.toString());
    return team ? team.title : teamId;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus item ini?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Berhasil dihapus');
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    const initialData = {};

    schema.forEach(field => {
      if (item) {
        let val = item[field.key] !== undefined && item[field.key] !== null ? item[field.key] : '';
        // If it's a populated object (like applicant_id or sender_id), extract its _id
        if (typeof val === 'object' && val !== null && !Array.isArray(val) && val._id) {
          val = val._id;
        }
        initialData[field.key] = val;
        // Ensure arrays are arrays
        if (field.type.includes('array') || field.type.includes('multi_select')) {
          initialData[field.key] = Array.isArray(item[field.key]) ? [...item[field.key]] : [];
        }
      } else {
        if (field.type.includes('array') || field.type.includes('multi_select')) {
          initialData[field.key] = [];
        } else if (field.type === 'select') {
          initialData[field.key] = field.options[0];
        } else if (field.type === 'user_select' && usersList.length > 0) {
          initialData[field.key] = usersList[0]._id;
        } else if (field.type === 'team_select' && teamsList.length > 0) {
          initialData[field.key] = teamsList[0]._id;
        } else {
          initialData[field.key] = '';
        }
      }
    });

    if (item && endpoint === 'users') {
      initialData['password'] = '';
    }

    setFormData(initialData);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData };

      // Remove empty password field on edit
      if (schema.find(f => f.key === 'password') && !payload.password && editingItem) {
        delete payload.password;
      }

      const url = editingItem
        ? `${import.meta.env.VITE_API_URL}/${endpoint}/${editingItem._id}`
        : `${import.meta.env.VITE_API_URL}/${endpoint}`;

      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save');
      }

      toast.success('Berhasil disimpan');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderTableCell = (item, field) => {
    const value = item[field.key];
    if (value === undefined || value === null || value === '') return '-';

    if (field.type === 'user_select') return getUserName(value);
    if (field.type === 'team_select') return getTeamTitle(value);

    if (field.type === 'users_multi_select') {
      return (value || []).map(id => getUserName(id)).join(', ');
    }
    if (field.type === 'teams_multi_select') {
      return (value || []).map(id => getTeamTitle(id)).join(', ');
    }

    if (field.type === 'string_array') {
      return (value || []).join(', ');
    }

    if (field.type === 'roles_needed_array') {
      return (value || []).map(r => `${r.role} (${r.quota})`).join(', ');
    }

    if (field.type === 'attachments_array') {
      return (value || []).map(a => a.file_type).join(', ');
    }

    if (typeof value === 'object') return JSON.stringify(value);

    return String(value);
  };

  // Input Renderers
  const handleArrayChange = (key, index, newValue) => {
    const arr = [...formData[key]];
    arr[index] = newValue;
    setFormData({ ...formData, [key]: arr });
  };

  const handleArrayAdd = (key, emptyItem) => {
    setFormData({ ...formData, [key]: [...(formData[key] || []), emptyItem] });
  };

  const handleArrayRemove = (key, index) => {
    const arr = [...formData[key]];
    arr.splice(index, 1);
    setFormData({ ...formData, [key]: arr });
  };

  const handleNestedChange = (key, index, fieldKey, newValue) => {
    const arr = [...formData[key]];
    arr[index] = { ...arr[index], [fieldKey]: newValue };
    setFormData({ ...formData, [key]: arr });
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Memuat data {collectionName}...</div>;

  return (
    <div className="admin-crud-table" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 'bold' }}>{collectionName}</h2>
        <button
          onClick={() => handleOpenModal()}
          style={{ background: 'var(--accent-blue)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '500' }}
        >
          + Tambah {collectionName}
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', color: 'var(--text-primary)', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
              <th style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>No</th>
              {/* Note: ID column is intentionally removed from table display as per request */}
              {schema.filter(f => !f.hideInTable).map(field => (
                <th key={field.key} style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>{field.label}</th>
              ))}
              <th style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>Created At</th>
              <th style={{ padding: '0.75rem', whiteSpace: 'nowrap', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                {schema.filter(f => !f.hideInTable).map(field => (
                  <td key={field.key} style={{ padding: '0.75rem', fontSize: '0.875rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {renderTableCell(item, field)}
                  </td>
                ))}
                <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {new Date(item.createdAt).toLocaleDateString('id-ID')}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button onClick={() => handleOpenModal(item)} style={{ color: 'var(--accent-blue)', marginRight: '1rem', fontSize: '0.875rem' }}>Edit</button>
                  <button onClick={() => handleDelete(item._id)} style={{ color: '#ef4444', fontSize: '0.875rem' }}>Hapus</button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={schema.length + 3} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada data.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)',
                background: currentPage === 1 ? 'transparent' : 'var(--bg-primary)',
                color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)',
                opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Prev
            </button>
            <button
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)',
                background: currentPage === totalPages ? 'transparent' : 'var(--bg-primary)',
                color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-primary)',
                opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px',
            width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
              {editingItem ? 'Edit' : 'Tambah'} {collectionName}
            </h3>

            <div className="flex flex-col gap-4 mb-6">
              {schema.map(field => {
                const value = formData[field.key];
                return (
                  <div key={field.key} className="flex flex-col gap-2">
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>{field.label}</label>

                    {/* Simple text input */}
                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        style={{
                          width: '100%', background: 'var(--bg-primary)', color: 'var(--text-primary)',
                          padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none'
                        }}
                      />
                    )}

                    {/* Standard Select */}
                    {field.type === 'select' && (
                      <select
                        value={value || field.options[0]}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        style={{
                          width: '100%', background: 'var(--bg-primary)', color: 'var(--text-primary)',
                          padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none'
                        }}
                      >
                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )}

                    {/* User / Team Select (Single) */}
                    {field.type === 'user_select' && (
                      <select
                        value={value || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        style={{ width: '100%', background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                      >
                        <option value="">-- Pilih User --</option>
                        {usersList.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                      </select>
                    )}
                    {field.type === 'team_select' && (
                      <select
                        value={value || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        style={{ width: '100%', background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                      >
                        <option value="">-- Pilih Team --</option>
                        {teamsList.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                      </select>
                    )}

                    {/* String Array (e.g. skills) */}
                    {field.type === 'string_array' && (
                      <div className="flex flex-col gap-2 p-3 rounded-lg border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
                        {(value || []).map((str, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text" value={str} onChange={(e) => handleArrayChange(field.key, idx, e.target.value)}
                              style={{ flex: 1, background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                            />
                            <button onClick={() => handleArrayRemove(field.key, idx)} style={{ color: '#ef4444' }}>Hapus</button>
                          </div>
                        ))}
                        <button onClick={() => handleArrayAdd(field.key, '')} style={{ color: 'var(--accent-blue)', alignSelf: 'flex-start', fontSize: '0.875rem' }}>+ Tambah {field.label}</button>
                      </div>
                    )}

                    {/* Users / Teams Multi Select */}
                    {(field.type === 'users_multi_select' || field.type === 'teams_multi_select') && (
                      <div className="flex flex-col gap-2 p-3 rounded-lg border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
                        {(value || []).map((id, idx) => (
                          <div key={idx} className="flex gap-2">
                            <select
                              value={id} onChange={(e) => handleArrayChange(field.key, idx, e.target.value)}
                              style={{ flex: 1, background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                            >
                              <option value="">-- Pilih --</option>
                              {field.type === 'users_multi_select'
                                ? usersList.map(u => <option key={u._id} value={u._id}>{u.name}</option>)
                                : teamsList.map(t => <option key={t._id} value={t._id}>{t.title}</option>)
                              }
                            </select>
                            <button onClick={() => handleArrayRemove(field.key, idx)} style={{ color: '#ef4444' }}>Hapus</button>
                          </div>
                        ))}
                        <button onClick={() => handleArrayAdd(field.key, '')} style={{ color: 'var(--accent-blue)', alignSelf: 'flex-start', fontSize: '0.875rem' }}>+ Tambah Relasi</button>
                      </div>
                    )}

                    {/* Roles Needed Array */}
                    {field.type === 'roles_needed_array' && (
                      <div className="flex flex-col gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
                        {(value || []).map((roleItem, idx) => (
                          <div key={idx} className="flex flex-col gap-2 p-3 rounded-lg border border-dashed" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="flex justify-between">
                              <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Role #{idx + 1}</span>
                              <button onClick={() => handleArrayRemove(field.key, idx)} style={{ color: '#ef4444', fontSize: '0.875rem' }}>Hapus Role</button>
                            </div>
                            <input type="text" placeholder="Role Name" value={roleItem.role || ''} onChange={(e) => handleNestedChange(field.key, idx, 'role', e.target.value)} style={{ width: '100%', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                            <input type="text" placeholder="Required Skills (comma separated)" value={(roleItem.required_skills || []).join(', ')} onChange={(e) => handleNestedChange(field.key, idx, 'required_skills', e.target.value.split(',').map(s => s.trim()))} style={{ width: '100%', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                            <div className="flex gap-2">
                              <input type="number" placeholder="Quota" value={roleItem.quota || 0} onChange={(e) => handleNestedChange(field.key, idx, 'quota', Number(e.target.value))} style={{ flex: 1, background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                              <select value={roleItem.status || 'open'} onChange={(e) => handleNestedChange(field.key, idx, 'status', e.target.value)} style={{ flex: 1, background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                              </select>
                            </div>
                          </div>
                        ))}
                        <button onClick={() => handleArrayAdd(field.key, { role: '', required_skills: [], quota: 1, status: 'open' })} style={{ color: 'var(--accent-blue)', alignSelf: 'flex-start', fontSize: '0.875rem' }}>+ Tambah Role</button>
                      </div>
                    )}

                    {/* Attachments Array */}
                    {field.type === 'attachments_array' && (
                      <div className="flex flex-col gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
                        {(value || []).map((attItem, idx) => (
                          <div key={idx} className="flex flex-col gap-2 p-3 rounded-lg border border-dashed" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="flex justify-between">
                              <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Attachment #{idx + 1}</span>
                              <button onClick={() => handleArrayRemove(field.key, idx)} style={{ color: '#ef4444', fontSize: '0.875rem' }}>Hapus</button>
                            </div>
                            <input type="text" placeholder="File URL" value={attItem.file_url || ''} onChange={(e) => handleNestedChange(field.key, idx, 'file_url', e.target.value)} style={{ width: '100%', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                            <input type="text" placeholder="File Type (e.g. pdf, image)" value={attItem.file_type || ''} onChange={(e) => handleNestedChange(field.key, idx, 'file_type', e.target.value)} style={{ width: '100%', background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                          </div>
                        ))}
                        <button onClick={() => handleArrayAdd(field.key, { file_url: '', file_type: '' })} style={{ color: 'var(--accent-blue)', alignSelf: 'flex-start', fontSize: '0.875rem' }}>+ Tambah Attachment</button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                style={{ background: 'var(--accent-blue)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '8px', fontWeight: '600' }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

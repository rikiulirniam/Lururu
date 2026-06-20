import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const POLL_INTERVAL = 5000;

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hari ini';
  if (d.toDateString() === yesterday.toDateString()) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function groupMessagesByDate(messages) {
  const groups = {};
  messages.forEach(msg => {
    const dateKey = formatDate(msg.createdAt);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
  });
  return groups;
}

export default function ChatPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    initialize();
    return () => clearInterval(pollingRef.current);
  }, [id]);

  const initialize = async () => {
    setLoading(true);
    try {
      const teamRes = await api.get(`/teams/${id}`);
      setTeam(teamRes.data);
      const isMemberOrLeader =
        String(teamRes.data.leader_id?._id || teamRes.data.leader_id) === String(user._id) ||
        teamRes.data.members?.some(m => String(m._id || m) === String(user._id));
      if (!isMemberOrLeader) {
        toast.error('Anda tidak memiliki akses ke ruang obrolan ini');
        navigate(`/teams/${id}`);
        return;
      }
      await fetchMessages();
      pollingRef.current = setInterval(fetchMessages, POLL_INTERVAL);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat chat');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await api.get('/messages', { params: { team_id: id, limit: 100 } });
      setMessages(data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error('Gagal memuat pesan:', err);
    }
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }
    setPendingAttachment(null);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const { data } = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPendingAttachment({ file_url: data.file_url, file_type: data.file_type });
      toast.success('File berhasil diunggah!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengunggah file');
      setSelectedFile(null);
      setUploadPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadPreview(null);
    setPendingAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && !pendingAttachment) return;
    setSending(true);
    try {
      const payload = {
        team_id: id,
        sender_id: user._id,
        message_text: messageText.trim(),
        attachments: pendingAttachment ? [pendingAttachment] : [],
      };
      await api.post('/messages', payload);
      setMessageText('');
      clearFile();
      await fetchMessages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isImage = (fileType, fileUrl) => {
    const types = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (fileType && types.includes(fileType.toLowerCase())) return true;
    if (fileUrl) {
      const ext = fileUrl.split('.').pop()?.split('?')[0]?.toLowerCase();
      return types.includes(ext);
    }
    return false;
  };

  const toRelativeUrl = (url) => {
    if (!url) return url;
    try {
      const parsed = new URL(url);
      return parsed.pathname + parsed.search;
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent-blue)' }}></div>
      </div>
    );
  }

  const grouped = groupMessagesByDate(messages);

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <Link to={`/teams/${id}`} className="p-1 rounded hover:opacity-75 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center font-semibold text-sm" style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}>
            {team?.title?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{team?.title}</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{(team?.members?.length || 0) + 1} anggota</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Live</span>
        </div>
      </div>

      {/* Pesan */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {Object.keys(grouped).length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-14 h-14 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--bg-card)' }}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Belum ada pesan. Mulai percakapan!</p>
          </div>
        )}
        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }}></div>
              <span className="text-xs px-3 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>{date}</span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }}></div>
            </div>
            <div className="space-y-3">
              {msgs.map(msg => {
                const senderId = msg.sender_id?._id || msg.sender_id;
                const isMe = String(senderId) === String(user._id);
                const senderName = msg.sender_id?.name || (isMe ? user.name : '?');
                return (
                  <div key={msg._id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Link to={`/users/${senderId}`} title={senderName} className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0 hover:opacity-80 transition-opacity" style={{ backgroundColor: isMe ? 'var(--accent-blue)' : '#0d9488', color: 'white' }}>
                      {senderName.charAt(0).toUpperCase()}
                    </Link>
                    <div className={`max-w-xs sm:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {msg.message_text && (
                        <div
                          className="px-4 py-2.5 text-sm"
                          style={{
                            backgroundColor: isMe ? 'var(--accent-blue)' : 'var(--bg-card)',
                            color: isMe ? 'white' : 'var(--text-primary)',
                            borderRadius: isMe ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                          }}
                        >
                          {msg.message_text}
                        </div>
                      )}
                      {msg.attachments?.map((att, i) => (
                        <div key={i} className="rounded overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
                          {isImage(att.file_type, att.file_url) ? (
                            <a href={toRelativeUrl(att.file_url)} target="_blank" rel="noreferrer">
                              <img
                                src={toRelativeUrl(att.file_url)}
                                alt="attachment"
                                className="max-w-xs max-h-60 object-cover"
                                onError={e => { e.target.style.display = 'none'; }}
                              />
                            </a>
                          ) : (
                            <a href={toRelativeUrl(att.file_url)} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-3 text-sm hover:opacity-80 transition-opacity" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent-blue)' }}>
                              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              <span className="truncate max-w-xs">File .{att.file_type}</span>
                            </a>
                          )}
                        </div>
                      ))}
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        {selectedFile && (
          <div className="mb-3 p-3 rounded border flex items-center justify-between gap-3" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {uploadPreview ? (
                <img src={uploadPreview} alt="preview" className="w-10 h-10 rounded object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{selectedFile.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!pendingAttachment ? (
                <button
                  id="upload-file-btn"
                  onClick={handleUploadFile}
                  disabled={uploading}
                  className="px-3 py-1.5 rounded text-xs font-medium transition-opacity hover:opacity-85 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}
                >
                  {uploading ? (
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                      Mengunggah...
                    </span>
                  ) : 'Unggah'}
                </button>
              ) : (
                <span className="text-xs flex items-center gap-1" style={{ color: '#34d399' }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Siap dikirim
                </span>
              )}
              <button onClick={clearFile} className="w-6 h-6 flex items-center justify-center rounded hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end gap-2">
          <input ref={fileInputRef} id="chat-file-input" type="file" accept="image/jpeg,image/png,application/pdf,application/zip" onChange={handleFileChange} className="hidden" />
          <button
            id="chat-attach-btn"
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded flex items-center justify-center border transition-opacity hover:opacity-80 shrink-0"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <textarea
            id="chat-message-input"
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan... (Enter kirim, Shift+Enter baris baru)"
            rows={1}
            className="flex-1 px-4 py-2.5 rounded border text-sm outline-none resize-none transition-colors"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              maxHeight: '120px',
              overflowY: 'auto',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />

          <button
            id="chat-send-btn"
            onClick={handleSendMessage}
            disabled={sending || (!messageText.trim() && !pendingAttachment)}
            className="w-9 h-9 rounded flex items-center justify-center transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            style={{ backgroundColor: 'var(--accent-blue)' }}
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>Format: JPG, PNG, PDF, ZIP · Maks. 5MB</p>
      </div>
    </div>
  );
}

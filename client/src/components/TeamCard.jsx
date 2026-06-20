import { Link } from 'react-router-dom';

const categoryColors = {
  'web':    { bg: 'rgba(59,130,246,0.1)',  text: '#60a5fa', border: 'rgba(59,130,246,0.2)' },
  'mobile': { bg: 'rgba(139,92,246,0.1)',  text: '#a78bfa', border: 'rgba(139,92,246,0.2)' },
  'ai':     { bg: 'rgba(6,182,212,0.1)',   text: '#22d3ee', border: 'rgba(6,182,212,0.2)' },
  'data':   { bg: 'rgba(16,185,129,0.1)',  text: '#34d399', border: 'rgba(16,185,129,0.2)' },
  'game':   { bg: 'rgba(245,158,11,0.1)',  text: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
  'default':{ bg: 'rgba(100,116,139,0.1)', text: '#94a3b8', border: 'rgba(100,116,139,0.2)' },
};

function getCategoryStyle(category) {
  const key = category?.toLowerCase() || 'default';
  return categoryColors[key] || categoryColors.default;
}

const statusConfig = {
  'open':   { label: 'Buka Rekrutmen', color: '#10b981' },
  'closed': { label: 'Ditutup',        color: '#ef4444' },
  'full':   { label: 'Tim Penuh',      color: '#f59e0b' },
};

export default function TeamCard({ team }) {
  const catStyle = getCategoryStyle(team.category);
  const status = statusConfig[team.status] || statusConfig['open'];

  return (
    <Link to={`/teams/${team._id}`} className="block group">
      <div
        className="rounded p-5 border h-full transition-colors duration-200"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-semibold leading-tight group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
            {team.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }}></div>
            <span className="text-xs" style={{ color: status.color }}>{status.label}</span>
          </div>
        </div>

        {team.objective && (
          <p className="text-xs mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {team.objective}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto">
          {team.category ? (
            <span
              className="px-2 py-0.5 rounded text-xs font-medium border"
              style={{ backgroundColor: catStyle.bg, color: catStyle.text, borderColor: catStyle.border }}
            >
              {team.category}
            </span>
          ) : <span />}
          <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs">{team.members?.length || 0}</span>
          </div>
        </div>

        {team.roles_needed?.length > 0 && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex flex-wrap gap-1.5">
              {team.roles_needed.slice(0, 3).map((r, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                  {r.role}
                </span>
              ))}
              {team.roles_needed.length > 3 && (
                <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                  +{team.roles_needed.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

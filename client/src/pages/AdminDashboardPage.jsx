import { useState } from 'react';
import AdminCrudTable from '../components/AdminCrudTable';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'Users', endpoint: 'users' },
    { id: 'teams', label: 'Teams', endpoint: 'teams' },
    { id: 'applications', label: 'Applications', endpoint: 'applications' },
    { id: 'messages', label: 'Messages', endpoint: 'messages' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Superadmin Dashboard</h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Manage all collections in the database.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.5rem',
              color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
              fontWeight: activeTab === tab.id ? '600' : '400',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tabs.map((tab) => (
          activeTab === tab.id && (
            <AdminCrudTable 
              key={tab.id} 
              collectionName={tab.label} 
              endpoint={tab.endpoint} 
            />
          )
        ))}
      </div>
    </div>
  );
}

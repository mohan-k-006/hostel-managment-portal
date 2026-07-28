import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  AlertCircle, 
  Users, 
  CreditCard, 
  Bell, 
  FileText,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rooms', label: 'Room Allotment', icon: Building2 },
    { id: 'complaints', label: 'Complaints', icon: AlertCircle },
    { id: 'visitors', label: 'Visitor Logs', icon: Users },
    { id: 'fees', label: 'Fees & Payments', icon: CreditCard },
    { id: 'notices', label: 'Notice Board', icon: Bell },
    { id: 'reports', label: 'Reports & Export', icon: FileText }
  ];

  return (
    <aside className="sidebar">
      {/* Portal Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--bg-card-border)' }}>
        <div style={{ background: 'var(--accent-gradient)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', display: 'flex' }}>
          <Building2 size={22} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Campus Hostel
          </h1>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            ADMIN PORTAL PRJ-051
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: isActive ? 'var(--accent-gradient)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? 'var(--shadow-glow)' : 'none'
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Helper Banner Footer */}
      <div className="glass-card" style={{ padding: '1rem', marginTop: 'auto', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <Sparkles size={16} color="#8b5cf6" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa' }}>
            Smart Helper
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
          {isAdmin ? "Auto Room Allocation & Complaint Priority Triage active." : "Smart auto-triage enabled for maintenance requests."}
        </p>
      </div>
    </aside>
  );
};

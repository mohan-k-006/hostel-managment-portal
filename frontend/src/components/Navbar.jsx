import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, Bell, Building2 } from 'lucide-react';

export const Navbar = ({ activeTab }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'capitalize' }}>
          {activeTab}
        </h2>
        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
          Campus Block A & B
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Role Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--bg-card-border)' }}>
          {isAdmin ? (
            <Shield size={16} color="#8b5cf6" />
          ) : (
            <User size={16} color="#10b981" />
          )}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {user?.full_name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {user?.role}
            </div>
          </div>
        </div>

        {/* Quick Logout */}
        <button 
          onClick={logout}
          className="btn btn-secondary btn-sm"
          title="Sign out of portal"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

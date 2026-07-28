import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Shield, User, KeyRound, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const Login = () => {
  const { login, quickLogin, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
  };

  const handleQuick = async (role) => {
    setError('');
    try {
      await quickLogin(role);
    } catch (err) {
      setError(err.message || 'Quick login failed');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #1e1b4b 0%, #0f172a 60%)',
      padding: '1.5rem'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            background: 'var(--accent-gradient)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-glow)',
            marginBottom: '1rem'
          }}>
            <Building2 size={36} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            Campus Hostel Portal
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Full-Stack Admin & Student Management System
          </p>
        </div>

        {/* Card Box */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          
          {/* Quick Demo Switcher */}
          <div style={{ marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--bg-card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase' }}>
              <Sparkles size={14} /> Quick Demo One-Click Login
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <button 
                type="button" 
                onClick={() => handleQuick('admin')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'center' }}
              >
                <Shield size={14} color="#8b5cf6" />
                <span>Warden / Admin</span>
              </button>

              <button 
                type="button" 
                onClick={() => handleQuick('student')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'center' }}
              >
                <User size={14} color="#10b981" />
                <span>Student</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '1.2rem 0', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--bg-card-border)' }} />
            <span>OR SIGN IN MANUALLY</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--bg-card-border)' }} />
          </div>

          {error && (
            <div style={{ 
              background: 'var(--color-danger-bg)', 
              color: '#fca5a5', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              padding: '0.7rem 1rem', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="email"
                  required
                  className="form-control"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="admin@hostel.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="password"
                  required
                  className="form-control"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
              disabled={loading}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '1.5rem' }}>
          PRJ-051 Hostel Management Portal • Built with FastAPI & React
        </p>

      </div>
    </div>
  );
};

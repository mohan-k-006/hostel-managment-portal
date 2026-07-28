import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { StatsCard } from '../components/StatsCard';
import { SmartAllocatorModal } from '../components/SmartAllocatorModal';
import { 
  Building2, 
  AlertCircle, 
  Users, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight,
  Bell
} from 'lucide-react';

export const Dashboard = ({ setActiveTab }) => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSmartModal, setShowSmartModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsData, noticeData] = await Promise.all([
        fetchApi('/analytics/dashboard'),
        fetchApi('/notices')
      ]);
      setStats(analyticsData);
      setNotices(noticeData);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading analytics dashboard...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Welcome Banner */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Welcome back, {user?.full_name}! 👋
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {isAdmin ? "Warden Overview: Hostel Occupancy, Maintenance Tickets, and Financial Dues." : "Student Portal: View your room details, notices, and maintenance status."}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn btn-primary"
              onClick={() => setShowSmartModal(true)}
            >
              <Sparkles size={16} />
              <span>Smart Room Allocator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <StatsCard 
          title="Occupancy Rate"
          value={`${stats.rooms.occupancy_rate}%`}
          subtext={`${stats.rooms.total_occupied} / ${stats.rooms.total_capacity} Beds Occupied`}
          icon={Building2}
          color="#6366f1"
        />

        <StatsCard 
          title="Active Complaints"
          value={stats.complaints.pending + stats.complaints.in_progress}
          subtext={`${stats.complaints.emergency} Emergency • ${stats.complaints.resolved} Resolved`}
          icon={AlertCircle}
          color="#ef4444"
        />

        <StatsCard 
          title="Active Visitors"
          value={stats.visitors.active}
          subtext="Currently checked in on campus"
          icon={Users}
          color="#10b981"
        />

        <StatsCard 
          title="Fees Collected"
          value={`₹${stats.fees.paid_amount.toLocaleString()}`}
          subtext={`₹${stats.fees.pending_amount.toLocaleString()} Pending Dues`}
          icon={CreditCard}
          color="#f59e0b"
        />
      </div>

      {/* Middle Section: Occupancy Gauge + Urgent Notices */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Occupancy Detail */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Hostel Capacity & Room Breakdown
            </h3>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('rooms')}
            >
              Manage Rooms <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Overall Campus Occupancy</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{stats.rooms.occupancy_rate}% Capacity</span>
              </div>
              <div style={{ height: '10px', background: 'var(--bg-surface)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${stats.rooms.occupancy_rate}%`, 
                  background: 'var(--accent-gradient)',
                  borderRadius: '9999px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Rooms</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.rooms.total_rooms}</div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vacant Beds</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{stats.rooms.vacant_beds}</div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Students</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#3b82f6' }}>{stats.total_students}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notices Feed */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Bell size={18} color="#f59e0b" /> Notice Board
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('notices')}>
              All Notices
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1, maxHeight: '240px' }}>
            {notices.slice(0, 3).map((notice) => (
              <div key={notice.id} style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${notice.priority === 'Urgent' ? '#ef4444' : notice.priority === 'Important' ? '#f59e0b' : '#3b82f6'}` }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {notice.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {notice.content}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Smart Allocator Modal */}
      <SmartAllocatorModal 
        isOpen={showSmartModal}
        onClose={() => setShowSmartModal(false)}
      />

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Bell, Plus, AlertCircle, Calendar, Shield, Trash2 } from 'lucide-react';

export const Notices = () => {
  const { isAdmin } = useAuth();
  const [notices, setNotices] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('Normal');

  useEffect(() => {
    loadNotices();
  }, [priorityFilter]);

  const loadNotices = async () => {
    try {
      const endpoint = priorityFilter ? `/notices?priority=${priorityFilter}` : '/notices';
      const data = await fetchApi(endpoint);
      setNotices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      await fetchApi('/notices', {
        method: 'POST',
        body: JSON.stringify({
          title,
          content,
          category,
          priority,
          author_name: 'Warden Office'
        })
      });
      setShowAddModal(false);
      setTitle('');
      setContent('');
      loadNotices();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm("Delete this notice entry?")) return;
    try {
      await fetchApi(`/notices/${id}`, { method: 'DELETE' });
      loadNotices();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Digital Notice Board
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Official announcements, curfew rules, maintenance schedules, and campus events.
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Publish New Notice</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={() => setPriorityFilter('')} 
          className={`btn btn-sm ${priorityFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Notices
        </button>

        <button 
          onClick={() => setPriorityFilter('Urgent')} 
          className={`btn btn-sm ${priorityFilter === 'Urgent' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Urgent
        </button>

        <button 
          onClick={() => setPriorityFilter('Important')} 
          className={`btn btn-sm ${priorityFilter === 'Important' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Important
        </button>
      </div>

      {/* Notice Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notices.map((n) => {
          const isUrgent = n.priority === 'Urgent';
          const isImp = n.priority === 'Important';
          return (
            <div key={n.id} className="glass-card" style={{ padding: '1.25rem', borderLeft: `4px solid ${isUrgent ? '#ef4444' : isImp ? '#f59e0b' : '#3b82f6'}` }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {n.title}
                    </h3>
                    <span className={`badge ${isUrgent ? 'badge-danger' : isImp ? 'badge-warning' : 'badge-info'}`}>
                      {n.priority}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'flex', gap: '1rem' }}>
                    <span>Published by: <strong>{n.author_name}</strong></span>
                    <span>Category: <strong>{n.category}</strong></span>
                    <span>Date: {new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {isAdmin && (
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteNotice(n.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.8rem', lineHeight: 1.5, background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                {n.content}
              </p>

            </div>
          );
        })}
      </div>

      {/* Publish Notice Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Publish Official Hostel Notice"
      >
        <form onSubmit={handleCreateNotice}>
          <div className="form-group">
            <label>Notice Title</label>
            <input 
              type="text" 
              required
              className="form-control"
              placeholder="e.g. Night Gate Pass Timings Updated"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="General">General</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Rules">Rules & Discipline</option>
                <option value="Event">Campus Event</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority Flag</label>
              <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="Normal">Normal</option>
                <option value="Important">Important</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Announcement Body</label>
            <textarea 
              rows={4} 
              required 
              className="form-control"
              placeholder="Write the notice details..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Broadcast Announcement
          </button>
        </form>
      </Modal>

    </div>
  );
};

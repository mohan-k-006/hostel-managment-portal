import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { 
  AlertCircle, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Sparkles, 
  Flame, 
  Zap,
  Filter
} from 'lucide-react';

export const Complaints = () => {
  const { isAdmin, user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // New Complaint Form & Smart Triage
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [description, setDescription] = useState('');
  const [suggestedPriority, setSuggestedPriority] = useState('Medium');

  // Resolution Form
  const [updateStatus, setUpdateStatus] = useState('In Progress');
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    loadComplaints();
  }, [statusFilter, categoryFilter]);

  // Real-time Smart Auto-Triage listener
  useEffect(() => {
    const text = (title + ' ' + description).lowerCase ? (title + ' ' + description).toLowerCase() : '';
    if (text.includes('spark') || text.includes('short circuit') || text.includes('fire') || text.includes('gas') || text.includes('flood')) {
      setSuggestedPriority('Emergency');
    } else if (text.includes('leak') || text.includes('no water') || text.includes('power failure')) {
      setSuggestedPriority('High');
    } else {
      setSuggestedPriority('Medium');
    }
  }, [title, description]);

  const loadComplaints = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);

      const data = await fetchApi(`/complaints?${params.toString()}`);
      setComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    try {
      await fetchApi('/complaints', {
        method: 'POST',
        body: JSON.stringify({
          title,
          category,
          priority: suggestedPriority,
          description
        })
      });
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      loadComplaints();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      await fetchApi(`/complaints/${selectedComplaint.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: updateStatus,
          resolution_notes: resolutionNotes
        })
      });
      setShowUpdateModal(false);
      setSelectedComplaint(null);
      setResolutionNotes('');
      loadComplaints();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Maintenance & Complaints
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Track plumbing, electrical, and facility repair requests with smart auto-triage.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>Raise Complaint Ticket</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button 
          onClick={() => setStatusFilter('')}
          className={`btn btn-sm ${statusFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Tickets
        </button>

        <button 
          onClick={() => setStatusFilter('Pending')}
          className={`btn btn-sm ${statusFilter === 'Pending' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Pending
        </button>

        <button 
          onClick={() => setStatusFilter('In Progress')}
          className={`btn btn-sm ${statusFilter === 'In Progress' ? 'btn-primary' : 'btn-secondary'}`}
        >
          In Progress
        </button>

        <button 
          onClick={() => setStatusFilter('Resolved')}
          className={`btn btn-sm ${statusFilter === 'Resolved' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Resolved
        </button>

        <div style={{ marginLeft: 'auto', width: '180px' }}>
          <select 
            className="form-control"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Wi-Fi">Wi-Fi</option>
            <option value="Furniture">Furniture</option>
            <option value="Cleanliness">Cleanliness</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {complaints.map((item) => {
          const isEmergency = item.priority === 'Emergency';
          const isResolved = item.status === 'Resolved';
          return (
            <div key={item.id} className="glass-card" style={{ padding: '1.25rem', borderLeft: `4px solid ${isEmergency ? '#ef4444' : isResolved ? '#10b981' : '#f59e0b'}` }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {item.title}
                    </h3>
                    <span className={`badge ${isEmergency ? 'badge-danger' : item.priority === 'High' ? 'badge-warning' : 'badge-info'}`}>
                      {isEmergency && <Flame size={12} />} {item.priority} Priority
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Category: <strong>{item.category}</strong> • Logged by: <strong>{item.student?.full_name || 'Resident'}</strong> • Date: {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span className={`badge ${isResolved ? 'badge-success' : item.status === 'In Progress' ? 'badge-warning' : 'badge-info'}`}>
                    {item.status}
                  </span>

                  {isAdmin && !isResolved && (
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSelectedComplaint(item);
                        setUpdateStatus(item.status);
                        setShowUpdateModal(true);
                      }}
                    >
                      <Wrench size={14} /> Update Status
                    </button>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.8rem', background: 'var(--bg-surface)', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
                {item.description}
              </p>

              {item.resolution_notes && (
                <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <strong>Warden Resolution Notes:</strong> {item.resolution_notes}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Raise Ticket Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Raise Maintenance Complaint"
      >
        <form onSubmit={handleCreateComplaint}>
          <div className="form-group">
            <label>Complaint Title / Issue</label>
            <input 
              type="text" 
              required
              className="form-control"
              placeholder="e.g. Electrical spark in room outlet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Wi-Fi">Wi-Fi</option>
              <option value="Furniture">Furniture</option>
              <option value="Cleanliness">Cleanliness</option>
            </select>
          </div>

          {/* Smart Auto-Triage Live Indicator */}
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} color="#8b5cf6" />
            <div style={{ fontSize: '0.8rem', color: '#c4b5fd' }}>
              Smart Auto-Triage Priority: <strong style={{ color: suggestedPriority === 'Emergency' ? '#ef4444' : '#f59e0b' }}>{suggestedPriority}</strong>
            </div>
          </div>

          <div className="form-group">
            <label>Issue Description</label>
            <textarea 
              rows={4}
              required
              className="form-control"
              placeholder="Describe the defect or problem..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Submit Complaint Ticket
          </button>
        </form>
      </Modal>

      {/* Update Complaint Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title={`Update Status: ${selectedComplaint?.title}`}
      >
        <form onSubmit={handleUpdateComplaint}>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="form-group">
            <label>Warden / Maintenance Resolution Notes</label>
            <textarea 
              rows={3}
              className="form-control"
              placeholder="Enter technician details or repair status..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Save Status Update
          </button>
        </form>
      </Modal>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Users, UserPlus, LogOut, CheckCircle, Clock } from 'lucide-react';

export const Visitors = () => {
  const { isAdmin } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [students, setStudents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Parent');
  const [purpose, setPurpose] = useState('Personal visit');
  const [targetStudentId, setTargetStudentId] = useState('');

  useEffect(() => {
    loadVisitors();
  }, [statusFilter]);

  const loadVisitors = async () => {
    try {
      const endpoint = statusFilter ? `/visitors?status=${statusFilter}` : '/visitors';
      const data = await fetchApi(endpoint);
      setVisitors(data);

      if (isAdmin) {
        const feesData = await fetchApi('/fees');
        const list = [];
        const seen = new Set();
        for (const f of feesData) {
          if (f.student && !seen.has(f.student.id)) {
            seen.add(f.student.id);
            list.push(f.student);
          }
        }
        setStudents(list);
        if (list.length > 0) setTargetStudentId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    try {
      await fetchApi('/visitors', {
        method: 'POST',
        body: JSON.stringify({
          student_id: parseInt(targetStudentId),
          visitor_name: visitorName,
          phone,
          relation,
          purpose
        })
      });
      setShowAddModal(false);
      setVisitorName('');
      setPhone('');
      loadVisitors();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCheckout = async (id) => {
    try {
      await fetchApi(`/visitors/${id}/checkout`, { method: 'PUT' });
      loadVisitors();
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
            Hostel Visitor Registry
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Log and monitor campus guest entries, relation verification, and check-out timestamps.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} />
          <span>New Visitor Check-In</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Visitor Entry Records
          </h3>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setStatusFilter('')} 
              className={`btn btn-sm ${statusFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All Logs
            </button>

            <button 
              onClick={() => setStatusFilter('Active')} 
              className={`btn btn-sm ${statusFilter === 'Active' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Active Inside
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Visitor Name</th>
                <th>Relation</th>
                <th>Phone</th>
                <th>Student Visited</th>
                <th>Purpose</th>
                <th>Check-In Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 700 }}>{v.visitor_name}</td>
                  <td>{v.relation}</td>
                  <td>{v.phone}</td>
                  <td>{v.student?.full_name || 'Resident'}</td>
                  <td>{v.purpose}</td>
                  <td>{new Date(v.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <span className={`badge ${v.status === 'Active' ? 'badge-success' : 'badge-info'}`}>
                      {v.status}
                    </span>
                  </td>
                  <td>
                    {v.status === 'Active' && (
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleCheckout(v.id)}
                      >
                        <LogOut size={13} /> Check Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check-In Visitor Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Check-In New Visitor"
      >
        <form onSubmit={handleCheckIn}>
          {isAdmin && (
            <div className="form-group">
              <label>Target Resident Student</label>
              <select 
                className="form-control"
                value={targetStudentId}
                onChange={(e) => setTargetStudentId(e.target.value)}
                required
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Visitor Full Name</label>
            <input 
              type="text" 
              required
              className="form-control"
              placeholder="e.g. Suresh Verma"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="text" 
                required
                className="form-control"
                placeholder="+91 99887 76655"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Relation</label>
              <select className="form-control" value={relation} onChange={(e) => setRelation(e.target.value)}>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Guardian">Guardian</option>
                <option value="Friend">Friend</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Purpose of Visit</label>
            <input 
              type="text" 
              required
              className="form-control"
              placeholder="e.g. Delivering supplies and books"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Record Visitor Entry
          </button>
        </form>
      </Modal>

    </div>
  );
};

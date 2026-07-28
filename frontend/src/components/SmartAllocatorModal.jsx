import React, { useState } from 'react';
import { Modal } from './Modal';
import { fetchApi } from '../utils/api';
import { Sparkles, CheckCircle2, Building, ShieldCheck } from 'lucide-react';

export const SmartAllocatorModal = ({ isOpen, onClose, onAssign }) => {
  const [preferredType, setPreferredType] = useState('Double AC');
  const [maxBudget, setMaxBudget] = useState('5500');
  const [preferredBlock, setPreferredBlock] = useState('Block A');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchApi('/rooms/smart-recommend', {
        method: 'POST',
        body: JSON.stringify({
          preferred_type: preferredType,
          max_budget: parseFloat(maxBudget) || 10000,
          preferred_block: preferredBlock
        })
      });
      setRecommendations(res.recommendations || []);
      setSearched(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🤖 Smart Room Allocation Assistant"
    >
      <form onSubmit={handleRecommend}>
        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(139, 92, 246, 0.2)', marginBottom: '1rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Sparkles size={20} color="#a78bfa" />
          <span style={{ fontSize: '0.8rem', color: '#c4b5fd' }}>
            Calculates optimal room matches based on budget, block location, and vacancy score.
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <div className="form-group">
            <label>Preferred Room Type</label>
            <select 
              className="form-control"
              value={preferredType}
              onChange={(e) => setPreferredType(e.target.value)}
            >
              <option value="Single Deluxe">Single Deluxe</option>
              <option value="Double AC">Double AC</option>
              <option value="Double Non-AC">Double Non-AC</option>
              <option value="Triple Non-AC">Triple Non-AC</option>
            </select>
          </div>

          <div className="form-group">
            <label>Max Monthly Fee (₹)</label>
            <input 
              type="number"
              className="form-control"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="e.g. 5000"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Preferred Hostel Block</label>
          <select 
            className="form-control"
            value={preferredBlock}
            onChange={(e) => setPreferredBlock(e.target.value)}
          >
            <option value="Block A">Block A</option>
            <option value="Block B">Block B</option>
            <option value="Block C">Block C</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
          disabled={loading}
        >
          <Sparkles size={16} />
          <span>{loading ? 'Analyzing Available Rooms...' : 'Find Best Recommendations'}</span>
        </button>
      </form>

      {/* Results List */}
      {searched && (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--bg-card-border)', paddingTop: '1rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            Top Recommended Rooms ({recommendations.length})
          </h4>

          {recommendations.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No available rooms match the given criteria. Try adjusting budget or block.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '220px', overflowY: 'auto' }}>
              {recommendations.map(({ room, score, reasons }) => (
                <div key={room.id} className="glass-card" style={{ padding: '0.85rem', background: 'var(--bg-surface)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building size={18} color="#6366f1" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                          Room {room.room_number} ({room.block})
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {room.room_type} • ₹{room.monthly_fee}/mo • {room.capacity - room.occupancy} bed(s) free
                        </div>
                      </div>
                    </div>

                    <span className="badge badge-success">
                      Match Score: {score}
                    </span>
                  </div>

                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {reasons.map((r, idx) => (
                      <span key={idx} style={{ fontSize: '0.7rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        ✓ {r}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

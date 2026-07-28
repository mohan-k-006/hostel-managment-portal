import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { SmartAllocatorModal } from '../components/SmartAllocatorModal';
import { 
  Building2, 
  Plus, 
  Search, 
  UserPlus, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  UserCheck
} from 'lucide-react';

export const Rooms = () => {
  const { isAdmin } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [blockFilter, setBlockFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSmartModal, setShowSmartModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // New Room Form
  const [roomNumber, setRoomNumber] = useState('');
  const [block, setBlock] = useState('Block A');
  const [floor, setFloor] = useState(1);
  const [capacity, setCapacity] = useState(2);
  const [roomType, setRoomType] = useState('Double AC');
  const [monthlyFee, setMonthlyFee] = useState(5000);

  // Assign Student Form
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => {
    loadRoomsData();
  }, [blockFilter, statusFilter, search]);

  const loadRoomsData = async () => {
    try {
      const params = new URLSearchParams();
      if (blockFilter) params.append('block', blockFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);

      const [roomsData, analyticsData] = await Promise.all([
        fetchApi(`/rooms?${params.toString()}`),
        fetchApi('/analytics/dashboard')
      ]);

      setRooms(roomsData);

      // Fetch users for allotment assignment dropdown
      if (isAdmin) {
        const me = await fetchApi('/auth/me');
        // Fetch all complaints or fees to gather students or endpoint
        // Let's create an endpoint or filter students from room API or fees
        const feesData = await fetchApi('/fees');
        const uniqueStudents = [];
        const seen = new Set();
        for (const f of feesData) {
          if (f.student && !seen.has(f.student.id)) {
            seen.add(f.student.id);
            uniqueStudents.push(f.student);
          }
        }
        setStudents(uniqueStudents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await fetchApi('/rooms', {
        method: 'POST',
        body: JSON.stringify({
          room_number: roomNumber,
          block,
          floor: parseInt(floor),
          capacity: parseInt(capacity),
          room_type: roomType,
          monthly_fee: parseFloat(monthlyFee),
          status: 'Available'
        })
      });
      setShowAddModal(false);
      setRoomNumber('');
      loadRoomsData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedRoom) return;

    try {
      await fetchApi('/rooms/assign', {
        method: 'POST',
        body: JSON.stringify({
          student_id: parseInt(selectedStudentId),
          room_id: selectedRoom.id
        })
      });
      setShowAssignModal(false);
      setSelectedRoom(null);
      setSelectedStudentId('');
      loadRoomsData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Room Allotment & Occupancy
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage room inventories, allotment status, and student bed assignments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowSmartModal(true)}>
            <Sparkles size={16} color="#8b5cf6" />
            <span>Smart Allocator</span>
          </button>

          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              <span>Add New Room</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="form-control" 
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search by Room Number (e.g. A-101)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ width: '160px' }}>
          <select 
            className="form-control"
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
          >
            <option value="">All Blocks</option>
            <option value="Block A">Block A</option>
            <option value="Block B">Block B</option>
            <option value="Block C">Block C</option>
          </select>
        </div>

        <div style={{ width: '160px' }}>
          <select 
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Full">Full</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Room Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
        {rooms.map((room) => {
          const isFull = room.occupancy >= room.capacity;
          const isMaint = room.status === 'Maintenance';
          return (
            <div key={room.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Room {room.room_number}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {room.block} • Floor {room.floor}
                  </div>
                </div>

                <span className={`badge ${isMaint ? 'badge-warning' : isFull ? 'badge-danger' : 'badge-success'}`}>
                  {room.status}
                </span>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Type:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{room.room_type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Monthly Fee:</span>
                  <span style={{ fontWeight: 600, color: '#10b981' }}>₹{room.monthly_fee}/mo</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Beds Occupied:</span>
                  <span style={{ fontWeight: 700, color: isFull ? '#ef4444' : '#3b82f6' }}>{room.occupancy} / {room.capacity}</span>
                </div>
              </div>

              {/* Occupants list */}
              {room.occupants && room.occupants.length > 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <strong>Occupants:</strong> {room.occupants.map(o => o.full_name).join(', ')}
                </div>
              )}

              {/* Admin Actions */}
              {isAdmin && (
                <button 
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
                  disabled={isFull || isMaint}
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowAssignModal(true);
                  }}
                >
                  <UserPlus size={14} />
                  <span>{isFull ? 'Room Full' : 'Assign Student'}</span>
                </button>
              )}

            </div>
          );
        })}
      </div>

      {/* Add Room Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Hostel Room"
      >
        <form onSubmit={handleCreateRoom}>
          <div className="form-group">
            <label>Room Number</label>
            <input 
              type="text"
              required
              className="form-control"
              placeholder="e.g. A-103"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div className="form-group">
              <label>Hostel Block</label>
              <select className="form-control" value={block} onChange={(e) => setBlock(e.target.value)}>
                <option value="Block A">Block A</option>
                <option value="Block B">Block B</option>
                <option value="Block C">Block C</option>
              </select>
            </div>

            <div className="form-group">
              <label>Floor Number</label>
              <input type="number" min="1" className="form-control" value={floor} onChange={(e) => setFloor(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div className="form-group">
              <label>Capacity (Beds)</label>
              <input type="number" min="1" max="4" className="form-control" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Room Type</label>
              <select className="form-control" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                <option value="Single Deluxe">Single Deluxe</option>
                <option value="Double AC">Double AC</option>
                <option value="Double Non-AC">Double Non-AC</option>
                <option value="Triple Non-AC">Triple Non-AC</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Monthly Fee Rate (₹)</label>
            <input type="number" required className="form-control" value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            Save Room Entry
          </button>
        </form>
      </Modal>

      {/* Assign Student Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={`Assign Student to Room ${selectedRoom?.room_number}`}
      >
        <form onSubmit={handleAssignStudent}>
          <div className="form-group">
            <label>Select Resident Student</label>
            <select 
              className="form-control"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
            >
              <option value="">-- Choose Student --</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.full_name} ({st.email})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Confirm Room Allotment
          </button>
        </form>
      </Modal>

      {/* Smart Allocator Modal */}
      <SmartAllocatorModal 
        isOpen={showSmartModal}
        onClose={() => setShowSmartModal(false)}
      />

    </div>
  );
};

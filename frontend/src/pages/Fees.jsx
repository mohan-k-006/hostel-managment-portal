import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { CreditCard, CheckCircle, Clock, AlertTriangle, Receipt, DollarSign } from 'lucide-react';

export const Fees = () => {
  const { isAdmin } = useAuth();
  const [fees, setFees] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedFee, setSelectedFee] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [txnId, setTxnId] = useState('');

  useEffect(() => {
    loadFees();
  }, [statusFilter]);

  const loadFees = async () => {
    try {
      const endpoint = statusFilter ? `/fees?status=${statusFilter}` : '/fees';
      const data = await fetchApi(endpoint);
      setFees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayFee = async (e) => {
    e.preventDefault();
    if (!selectedFee) return;

    try {
      await fetchApi(`/fees/${selectedFee.id}/pay`, {
        method: 'POST',
        body: JSON.stringify({ transaction_id: txnId || `TXN${Math.floor(100000 + Math.random() * 900000)}` })
      });
      setShowPayModal(false);
      setTxnId('');
      setSelectedFee(null);
      loadFees();
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
            Fee Dues & Financial Ledger
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Track monthly room fees, payment transaction verification, and printable receipts.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={() => setStatusFilter('')} 
          className={`btn btn-sm ${statusFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Records
        </button>

        <button 
          onClick={() => setStatusFilter('Paid')} 
          className={`btn btn-sm ${statusFilter === 'Paid' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Paid
        </button>

        <button 
          onClick={() => setStatusFilter('Pending')} 
          className={`btn btn-sm ${statusFilter === 'Pending' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Pending
        </button>

        <button 
          onClick={() => setStatusFilter('Overdue')} 
          className={`btn btn-sm ${statusFilter === 'Overdue' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Overdue
        </button>
      </div>

      {/* Fee Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Billing Period</th>
                <th>Fee Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Txn ID</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => {
                const isPaid = fee.status === 'Paid';
                const isOverdue = fee.status === 'Overdue';
                return (
                  <tr key={fee.id}>
                    <td style={{ fontWeight: 700 }}>{fee.student?.full_name || 'Resident Student'}</td>
                    <td>{fee.month_year}</td>
                    <td style={{ fontWeight: 800, color: '#10b981' }}>₹{fee.amount.toLocaleString()}</td>
                    <td>{fee.due_date}</td>
                    <td>
                      <span className={`badge ${isPaid ? 'badge-success' : isOverdue ? 'badge-danger' : 'badge-warning'}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {fee.transaction_id || '—'}
                    </td>
                    <td>
                      {isPaid ? (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedFee(fee);
                            setShowReceiptModal(true);
                          }}
                        >
                          <Receipt size={13} /> View Receipt
                        </button>
                      ) : (
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => {
                            setSelectedFee(fee);
                            setShowPayModal(true);
                          }}
                        >
                          <CreditCard size={13} /> Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title={`Record Payment for ${selectedFee?.month_year}`}
      >
        <form onSubmit={handlePayFee}>
          <div className="form-group">
            <label>Amount Due</label>
            <input 
              type="text" 
              disabled 
              className="form-control"
              value={`₹${selectedFee?.amount}`}
            />
          </div>

          <div className="form-group">
            <label>Transaction / Reference ID (UPI, NEFT, Cash Receipt)</label>
            <input 
              type="text" 
              required
              className="form-control"
              placeholder="e.g. TXN98421034"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-success" style={{ width: '100%', justifyContent: 'center' }}>
            Confirm & Mark as Paid
          </button>
        </form>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Official Hostel Fee Payment Receipt"
      >
        <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--bg-card-border)' }}>
          <div style={{ textAlign: 'center', borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>CAMPUS HOSTEL WARDEN OFFICE</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official Payment Clearance Voucher</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.85rem' }}>
            <div><strong style={{ color: 'var(--text-muted)' }}>Student Name:</strong> {selectedFee?.student?.full_name}</div>
            <div><strong style={{ color: 'var(--text-muted)' }}>Billing Cycle:</strong> {selectedFee?.month_year}</div>
            <div><strong style={{ color: 'var(--text-muted)' }}>Amount Paid:</strong> ₹{selectedFee?.amount}</div>
            <div><strong style={{ color: 'var(--text-muted)' }}>Txn Ref:</strong> {selectedFee?.transaction_id}</div>
            <div><strong style={{ color: 'var(--text-muted)' }}>Payment Status:</strong> <span style={{ color: '#10b981', fontWeight: 700 }}>CLEARED ✓</span></div>
            <div><strong style={{ color: 'var(--text-muted)' }}>Issued Date:</strong> {selectedFee?.payment_date ? new Date(selectedFee.payment_date).toLocaleDateString() : 'Today'}</div>
          </div>
        </div>
      </Modal>

    </div>
  );
};

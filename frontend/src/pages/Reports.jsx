import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';
import { exportToCSV, triggerPrintReport } from '../utils/export';
import { FileText, Download, Printer, Filter, Table, Building2 } from 'lucide-react';

export const Reports = () => {
  const [reportType, setReportType] = useState('rooms');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [reportType]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      if (reportType === 'rooms') {
        const rooms = await fetchApi('/rooms');
        const formatted = rooms.map(r => ({
          'Room Number': r.room_number,
          'Block': r.block,
          'Floor': r.floor,
          'Room Type': r.room_type,
          'Monthly Fee (INR)': r.monthly_fee,
          'Capacity': r.capacity,
          'Occupancy': r.occupancy,
          'Status': r.status,
          'Occupants': r.occupants?.map(o => o.full_name).join('; ') || 'None'
        }));
        setReportData(formatted);
      } else if (reportType === 'complaints') {
        const complaints = await fetchApi('/complaints');
        const formatted = complaints.map(c => ({
          'Ticket ID': c.id,
          'Title': c.title,
          'Category': c.category,
          'Priority': c.priority,
          'Status': c.status,
          'Student Name': c.student?.full_name || 'Resident',
          'Date Created': new Date(c.created_at).toLocaleDateString(),
          'Resolution Notes': c.resolution_notes || 'Pending'
        }));
        setReportData(formatted);
      } else if (reportType === 'fees') {
        const fees = await fetchApi('/fees');
        const formatted = fees.map(f => ({
          'Fee ID': f.id,
          'Student Name': f.student?.full_name || 'Resident',
          'Billing Cycle': f.month_year,
          'Amount (INR)': f.amount,
          'Due Date': f.due_date,
          'Status': f.status,
          'Txn Ref': f.transaction_id || 'N/A'
        }));
        setReportData(formatted);
      } else if (reportType === 'visitors') {
        const visitors = await fetchApi('/visitors');
        const formatted = visitors.map(v => ({
          'Visitor Name': v.visitor_name,
          'Phone': v.phone,
          'Relation': v.relation,
          'Resident Visited': v.student?.full_name || 'Resident',
          'Purpose': v.purpose,
          'Check-In': new Date(v.check_in_time).toLocaleString(),
          'Status': v.status
        }));
        setReportData(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(reportData, `hostel_${reportType}_report.csv`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Printable Official Header (Visible on print or top) */}
      <div className="printable-header" style={{ paddingBottom: '1rem', borderBottom: '2px solid var(--bg-card-border)', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              OFFICIAL HOSTEL MANAGEMENT REPORT
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Campus Accommodation & Operations Audit • Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
          <Building2 size={32} color="#6366f1" className="no-print" />
        </div>
      </div>

      {/* Control Bar (Hidden on print) */}
      <div className="glass-card no-print" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Filter size={18} color="#64748b" />
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Report Domain:</label>
          <select 
            className="form-control"
            style={{ width: '220px' }}
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="rooms">Room Occupancy & Allotment</option>
            <option value="complaints">Maintenance Complaints Audit</option>
            <option value="fees">Fee Collections & Financial Dues</option>
            <option value="visitors">Visitor Entry Registry</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} />
            <span>Download CSV Report</span>
          </button>

          <button className="btn btn-primary" onClick={triggerPrintReport}>
            <Printer size={16} />
            <span>Print Report View</span>
          </button>
        </div>

      </div>

      {/* Report Table View */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'capitalize' }}>
            {reportType} Master Dataset ({reportData.length} Records)
          </h3>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading report dataset...</p>
        ) : reportData.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No data records available for this domain.</p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  {Object.keys(reportData[0]).map((head, idx) => (
                    <th key={idx}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {Object.values(row).map((val, colIdx) => (
                      <td key={colIdx}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

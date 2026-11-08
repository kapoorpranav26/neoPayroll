import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000';

function LeaveManagement({ user }) {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: '', start_date: '', end_date: '', reason: ''
  });

  const fetchData = async () => {
    try {
      const [leavesRes, empRes] = await Promise.all([
        axios.get(`${API_URL}/leaves/`),
        axios.get(`${API_URL}/employees/`)
      ]);
      setLeaves(leavesRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      toast.error("Error loading leave data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      toast.error("End date cannot be earlier than start date!");
      return;
    }

    const empId = user?.role === 'employee' ? user.employeeId : Number(formData.employee_id);
    if (!empId) {
      toast.error("Please select an employee profile");
      return;
    }

    try {
      await axios.post(`${API_URL}/leaves/`, {
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
        employee_id: empId
      });
      toast.success("Leave request submitted successfully!");
      setFormData({ employee_id: '', start_date: '', end_date: '', reason: '' });
      fetchData();
    } catch (err) {
      toast.error("Error submitting leave request");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`${API_URL}/leaves/${id}`, { status });
      toast.success(`Leave request ${status}`);
      fetchData();
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const getEmpName = (id) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.name : `Employee #${id}`;
  };

  const displayedLeaves = user?.role === 'admin' 
    ? leaves 
    : leaves.filter(l => l.employee_id === user?.employeeId);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Leave Management</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {user?.role === 'admin' 
            ? 'Review and manage organizational leave requests' 
            : `Personal Leave Portal for ${user?.name}`}
        </p>
      </div>

      {user?.role === 'employee' && (
        <div className="card glass animate-slide-up" style={{ marginBottom: '2.5rem' }}>
          <h3>Apply for Leave</h3>
          <form onSubmit={handleApply} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label>Applicant Profile (Locked)</label>
              <input 
                type="text" 
                className="input-field" 
                value={`${user?.name} (${user?.department || 'Employee'})`} 
                disabled 
                style={{ opacity: 0.8, cursor: 'not-allowed' }}
              />
            </div>
            <div className="form-group">
              <label>Reason for Leave</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Family function, Medical emergency" 
                required 
                value={formData.reason} 
                onChange={e => setFormData({...formData, reason: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input 
                type="date" 
                className="input-field" 
                required 
                value={formData.start_date} 
                onChange={e => setFormData({...formData, start_date: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input 
                type="date" 
                className="input-field" 
                required 
                value={formData.end_date} 
                onChange={e => setFormData({...formData, end_date: e.target.value})} 
              />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">
                <Calendar size={18} /> Submit Leave Request
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card glass table-container animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            {user?.role === 'admin' ? 'Company Leave Applications' : 'My Leave History & Status'}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Showing {displayedLeaves.length} record(s)
          </span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Reason</th>
              <th>Duration</th>
              <th>Status</th>
              {user?.role === 'admin' && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {displayedLeaves.map(leave => (
              <tr key={leave.id}>
                <td style={{ fontWeight: 600 }}>{getEmpName(leave.employee_id)}</td>
                <td>{leave.reason}</td>
                <td>{leave.start_date} to {leave.end_date}</td>
                <td>
                  <span 
                    className={`badge ${leave.status === 'Approved' ? 'badge-present' : leave.status === 'Rejected' ? 'badge-absent' : ''}`} 
                    style={{ 
                      backgroundColor: leave.status === 'Pending' ? 'rgba(234, 179, 8, 0.15)' : '', 
                      color: leave.status === 'Pending' ? '#eab308' : '', 
                      border: leave.status === 'Pending' ? '1px solid rgba(234, 179, 8, 0.3)' : ''
                    }}
                  >
                    {leave.status === 'Pending' && <Clock size={12} />}
                    {leave.status === 'Approved' && <CheckCircle size={12} />}
                    {leave.status === 'Rejected' && <XCircle size={12} />}
                    {' '}{leave.status}
                  </span>
                </td>
                {user?.role === 'admin' && (
                  <td>
                    {leave.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-success" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} 
                          onClick={() => handleStatusChange(leave.id, 'Approved')}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} 
                          onClick={() => handleStatusChange(leave.id, 'Rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Processed</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {displayedLeaves.length === 0 && (
              <tr>
                <td colSpan={user?.role === 'admin' ? 5 : 4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaveManagement;

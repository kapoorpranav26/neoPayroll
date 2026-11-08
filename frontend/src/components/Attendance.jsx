import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, CheckCheck, Clock, UserCheck, UserX } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000';

function Attendance({ user }) {
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, attRes] = await Promise.all([
        axios.get(`${API_URL}/employees/`),
        axios.get(`${API_URL}/attendance/?date=${date}`)
      ]);
      setEmployees(empRes.data);

      const map = {};
      attRes.data.forEach(item => {
        if (item.date === date) {
          map[item.employee_id] = item.status;
        }
      });
      setAttendanceMap(map);
    } catch (err) {
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  const markAttendance = async (emp, status) => {
    try {
      await axios.post(`${API_URL}/attendance/`, {
        employee_id: emp.id,
        date: date,
        status: status
      });

      setAttendanceMap(prev => ({
        ...prev,
        [emp.id]: status
      }));

      if (status === 'Present') {
        toast.success(`Marked Present: ${emp.name}`);
      } else {
        toast.error(`Marked Absent: ${emp.name}`, { icon: '🛑' });
      }
    } catch (err) {
      toast.error("Error marking attendance");
    }
  };

  const markAllPresent = async () => {
    if (employees.length === 0) return;
    const confirm = window.confirm(`Mark all ${employees.length} employees as Present for ${date}?`);
    if (!confirm) return;

    try {
      await Promise.all(
        employees.map(emp =>
          axios.post(`${API_URL}/attendance/`, {
            employee_id: emp.id,
            date: date,
            status: 'Present'
          })
        )
      );

      const newMap = {};
      employees.forEach(emp => {
        newMap[emp.id] = 'Present';
      });
      setAttendanceMap(newMap);
      toast.success(`All ${employees.length} employees marked Present!`);
    } catch (err) {
      toast.error("Error marking bulk attendance");
    }
  };

  const presentCount = Object.values(attendanceMap).filter(s => s === 'Present').length;
  const absentCount = Object.values(attendanceMap).filter(s => s === 'Absent').length;
  const unmarkedCount = Math.max(0, employees.length - (presentCount + absentCount));

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Daily Attendance Tracker</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {user?.role === 'admin' 
              ? 'Record and review daily employee presence' 
              : 'Viewing company attendance records (Employee View)'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-color)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Clock size={16} color="var(--primary-color)" />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Select Date:</span>
            <input 
              type="date" 
              className="input-field" 
              style={{ padding: '0.35rem 0.6rem', border: 'none', background: 'transparent' }}
              value={date} 
              onChange={e => setDate(e.target.value)} 
            />
          </div>

          {user?.role === 'admin' && (
            <button 
              className="btn btn-primary" 
              onClick={markAllPresent}
              disabled={employees.length === 0}
              style={{ fontSize: '0.875rem', padding: '0.6rem 1.1rem' }}
            >
              <CheckCheck size={18} /> Mark All Present
            </button>
          )}
        </div>
      </div>

      {/* Attendance Summary Mini-Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card glass" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <UserCheck size={24} color="#10b981" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Present</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>{presentCount}</div>
          </div>
        </div>

        <div className="card glass" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <UserX size={24} color="#ef4444" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Absent</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>{absentCount}</div>
          </div>
        </div>

        <div className="card glass" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Clock size={24} color="#94a3b8" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Unmarked</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#94a3b8' }}>{unmarkedCount}</div>
          </div>
        </div>
      </div>

      <div className="card glass table-container animate-slide-up">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Status on {date}</th>
              {user?.role === 'admin' ? <th>Attendance Action</th> : <th>Role Permission</th>}
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => {
              const currentStatus = attendanceMap[emp.id];

              return (
                <tr key={emp.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>#{emp.id}</td>
                  <td style={{ fontWeight: 600 }}>{emp.name}</td>
                  <td>{emp.department}</td>
                  <td>
                    {currentStatus === 'Present' && (
                      <span className="badge badge-present">
                        <CheckCircle size={14} /> Present
                      </span>
                    )}
                    {currentStatus === 'Absent' && (
                      <span className="badge badge-absent">
                        <XCircle size={14} /> Absent
                      </span>
                    )}
                    {!currentStatus && (
                      <span className="badge" style={{ background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                        <Clock size={12} /> Not Marked
                      </span>
                    )}
                  </td>
                  <td>
                    {user?.role === 'admin' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className={`btn ${currentStatus === 'Present' ? 'btn-success' : 'btn-secondary'}`} 
                          style={{ 
                            padding: '0.45rem 0.9rem', 
                            fontSize: '0.8rem',
                            opacity: currentStatus === 'Present' ? 1 : 0.8,
                            borderColor: currentStatus === 'Present' ? '#10b981' : undefined
                          }} 
                          onClick={() => markAttendance(emp, 'Present')}
                          title="Mark Present"
                        >
                          <CheckCircle size={15} /> Present
                        </button>
                        <button 
                          className={`btn ${currentStatus === 'Absent' ? 'btn-danger' : 'btn-secondary'}`} 
                          style={{ 
                            padding: '0.45rem 0.9rem', 
                            fontSize: '0.8rem',
                            opacity: currentStatus === 'Absent' ? 1 : 0.8,
                            borderColor: currentStatus === 'Absent' ? '#ef4444' : undefined
                          }} 
                          onClick={() => markAttendance(emp, 'Absent')}
                          title="Mark Absent"
                        >
                          <XCircle size={15} /> Absent
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Read-Only (Admin Restricted)
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {employees.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No employees found in directory.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance;

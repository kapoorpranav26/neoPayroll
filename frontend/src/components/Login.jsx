import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ShieldCheck, User } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000';

function Login({ onLogin }) {
  const [role, setRole] = useState('admin');
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${API_URL}/employees/`);
        setEmployees(res.data);
        if (res.data.length > 0) {
          setSelectedEmpId(String(res.data[0].id));
        }
      } catch (err) {
        console.error("Could not fetch employee list for login", err);
      }
    };
    fetchEmployees();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    if (role === 'admin') {
      onLogin({
        role: 'admin',
        name: 'System Administrator'
      });
      toast.success('Signed in as Administrator');
    } else {
      const chosen = employees.find(e => e.id === Number(selectedEmpId));
      if (!chosen) {
        toast.error('Please select an employee profile or add an employee first');
        return;
      }
      onLogin({
        role: 'employee',
        employeeId: chosen.id,
        name: chosen.name,
        email: chosen.email,
        department: chosen.department,
        designation: chosen.designation,
        basic_salary: chosen.basic_salary
      });
      toast.success(`Welcome, ${chosen.name}!`);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-color)' }}>
      <div className="card animate-slide-up" style={{ width: '420px', padding: '2.5rem', textAlign: 'center', background: 'var(--surface-color)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--primary-color)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', fontSize: '1.2rem', fontWeight: 800 }}>
          NP
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: 'var(--text-primary)' }}>
          NeoPayroll Portal
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Workforce & Compensation System
        </p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="var(--primary-color)" /> Access Role
            </label>
            <select className="input-field" value={role} onChange={e => setRole(e.target.value)}>
              <option value="admin">Administrator (Full Access)</option>
              <option value="employee">Employee (Self-Service)</option>
            </select>
          </div>

          {role === 'employee' && (
            <div className="form-group animate-fade-in" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={16} color="var(--primary-color)" /> Select Employee Account
              </label>
              {employees.length > 0 ? (
                <select 
                  className="input-field" 
                  value={selectedEmpId} 
                  onChange={e => setSelectedEmpId(e.target.value)}
                  required
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.department} ({emp.designation})
                    </option>
                  ))}
                </select>
              ) : (
                <p style={{ color: 'var(--danger-color)', fontSize: '0.85rem' }}>
                  No employees found. Please log in as Admin to add employees.
                </p>
              )}
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem', fontSize: '0.95rem' }}>
            Sign In to Portal
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Secure Enterprise Authentication
        </div>
      </div>
    </div>
  );
}

export default Login;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, Banknote, FileText, Sun, Moon, LogOut } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import Attendance from './components/Attendance';
import Payroll from './components/Payroll';
import LeaveManagement from './components/LeaveManagement';
import Login from './components/Login';

function Sidebar({ user, onLogout, toggleTheme, theme }) {
  const location = useLocation();
  
  if (!user) return null;

  return (
    <div className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 800, fontSize: '0.95rem' }}>
          NP
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          NeoPayroll
        </div>
      </div>

      <div style={{
        padding: '0.75rem 0.9rem',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '1.25rem'
      }}>
        <div style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signed in as</div>
        <div style={{ fontWeight: 600, color: '#ffffff', marginTop: '2px', fontSize: '0.925rem' }}>{user.name}</div>
        <div style={{ fontSize: '0.75rem', color: user.role === 'admin' ? '#34d399' : '#818cf8', marginTop: '2px', fontWeight: 500 }}>
          {user.role === 'admin' ? '🛡️ Administrator' : `💼 ${user.department || 'Employee'}`}
        </div>
      </div>

      <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
        <LayoutDashboard size={18} /> Dashboard
      </Link>
      <Link to="/employees" className={`nav-link ${location.pathname === '/employees' ? 'active' : ''}`}>
        <Users size={18} /> Employees
      </Link>
      <Link to="/attendance" className={`nav-link ${location.pathname === '/attendance' ? 'active' : ''}`}>
        <CalendarCheck size={18} /> Attendance
      </Link>
      <Link to="/leaves" className={`nav-link ${location.pathname === '/leaves' ? 'active' : ''}`}>
        <FileText size={18} /> Leaves
      </Link>
      {user.role === 'admin' && (
        <Link to="/payroll" className={`nav-link ${location.pathname === '/payroll' ? 'active' : ''}`}>
          <Banknote size={18} /> Payroll
        </Link>
      )}

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button className="btn btn-secondary" onClick={toggleTheme} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#cbd5e1' }}>
          {theme === 'dark' ? <><Sun size={15} /> Light Theme</> : <><Moon size={15} /> Dark Theme</>}
        </button>
        <button className="btn btn-secondary" onClick={onLogout} style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5' }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <Sidebar user={user} onLogout={() => setUser(null)} toggleTheme={toggleTheme} theme={theme} />
      <div className="main-content" style={{ width: user ? undefined : '100%' }}>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--surface-color)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)'
            }
          }}
        />
        <Routes>
          {!user ? (
             <Route path="*" element={<Login onLogin={setUser} />} />
          ) : (
            <>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/employees" element={<EmployeeList user={user} />} />
              <Route path="/attendance" element={<Attendance user={user} />} />
              <Route path="/leaves" element={<LeaveManagement user={user} />} />
              <Route path="/payroll" element={user.role === 'admin' ? <Payroll /> : <Navigate to="/" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

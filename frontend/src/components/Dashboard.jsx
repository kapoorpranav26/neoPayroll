import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, UserCheck, UserX, IndianRupee, Briefcase, 
  Calendar, CheckCircle, Clock, ArrowRight, UserPlus, FileText, CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_URL = 'http://127.0.0.1:8000';

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    employees: 0, 
    present: 0, 
    absent: 0, 
    est: 0,
    mySalary: 0,
    myTodayStatus: 'Not Marked',
    myPendingLeaves: 0,
    pendingLeavesCount: 0
  });
  const [chartData, setChartData] = useState([]);
  const [pendingLeavesList, setPendingLeavesList] = useState([]);
  const [employeesMap, setEmployeesMap] = useState({});

  const currentDateObj = new Date();
  const formattedToday = currentDateObj.toLocaleDateString('en-US', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });

  const fetchStats = async () => {
    try {
      const [empRes, attRes, leavesRes] = await Promise.all([
        axios.get(`${API_URL}/employees/`),
        axios.get(`${API_URL}/attendance/`),
        axios.get(`${API_URL}/leaves/`)
      ]);

      const empData = empRes.data;
      const attData = attRes.data;
      const leavesData = leavesRes.data;

      // Build employee id -> name map
      const eMap = {};
      empData.forEach(e => {
        eMap[e.id] = e;
      });
      setEmployeesMap(eMap);

      const todayStr = new Date().toISOString().split('T')[0];
      const todaysAttendance = attData.filter(a => a.date === todayStr);

      // Deduplicate attendance per employee for today
      const uniqueAttendance = {};
      todaysAttendance.forEach(a => {
        uniqueAttendance[a.employee_id] = a;
      });
      const finalAttendance = Object.values(uniqueAttendance);

      const present = finalAttendance.filter(a => a.status === 'Present').length;
      const absent = finalAttendance.filter(a => a.status === 'Absent').length;

      let est = 0;
      empData.forEach(e => est += e.basic_salary);

      // Build dynamically from last 5 days
      const dynamic5Days = [];
      for (let i = 4; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('default', { weekday: 'short' });

        const dayRecords = attData.filter(a => a.date === dateStr);
        const p = dayRecords.filter(a => a.status === 'Present').length;
        const ab = dayRecords.filter(a => a.status === 'Absent').length;

        dynamic5Days.push({
          name: `${dayLabel} (${d.getDate()})`,
          present: p,
          absent: ab
        });
      }
      setChartData(dynamic5Days);

      // Employee-specific metrics
      let mySalary = 0;
      let myTodayStatus = 'Not Marked';
      let myPendingLeaves = 0;

      if (user?.role === 'employee' && user?.employeeId) {
        const me = eMap[user.employeeId];
        if (me) mySalary = me.basic_salary;
        const myAtt = uniqueAttendance[user.employeeId];
        if (myAtt) myTodayStatus = myAtt.status;
        myPendingLeaves = leavesData.filter(l => l.employee_id === user.employeeId && l.status === 'Pending').length;
      }

      const pending = leavesData.filter(l => l.status === 'Pending');
      setPendingLeavesList(pending.slice(0, 3));

      setStats({
        employees: empData.length,
        present,
        absent,
        est,
        mySalary,
        myTodayStatus,
        myPendingLeaves,
        pendingLeavesCount: pending.length
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const handleQuickApproveLeave = async (leaveId) => {
    try {
      await axios.put(`${API_URL}/leaves/${leaveId}`, { status: 'Approved' });
      toast.success("Leave approved!");
      fetchStats();
    } catch (err) {
      toast.error("Error approving leave");
    }
  };

  const attendanceRate = stats.employees > 0 ? Math.round((stats.present / stats.employees) * 100) : 0;

  return (
    <div className="animate-fade-in">
      {/* Personalized Greeting Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>
              Welcome back, {user?.name || 'Administrator'} 👋
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Here is your workforce summary for {formattedToday}
            </p>
          </div>
          <div style={{
            padding: '0.45rem 0.95rem',
            borderRadius: '9999px',
            background: user?.role === 'admin' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
            border: user?.role === 'admin' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(6, 182, 212, 0.3)',
            color: user?.role === 'admin' ? '#34d399' : '#38bdf8',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            {user?.role === 'admin' ? '🛡️ Administrator Mode' : `💼 ${user?.department || 'Employee'} Portal`}
          </div>
        </div>
      </div>

      {/* Role-Customized Stats Grid */}
      <div className="stats-grid">
        {user?.role === 'admin' ? (
          <>
            <div className="card stat-card animate-slide-up" style={{ animationDelay: '0s' }}>
              <Users size={28} color="#4f46e5" />
              <h3>Total Employees</h3>
              <p>{stats.employees}</p>
            </div>
            
            <div className="card stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <UserCheck size={28} color="#10b981" />
              <h3>Present Today</h3>
              <p>{stats.present}</p>
            </div>

            <div className="card stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <UserX size={28} color="#ef4444" />
              <h3>Absent Today</h3>
              <p>{stats.absent}</p>
            </div>
            
            <div className="card stat-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <IndianRupee size={28} color="#2563eb" />
              <h3>Monthly Budget Est.</h3>
              <p>₹{stats.est.toLocaleString()}</p>
            </div>
          </>
        ) : (
          <>
            <div className="card stat-card animate-slide-up" style={{ animationDelay: '0s' }}>
              <Briefcase size={28} color="#4f46e5" />
              <h3>My Role & Dept</h3>
              <p style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>
                {user?.designation || 'Staff'}
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user?.department || 'General'}</span>
            </div>
            
            <div className="card stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <UserCheck size={28} color={stats.myTodayStatus === 'Present' ? '#10b981' : '#f59e0b'} />
              <h3>Today's Attendance</h3>
              <p style={{ fontSize: '1.4rem', color: stats.myTodayStatus === 'Present' ? '#10b981' : '#f59e0b' }}>
                {stats.myTodayStatus}
              </p>
            </div>

            <div className="card stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <IndianRupee size={28} color="#2563eb" />
              <h3>My Monthly Salary</h3>
              <p>₹{(user?.basic_salary || stats.mySalary || 0).toLocaleString()}</p>
            </div>
            
            <div className="card stat-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Clock size={28} color="#4f46e5" />
              <h3>My Leave Requests</h3>
              <p>{stats.myPendingLeaves} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Pending</span></p>
            </div>
          </>
        )}
      </div>

      {/* Middle Interactive Section */}
      <div className="charts-container" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
        
        {/* 5-Day Attendance Trend Chart */}
        <div className="card glass chart-card animate-slide-up" style={{ animationDelay: '0.4s', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ margin: 0 }}>5-Day Attendance Activity Trend</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Present
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} /> Absent
              </div>
              <span className="badge badge-present" style={{ fontSize: '0.75rem' }}>
                {attendanceRate}% Today's Rate
              </span>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', borderRadius: '8px', boxShadow: 'var(--card-shadow-hover)' }} />
                <Area type="monotone" dataKey="present" name="Present" stroke="#10b981" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={2} />
                <Area type="monotone" dataKey="absent" name="Absent" stroke="#ef4444" fillOpacity={1} fill="url(#colorAbsent)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Right Action & Activity Card */}
        <div className="card glass chart-card animate-slide-up" style={{ animationDelay: '0.5s', display: 'flex', flexDirection: 'column' }}>
          {user?.role === 'admin' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Pending Approvals</h3>
                <span className="badge" style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
                  {stats.pendingLeavesCount} Pending
                </span>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', marginBottom: '1rem' }}>
                {pendingLeavesList.length > 0 ? (
                  pendingLeavesList.map(item => {
                    const applicant = employeesMap[item.employee_id];
                    return (
                      <div key={item.id} style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{applicant ? applicant.name : `Emp #${item.employee_id}`}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.reason} ({item.start_date})</div>
                        </div>
                        <button 
                          className="btn btn-success" 
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => handleQuickApproveLeave(item.id)}
                        >
                          Approve
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle2 size={36} color="#10b981" style={{ marginBottom: '0.5rem', opacity: 0.8 }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>All leave requests processed!</p>
                  </div>
                )}
              </div>

              {/* Admin Quick Action Shortcuts */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Quick Shortcuts
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem' }} onClick={() => navigate('/attendance')}>
                    <Calendar size={14} /> Attendance
                  </button>
                  <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem' }} onClick={() => navigate('/payroll')}>
                    <IndianRupee size={14} /> Payouts
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Payroll & Payout Cycle</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                  Automatic salary disbursements are generated on the 1st of every month.
                </p>
              </div>

              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '1.25rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                marginBottom: '1rem'
              }}>
                <IndianRupee size={36} color="#8b5cf6" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Next Scheduled Cycle</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-color)', margin: '0.25rem 0' }}>1st of Next Month</div>
                <div style={{ fontSize: '0.8rem', color: '#10b981' }}>Base Salary: ₹{(user?.basic_salary || stats.mySalary || 0).toLocaleString()}</div>
              </div>

              {/* Employee Quick Action Shortcuts */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  My Quick Links
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem' }} onClick={() => navigate('/leaves')}>
                    <Calendar size={14} /> Apply Leave
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem' }} onClick={() => navigate('/employees')}>
                    <Users size={14} /> Staff List
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;

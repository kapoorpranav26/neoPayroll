import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserPlus, X, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000';

function EmployeeList({ user }) {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', department: '', designation: '', basic_salary: 0
  });

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_URL}/employees/`);
      setEmployees(res.data);
    } catch (err) {
      toast.error("Failed to load employees");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', department: '', designation: '', basic_salary: 0 });
    setShowForm(!showForm);
  };

  const handleStartEdit = (emp) => {
    setEditingId(emp.id);
    setFormData({
      name: emp.name,
      email: emp.email,
      department: emp.department,
      designation: emp.designation,
      basic_salary: emp.basic_salary
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/employees/${editingId}`, formData);
        toast.success(`Updated details for ${formData.name}`);
      } else {
        await axios.post(`${API_URL}/employees/`, formData);
        toast.success("Employee added successfully!");
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', email: '', department: '', designation: '', basic_salary: 0 });
      fetchEmployees();
    } catch (err) {
      if (editingId) {
        toast.error("Error updating employee record");
      } else {
        toast.error("Error adding employee. Email might already exist.");
      }
    }
  };

  const handleDelete = async (emp) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${emp.name}" (ID #${emp.id})?\n\nThis will also delete their attendance, salary, and leave records.`
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/employees/${emp.id}`);
      toast.success(`Employee ${emp.name} deleted.`);
      fetchEmployees();
    } catch (err) {
      toast.error("Failed to delete employee");
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Employees Directory</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {user?.role === 'admin' 
              ? 'Manage organizational staff records and compensation' 
              : 'Viewing company directory (Read-Only Mode)'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search name, email, department..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '270px' }}
          />
          {user?.role === 'admin' && (
            <button 
              className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`} 
              onClick={handleOpenAdd}
            >
              {showForm ? <><X size={18} /> Cancel</> : <><UserPlus size={18} /> Add Employee</>}
            </button>
          )}
        </div>
      </div>

      {user?.role === 'admin' && showForm && (
        <div className="card glass animate-slide-up" style={{ marginBottom: '2.5rem' }}>
          <h3>{editingId ? `Edit Employee Record (#${editingId})` : 'New Employee Enrollment'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Corporate Email</label>
              <input 
                type="email" 
                className="input-field" 
                required 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input 
                type="text" 
                className="input-field" 
                required 
                placeholder="e.g. Engineering, Sales, HR" 
                value={formData.department} 
                onChange={e => setFormData({...formData, department: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Designation / Job Role</label>
              <input 
                type="text" 
                className="input-field" 
                required 
                placeholder="e.g. Senior Software Engineer" 
                value={formData.designation} 
                onChange={e => setFormData({...formData, designation: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Basic Salary (₹ Monthly)</label>
              <input 
                type="number" 
                className="input-field" 
                required 
                value={formData.basic_salary} 
                onChange={e => setFormData({...formData, basic_salary: Number(e.target.value)})} 
              />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => { setShowForm(false); setEditingId(null); }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? <><CheckCircle2 size={18} /> Update Employee</> : 'Save Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card glass table-container animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Role</th>
              <th>Salary</th>
              {user?.role === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp.id}>
                <td style={{ color: 'var(--text-secondary)' }}>#{emp.id}</td>
                <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{emp.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{emp.email}</td>
                <td>{emp.department}</td>
                <td>{emp.designation}</td>
                <td style={{ fontWeight: 600 }}>
                  {user?.role === 'admin' || emp.id === user?.employeeId 
                    ? `₹${emp.basic_salary.toLocaleString()}` 
                    : <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.85rem' }}>Confidential</span>}
                </td>
                {user?.role === 'admin' && (
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        onClick={() => handleStartEdit(emp)}
                        title="Edit Employee"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        onClick={() => handleDelete(emp)}
                        title="Delete Employee"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan={user?.role === 'admin' ? 7 : 6} style={{ textAlign: 'center', padding: '3rem' }}>
                  No employees found.{user?.role === 'admin' ? ' Click "Add Employee" to create one.' : ''}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeeList;

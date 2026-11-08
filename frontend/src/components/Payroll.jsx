import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FileText, Download, CheckCircle, AlertCircle, IndianRupee, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable, { applyPlugin } from 'jspdf-autotable';

try {
  applyPlugin(jsPDF);
} catch (e) {
  // Plugin applied
}

const API_URL = 'http://127.0.0.1:8000';

function Payroll() {
  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, salRes, attRes] = await Promise.all([
        axios.get(`${API_URL}/employees/`),
        axios.get(`${API_URL}/salary/`),
        axios.get(`${API_URL}/attendance/`)
      ]);
      setEmployees(empRes.data);
      setSalaries(salRes.data);
      setAttendances(attRes.data);
    } catch (err) {
      toast.error("Failed to load payroll and attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateEmployeePayroll = (emp) => {
    // Count absent days for this employee in the current month
    const absentDays = attendances.filter(a => {
      if (a.employee_id !== emp.id || a.status !== 'Absent') return false;
      const d = new Date(a.date);
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentYear;
    }).length;

    const perDaySalary = emp.basic_salary / 30;
    const deduction = Math.round(absentDays * perDaySalary);
    const netPayable = Math.max(0, Math.round(emp.basic_salary - deduction));

    const isPaid = salaries.some(s => 
      s.employee_id === emp.id && s.month === currentMonth && s.year === currentYear
    );

    return { absentDays, deduction, netPayable, isPaid };
  };

  const generateSalary = async (emp, netAmount, absentDays) => {
    try {
      await axios.post(`${API_URL}/salary/`, {
        employee_id: emp.id,
        month: currentMonth,
        year: currentYear,
        amount_paid: netAmount
      });

      if (absentDays > 0) {
        toast.success(`Disbursed ₹${netAmount.toLocaleString()} for ${emp.name} (${absentDays} absent day(s) deducted)`);
      } else {
        toast.success(`Disbursed full salary ₹${netAmount.toLocaleString()} for ${emp.name}`);
      }

      const salRes = await axios.get(`${API_URL}/salary/`);
      setSalaries(salRes.data);
    } catch (err) {
      toast.error("Error generating salary transaction");
    }
  };

  const numberToWords = (num) => {
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    if (num === 0) return "Zero Rupees Only";
    
    const convert = (n) => {
      if (n < 20) return a[n] + " ";
      if (n < 100) return b[Math.floor(n / 10)] + " " + (n % 10 !== 0 ? a[n % 10] + " " : "");
      if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + (n % 100 !== 0 ? convert(n % 100) : "");
      if (n < 100000) return convert(Math.floor(n / 1000)) + "Thousand " + (n % 1000 !== 0 ? convert(n % 1000) : "");
      if (n < 10000000) return convert(Math.floor(n / 100000)) + "Lakh " + (n % 100000 !== 0 ? convert(n % 100000) : "");
      return convert(Math.floor(n / 10000000)) + "Crore " + (n % 10000000 !== 0 ? convert(n % 10000000) : "");
    };
    return "Rupees " + convert(Math.round(num)).replace(/\s+/g, ' ').trim() + " Only";
  };

  const downloadPDF = (sal) => {
    try {
      const doc = new jsPDF();
      const emp = employees.find(e => e.id === sal.employee_id);

      // Calculate components
      const basicSalary = emp ? emp.basic_salary : sal.amount_paid;
      const deduction = Math.max(0, Math.round(basicSalary - sal.amount_paid));
      const absentDays = Math.round(deduction / (basicSalary / 30));
      const paidDays = Math.max(0, 30 - absentDays);

      const basicPay = Math.round(basicSalary * 0.50);
      const hra = Math.round(basicSalary * 0.30);
      const specialAllowance = basicSalary - (basicPay + hra);

      // Page Border
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, 190, 277);

      // Company Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(30, 41, 59);
      doc.text("NEOPAYROLL TECHNOLOGIES PRIVATE LIMITED", 105, 20, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Registered Office: Tower B, Cyber City, Sector 62, Noida, Uttar Pradesh - 201309", 105, 25, { align: "center" });
      doc.text("Corporate Identity Number (CIN): U72200UP2024PTC192841 | Contact: hr@neopayroll.com", 105, 29, { align: "center" });

      // Document Title Banner
      doc.setFillColor(79, 70, 229);
      doc.rect(10, 33, 190, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.text(`SALARY SLIP FOR THE MONTH OF ${sal.month.toUpperCase()} ${sal.year}`, 105, 38.5, { align: "center" });

      // Employee & Attendance Info Table
      autoTable(doc, {
        startY: 44,
        margin: { left: 14, right: 14 },
        theme: 'plain',
        styles: { fontSize: 8.5, cellPadding: 2, textColor: [30, 41, 59] },
        body: [
          [
            { content: 'Employee ID:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
            `#EMP-00${sal.employee_id}`,
            { content: 'Pay Period:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
            `${sal.month} ${sal.year}`
          ],
          [
            { content: 'Employee Name:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
            emp ? emp.name : 'Unknown',
            { content: 'Standard Days:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
            '30 Working Days'
          ],
          [
            { content: 'Department:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
            emp ? emp.department : 'General Staff',
            { content: 'Days Worked:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
            `${paidDays} Days`
          ],
          [
            { content: 'Designation:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
            emp ? emp.designation : 'Staff',
            { content: 'Loss of Pay (LOP):', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
            `${absentDays} Day(s) Absent`
          ],
          [
            { content: 'Bank Account:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
            'HDFC Bank (****4821)',
            { content: 'Payment Status:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
            'Disbursed (Direct Credit)'
          ],
        ]
      });

      // Divider
      const tableStartY = doc.lastAutoTable.finalY + 4;
      doc.setDrawColor(226, 232, 240);
      doc.line(14, tableStartY, 196, tableStartY);

      // Financial Breakdown Table
      autoTable(doc, {
        startY: tableStartY + 2,
        margin: { left: 14, right: 14 },
        theme: 'grid',
        head: [['EARNINGS', 'AMOUNT (INR)', 'DEDUCTIONS', 'AMOUNT (INR)']],
        body: [
          ['Basic Salary (50%)', `Rs. ${basicPay.toLocaleString()}`, 'Loss of Pay (LOP Deductions)', `Rs. ${deduction.toLocaleString()}`],
          ['House Rent Allowance (HRA - 30%)', `Rs. ${hra.toLocaleString()}`, 'Provident Fund (PF)', 'Rs. 0'],
          ['Special Allowance (20%)', `Rs. ${specialAllowance.toLocaleString()}`, 'Professional Tax (PT)', 'Rs. 0'],
          [
            { content: 'Total Gross Earnings (A)', styles: { fontStyle: 'bold' } },
            { content: `Rs. ${basicSalary.toLocaleString()}`, styles: { fontStyle: 'bold' } },
            { content: 'Total Deductions (B)', styles: { fontStyle: 'bold' } },
            { content: `Rs. ${deduction.toLocaleString()}`, styles: { fontStyle: 'bold' } }
          ]
        ],
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 8.5, cellPadding: 3.5 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 41, halign: 'right' },
          2: { cellWidth: 50 },
          3: { cellWidth: 41, halign: 'right' }
        }
      });

      // Net Pay Box
      const netY = doc.lastAutoTable.finalY + 6;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.rect(14, netY, 182, 22, 'FD');

      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(`NET TAKE-HOME REMUNERATION: Rs. ${sal.amount_paid.toLocaleString()}`, 20, netY + 8.5);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`Amount in Words: ${numberToWords(sal.amount_paid)}`, 20, netY + 16);

      // Signatures Section
      const sigY = netY + 38;
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Disbursement Mode: Direct Bank Credit (NEFT / IMPS)', 18, sigY);
      doc.text(`Disbursed On: ${new Date().toLocaleDateString('en-GB')}`, 18, sigY + 5.5);
      doc.text(`Transaction Reference: TXN-NP${sal.year}${String(sal.id).padStart(4, '0')}`, 18, sigY + 11);

      doc.text('For NEOPAYROLL TECHNOLOGIES PVT. LTD.', 135, sigY);
      doc.setDrawColor(148, 163, 184);
      doc.line(135, sigY + 18, 188, sigY + 18);
      doc.text('Authorized Finance Signatory', 135, sigY + 23);

      // Footer Disclaimer
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        "Confidential — This document contains proprietary payroll information intended solely for the named employee.",
        105, 275, { align: "center" }
      );
      doc.text(
        "Generated via NeoPayroll Enterprise HRMS Suite. Electronically generated statement; requires no physical signature.",
        105, 279, { align: "center" }
      );

      doc.save(`Payslip_${sal.month}_${sal.year}_${emp ? emp.name.replace(/\s+/g, '_') : 'Employee'}.pdf`);
      toast.success(`Downloaded payslip for ${emp ? emp.name : 'Employee'}`);
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Could not generate PDF: " + err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Payroll Disbursement Engine</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Automated compensation calculation based on monthly attendance records ({currentMonth} {currentYear})
        </p>
      </div>

      {/* Cycle Highlight Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card glass" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Calendar size={22} color="var(--primary-color)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Cycle</span>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{currentMonth} {currentYear}</div>
        </div>

        <div className="card glass" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <IndianRupee size={22} color="#10b981" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Disbursed This Cycle</span>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#10b981' }}>
            ₹{salaries
              .filter(s => s.month === currentMonth && s.year === currentYear)
              .reduce((sum, s) => sum + s.amount_paid, 0)
              .toLocaleString()}
          </div>
        </div>

        <div className="card glass" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <CheckCircle size={22} color="#06b6d4" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Payouts Completed</span>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>
            {salaries.filter(s => s.month === currentMonth && s.year === currentYear).length} / {employees.length} Staff
          </div>
        </div>
      </div>

      <div className="card glass table-container animate-slide-up">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Active Payroll Calculation Checklist</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee Name</th>
              <th>Base Salary</th>
              <th>Absent Days</th>
              <th>Deduction</th>
              <th>Calculated Net Pay</th>
              <th>Disbursement Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => {
              const { absentDays, deduction, netPayable, isPaid } = calculateEmployeePayroll(emp);

              return (
                <tr key={emp.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>#{emp.id}</td>
                  <td style={{ fontWeight: 600 }}>{emp.name}</td>
                  <td style={{ color: 'var(--primary-color)' }}>₹{emp.basic_salary.toLocaleString()}</td>
                  <td>
                    {absentDays > 0 ? (
                      <span className="badge badge-absent">{absentDays} Day(s)</span>
                    ) : (
                      <span className="badge badge-present">0 Absent</span>
                    )}
                  </td>
                  <td style={{ color: deduction > 0 ? '#ef4444' : 'var(--text-secondary)', fontWeight: deduction > 0 ? 600 : 400 }}>
                    {deduction > 0 ? `- ₹${deduction.toLocaleString()}` : '₹0'}
                  </td>
                  <td style={{ fontWeight: 700, color: '#10b981', fontSize: '1rem' }}>
                    ₹{netPayable.toLocaleString()}
                  </td>
                  <td>
                    {isPaid ? (
                      <span className="badge badge-present" style={{ padding: '0.45rem 0.9rem' }}>
                        <CheckCircle size={14} /> Paid ({currentMonth})
                      </span>
                    ) : (
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} 
                        onClick={() => generateSalary(emp, netPayable, absentDays)}
                      >
                        <FileText size={15} /> Disburse & Generate
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {employees.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>No employees in directory to disburse.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card glass table-container animate-slide-up" style={{ marginTop: '2.5rem', animationDelay: '0.2s' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Historical Payouts & Payslip Archive</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{salaries.length} total records</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Employee</th>
              <th>Disbursed Month/Year</th>
              <th>Amount Paid</th>
              <th>Status</th>
              <th>Download Payslip</th>
            </tr>
          </thead>
          <tbody>
            {salaries.map(sal => {
              const emp = employees.find(e => e.id === sal.employee_id);

              return (
                <tr key={sal.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>#{sal.employee_id}</td>
                  <td style={{ fontWeight: 600 }}>{emp ? emp.name : `Employee #${sal.employee_id}`}</td>
                  <td style={{ fontWeight: 500 }}>{sal.month} {sal.year}</td>
                  <td style={{ color: '#10b981', fontWeight: 'bold' }}>+ ₹{sal.amount_paid.toLocaleString()}</td>
                  <td>
                    <span className="badge badge-present">Disbursed</span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} 
                      onClick={() => downloadPDF(sal)}
                    >
                      <Download size={14} /> Download PDF
                    </button>
                  </td>
                </tr>
              );
            })}
            {salaries.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>No payouts recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Payroll;

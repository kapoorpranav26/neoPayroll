# 💼 NeoPayroll — Modern Workforce & Payroll Automation System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg?style=flat&logo=Vite&logoColor=white)](https://vitejs.dev)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57.svg?style=flat&logo=SQLite&logoColor=white)](https://sqlite.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> A high-performance, full-stack enterprise payroll and workforce management system engineered with **Python FastAPI**, **React 19**, and **SQLite**.

---

## 📖 Complete Documentation & Viva Defense

- 📑 **Comprehensive Academic Project Report:** [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md)  
  *(Includes Legacy System Analysis, System Architecture, Technology Justifications, Mermaid ER & Sequence Diagrams, Full REST API Specification, and Test Matrices).*
- 🎓 **Oral Defense & Viva-Voce Cheat Sheet:** [`VIVA_GUIDE.md`](./VIVA_GUIDE.md)  
  *(Includes 60-Second Elevator Pitch, 7-Step Live Demonstration Script, and Top 19 Technical Viva Questions & Direct Answers).*

---

## 🔄 Re-Engineering Case Study & Origin

This project is a complete modern re-engineering of the open-source **Employees Payroll Management System** authored by **Smohanta23** ([GitHub Repository](https://github.com/Smohanta23/Payroll_Mgmt_System)).

### Architectural Transformation Summary

| Dimension | Legacy Baseline (`Smohanta23/Payroll_Mgmt_System`) | Re-Engineered NeoPayroll System |
| :--- | :--- | :--- |
| **Architecture** | Monolithic Model-View-Controller (MVC) | Decoupled 3-Tier (SPA + Asynchronous REST API + Relational ORM) |
| **Backend** | PHP 7/8 + CodeIgniter 4 Framework | Python 3.10+ + FastAPI + Uvicorn ASGI Server |
| **Frontend** | Server-Side Rendered (SSR) HTML + jQuery + Bootstrap 4 | React 19 + Vite + Custom Stripe/Tailwind Enterprise Design System |
| **Database** | MySQL (requires active service daemon) | SQLite3 Relational Database via SQLAlchemy 2.0 ORM (Zero-config) |
| **API Layer** | Undocumented custom PHP controller endpoints | Standardized RESTful API with automated OpenAPI 3.0 / Swagger UI (`/docs`) |
| **Payslip Export** | Server-rendered HTML print tables | Client-side vectorized PDF compilation via `jsPDF` + `jspdf-autotable` with dynamic **Amount in Words** |
| **Attendance** | Basic tabular entry without trend analysis | Real-time date-filtered attendance lookup, bulk "Mark All Present", and 5-day visual trend analytics |

---

## 🌟 Key Features

- 📊 **Intelligent Role-Adaptive Dashboard:** Real-time staffing metrics, dynamic 5-day attendance trend area charts with integer Y-axis and rate pills, and direct pending leave approvals.
- 👥 **Employee Directory & Full CRUD:** Complete capabilities to enroll (`POST`), inspect (`GET`), update (`PUT`), and delete (`DELETE`) staff records with cascaded cleanup and colleague salary privacy.
- 📅 **Smart Daily Attendance Tracker:** Real-time date-filtered attendance lookup (`GET /attendance/?date=...`), status badges (`Present`, `Absent`, `Not Marked`), and one-click bulk "Mark All Present".
- 🏖️ **Secure Leave Governance Workflow:** Locked applicant profile preventing employee spoofing, date range validations, personal leave status archives, and administrative approval queues.
- 💰 **Automated Attendance-Based Payroll Engine:** Dynamically calculates proportional loss-of-pay (LOP) deductions for logged absences and locks against duplicate monthly disbursements.
- 📄 **Executive Corporate Payslip Generator:** Instant client-side vectorized PDF compilation via `jsPDF` + `jspdf-autotable` featuring official corporate branding, standard dual-column format (Earnings vs Deductions), dynamic **"Amount in Words"** converter, and authorized signatory stamps.
- 🎨 **Modern Corporate SaaS Design System:** Inspired by Stripe and Tailwind UI with a classic dark navy sidebar, crisp white cards, natural status pills, and light/dark theme switching.

---

## ⚡ Quick Start (Windows)

Simply double-click or run the included launcher:

```bat
.\start.bat
```

This concurrently boots both servers:
- 🌐 **Frontend UI:** [http://localhost:5173](http://localhost:5173)
- ⚙️ **Backend API:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- 📚 **Interactive Swagger API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🛠️ Manual Installation & Setup

### 1. Backend (FastAPI + SQLite)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # On Windows (use `source venv/bin/activate` on Linux/macOS)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend (React 19 + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 🏛️ System Architecture

```
reengineered-payroll/
├── backend/
│   ├── database.py           # SQLite connection and session management
│   ├── models.py             # SQLAlchemy ORM database models
│   ├── schemas.py            # Pydantic data schemas & request validation
│   ├── crud.py               # Database queries, updates, and cascade deletion
│   ├── main.py               # FastAPI application routes & CORS middleware
│   ├── requirements.txt      # Python package dependencies
│   └── payroll.db            # SQLite database file
├── frontend/
│   ├── src/
│   │   ├── components/       # Dashboard, EmployeeList, Attendance, LeaveManagement, Payroll, Login
│   │   ├── App.jsx           # Root router, corporate sidebar, authentication state
│   │   ├── index.css         # Modern Stripe/Tailwind corporate design system
│   │   └── main.jsx          # React DOM entry point
│   ├── package.json          # Frontend dependencies & scripts
│   └── vite.config.js        # Vite configuration
├── PROJECT_DOCUMENTATION.md  # Detailed practical report, ER diagrams, test matrix
├── VIVA_GUIDE.md             # Oral defense guide, live demo script, 18 viva Q&As
├── start.bat                 # One-click startup automation
└── README.md                 # Project landing page
```

---

## 📝 Practical Examination & Viva Voce
Developed for college practical assessment and project demonstration. Refer to [`VIVA_GUIDE.md`](./VIVA_GUIDE.md) for demonstration preparation and examiners' technical questions.

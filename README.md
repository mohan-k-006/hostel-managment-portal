# Hostel Management Portal (PRJ-051)

Full-stack Campus Hostel Administration & Student Portal built with **FastAPI**, **SQLite**, and **React**.

## Features
- **Dual-Role Auth**: Warden (Admin) vs Student dashboard access.
- **Room Allotment**: Track room inventories, block capacities, and student assignments.
- **Smart Room Allocator**: Algorithmic recommendation for room allotments based on budget and preferences.
- **Complaints & Auto-Triage**: Real-time triage flags emergency issues (electrical/water leaks).
- **Visitor Logs**: Check-in and check-out tracking for campus visitors.
- **Fee Dues Ledger**: Track monthly fees, record payments, and print digital receipts.
- **Notice Board**: Digital broadcast board for announcements.
- **Reports & Export**: Download CSV reports and print formatted documents.

## Project Structure
```
hostel-management-portal/
├── backend/       # FastAPI, SQLAlchemy ORM, JWT Auth, SQLite DB
└── frontend/      # React, Vite, Tailwind/CSS System, Lucide Icons
```

## Quick Start Guide

### 1. Backend Setup
```bash
cd backend
py main.py
```
*API runs at `http://127.0.0.1:8000` (Swagger docs: `http://127.0.0.1:8000/docs`)*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Web App runs at `http://localhost:3000`*

### 3. Demo Credentials
- **Admin**: `admin@hostel.edu` / `admin123`
- **Student**: `student@hostel.edu` / `student123`

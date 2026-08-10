

## 🚀 Live Project

👉 **[Open Student Leave Management System](https://student-leave-management-system-hack-matrix2026-k63rtes3g.vercel.app)**

# 🎓 Student Leave Management System

### A Digital Leave Management Platform for Colleges

A web-based **Student Leave Management System** that simplifies the process of applying, reviewing, approving, and tracking student leave requests through a structured college workflow.

---

## 📌 Problem Statement

In many colleges, student leave applications are handled manually through paper forms, messages, or informal communication. This can lead to delays, missing records, difficulty tracking approval status, and lack of transparency between students, coordinators, and HODs.

The **Student Leave Management System** provides a centralized digital platform where students can submit leave applications and track their status, while coordinators and HODs can review and process applications according to their responsibilities.

---

## 💡 Our Solution

Our system digitizes the complete leave approval workflow:

**Student → Coordinator → HOD → Final Decision**

Students can submit leave applications with relevant details, coordinators can review applications from their assigned section, and HODs can review applications approved by coordinators at the department level.

All leave requests and their approval status are maintained through the backend, allowing the system to work across different devices.

---

## 👥 User Roles

### 👨‍🎓 Student

* Register and log in
* Submit leave applications
* Select leave type
* Provide reason and leave dates
* View submitted applications
* Track approval status
* View leave history

### 👨‍🏫 Coordinator

* Log in to the coordinator dashboard
* View pending requests from assigned students
* Review leave applications
* Approve applications
* Reject applications with a remark
* Forward approved requests to the HOD

### 👨‍💼 HOD

* Log in to the HOD dashboard
* View coordinator-approved applications from the department
* Review applications
* Approve or reject applications
* Provide remarks when rejecting
* Give the final decision on leave requests

---

## 🔄 Leave Approval Workflow

```text
                    STUDENT
                       │
                       │ Apply Leave
                       ▼
             Pending Coordinator Review
                       │
                ┌──────┴──────┐
                │             │
             Approve        Reject
                │             │
                ▼             ▼
        Pending HOD       Rejected
           Review
                │
          ┌─────┴─────┐
          │           │
       Approve      Reject
          │           │
          ▼           ▼
      Approved     Rejected
```

### Status Flow

```text
pending_coordinator
        ↓
pending_hod
        ↓
approved
```

Rejection can occur at either review stage:

```text
pending_coordinator
        ↓
rejected_by_coordinator
```

or

```text
pending_hod
        ↓
rejected_by_hod
```

---

## ⭐ Key Features

* 🔐 Role-based authentication
* 👨‍🎓 Student dashboard
* 👨‍🏫 Coordinator dashboard
* 👨‍💼 HOD dashboard
* 📝 Online leave application
* 📅 Leave date validation
* 🔢 Automatic calculation of total leave days
* 🔄 Multi-level approval workflow
* 💬 Rejection remarks
* 📊 Dashboard statistics
* 📜 Leave application history
* 🔔 Notifications for important status changes
* 🧾 Audit records for important workflow actions
* 🏫 College hierarchy based access control
* 📱 Web-based interface accessible from different devices

---

## 🏫 College Hierarchy

The system follows the college organizational structure:

```text
Department
    │
    └── Branch
          │
          └── Section
                │
                └── Students
```

Access is controlled according to the user's role and organizational scope.

### Coordinator

Can review applications from the assigned section.

### HOD

Can review coordinator-approved applications within the department.

---

## 🛠️ Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide Icons

### Backend

* Xano
* REST APIs

### Database

* Xano Database

### Development Tools

* Visual Studio Code
* Git
* GitHub

---

## 🧩 System Architecture

```text
┌─────────────────────────────────────────┐
│              Frontend                   │
│        Next.js + React + TypeScript     │
└───────────────────┬─────────────────────┘
                    │
                    │ REST API
                    ▼
┌─────────────────────────────────────────┐
│                Xano                     │
│         Authentication & APIs           │
│                                         │
│  Student APIs                           │
│  Coordinator APIs                       │
│  HOD APIs                               │
│  Dashboard APIs                         │
│  Notification APIs                     │
│  Audit APIs                             │
└───────────────────┬─────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│            Xano Database                │
│                                         │
│ Department                              │
│ Branch                                  │
│ Section                                 │
│ User                                    │
│ Leave Request                           │
│ Notifications                           │
│ Audit Logs                              │
└─────────────────────────────────────────┘
```

---

## 🗄️ Main Database Structure

### Department

Stores college departments.

```text
id
name
code
```

### Branch

Stores branches associated with departments.

```text
id
department_id
name
code
```

### Section

Stores sections associated with branches.

```text
id
branch_id
name
```

### User

Stores student, coordinator, and HOD information.

```text
id
name
email
password
roll_number
department_id
branch_id
section_id
profile_image
is_active
created_at
```

### Leave Request

Stores student leave applications and their approval status.

```text
id
student_id
leave_type
reason
from_date
to_date
total_days
attachment
coordinator_status
coordinator_remark
hod_status
hod_remark
final_status
```

---

## 🔌 API Structure

### Authentication

```text
POST /auth/signup
POST /auth/login
GET  /auth/me
POST /auth/logout
POST /auth/seed
```

### Student Leave APIs

```text
POST /leave-requests/apply
GET  /leave-requests/me
GET  /leave-requests/get/{id}
```

### Coordinator APIs

```text
GET  /leave-requests/coordinator/pending
POST /leave-requests/coordinator/approve/{id}
POST /leave-requests/coordinator/reject/{id}
```

### HOD APIs

```text
GET  /leave-requests/hod/pending
POST /leave-requests/hod/approve/{id}
POST /leave-requests/hod/reject/{id}
```

### Dashboard APIs

```text
GET /dashboard/student
GET /dashboard/coordinator
GET /dashboard/hod
```

---

## 🔒 Validation & Security

The system applies validation rules to maintain data integrity.

* Students can access their own leave applications.
* Coordinators can only review applications within their assigned scope.
* HODs can only review applications belonging to their department.
* HODs cannot access applications before coordinator approval.
* The backend calculates total leave days.
* The start date cannot be after the end date.
* Rejection requires a mandatory remark.
* Important workflow actions can be recorded through audit logs.

---

## 📂 Project Structure

```text
v0-smart-leave-management-system/
│
├── app/
│   ├── auth/
│   ├── dashboard/
│   │   ├── student/
│   │   ├── coordinator/
│   │   └── hod/
│   │
│   └── ...
│
├── components/
│   └── ui/
│
├── public/
│
├── package.json
├── README.md
└── ...
```

---

## 🚀 How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/bhadauriyasweety42-sb/Student-Leave-Management-system-HackMatrix2026.git
```

### 2. Open the project

```bash
cd Student-Leave-Management-system-HackMatrix2026
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file and add the required backend/API configuration.

> Do not commit private API keys, tokens, or other secrets to GitHub.

### 5. Start the development server

```bash
npm run dev
```

### 6. Open the application

Open the local development URL shown by Next.js in your browser.

---

## 🧪 Testing Workflow

A typical test scenario is:

```text
1. Register/Login as Student
        ↓
2. Submit a leave application
        ↓
3. Login as Coordinator
        ↓
4. Review the application
        ↓
5. Approve the application
        ↓
6. Login as HOD
        ↓
7. Review the application
        ↓
8. Approve/Reject
        ↓
9. Student checks final status
```

---

## 🔮 Future Scope

The system can be extended with:

* Email notifications
* Mobile application
* Attendance integration
* Advanced leave analytics
* Calendar integration
* Digital approval signatures
* Automated reports
* Parent/guardian notifications
* Institution-wide deployment

---

## 👨‍💻 Team

### HackMatrix 2026

**Team Members**

 Sweety Bhadauriya 
 Harshita Chaudhary
 Unnati Gupta
 Mohini Rathore

---

## 🏆 Hackathon

Developed as a project for **HackMatrix 2026**.

The project focuses on improving the college leave management process through a centralized, role-based digital workflow.

---

## 📄 License

This project was developed for educational and hackathon purposes.

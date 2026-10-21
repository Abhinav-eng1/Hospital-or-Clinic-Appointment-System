# 🏥 Hospital & Clinic Appointment Management System

> A production-ready, beginner-friendly, and heavily commented full-stack clinical appointment scheduling system built with the **MERN Stack** (MongoDB, Express.js, React, Node.js). Designed for reliability, safety, and seamless role-based workflows for Patients, Doctors, and Hospital Administrators.

---

## 🎯 Motive & Motivation

In traditional healthcare clinics and outpatient departments, scheduling appointments often suffers from:
- **Long Patient Wait Times & Overcrowding**: Patients waiting without predictable time windows.
- **Accidental Double Booking**: Multiple patients assigned to the same specialist simultaneously, causing physician burnout and scheduling conflicts.
- **Manual Overhead**: Clinic staff spending hours on phone calls, manual logs, and spreadsheet reconciliations.
- **Lack of Centralized Oversight**: Hospital management lacking real-time visibility into consultation volumes, patient retention, and doctor workload.

### The Solution
This system provides an end-to-end digital scheduling ecosystem:
1. **Guaranteed Double-Booking Prevention**: High-concurrency slot locking combining atomic MongoDB queries (`findOneAndUpdate`) and database-level unique compound indexes.
2. **Specialist Discovery**: Real-time filtering by medical specialty, experience level, and consultation fees.
3. **Autonomous Doctor Portal**: Specialists set custom availability slots, manage upcoming appointments, and mark clinical consultations completed.
4. **Administrative Oversight**: Real-time metrics tracking registered doctors, patients, booking ratios, and operational bottlenecks.

---

## 👨‍💻 About the Developer & Work Field

* **Developer**: **Abhinav**
* **Work Field**: Full-Stack Web Development, Healthcare IT Solutions, Enterprise Workflow Engineering, Distributed Database Architecture.
* **Specialization**: MERN Stack (MongoDB, Express, React, Node.js), RESTful API Engineering, Role-Based Access Control (RBAC), Scalable Cloud Web Applications.

### 🌐 Profile & Project Links
* **GitHub Profile**: [github.com/Abhinav-eng1](https://github.com/Abhinav-eng1)
* **This Project Repository**: [Hospital-or-Clinic-Appointment-System](https://github.com/Abhinav-eng1/Hospital-or-Clinic-Appointment-System.git)
* **Related Repositories & Work**:
  * [Inventory & Order Management System](https://github.com/Abhinav-eng1/Inventory-and-Order-Management-System) — Enterprise ERP inventory, warehouse, and order tracking system.
  * [Full-Stack Web Engineering Showcase](https://github.com/Abhinav-eng1?tab=repositories) — Open-source MERN & modern web architectures.

---

## 🛠️ Technologies Used

### Backend
* **Node.js**: Asynchronous event-driven runtime environment.
* **Express.js**: Fast, minimalist web framework for building modular REST APIs.
* **MongoDB**: NoSQL document database for clinical records, slots, and user schemas.
* **Mongoose**: Object Data Modeling (ODM) library for schema validation, pre-save hooks, and population.
* **JSON Web Tokens (JWT)**: Stateless token-based user authentication.
* **bcryptjs**: Salted one-way hashing for secure password storage.
* **dotenv**: Zero-dependency environment variable loader.
* **cors**: Cross-Origin Resource Sharing middleware.

### Frontend
* **React 18 (Vite)**: Lightning-fast, modern component-driven frontend architecture.
* **React Router v6**: Declarative client-side routing with guarded redirects.
* **Axios**: Promise-based HTTP client equipped with request interceptors for automated `Bearer` token injection.
* **Plain Vanilla CSS**: Highly polished, modern, responsive CSS architecture using CSS custom properties (variables), clean grid/flexbox layouts, and zero heavy external UI dependencies.

---

## 📋 System Specifications & Features

### 1. Role-Based Access Control (RBAC)
* **Patient**:
  * Self-registration and secure login.
  * Browse medical specialists and filter by specialty (Cardiology, Neurology, Pediatrics, etc.).
  * View real-time available time slots per doctor and confirm bookings.
  * View upcoming, completed, and cancelled appointments.
  * Cancel appointments anytime, which immediately re-opens the slot for other patients.
* **Doctor**:
  * Doctor accounts are exclusively provisioned by Hospital Administration.
  * Create custom consultation availability slots (date, start time, end time).
  * Delete unbooked slots.
  * Track scheduled patients filtered by **Today**, **Upcoming**, or **All**.
  * Mark appointments as **Completed** after consultations.
* **Admin**:
  * Register, edit, and delete doctor profiles and linked user accounts.
  * Live system analytics: Total Doctors, Registered Patients, Total Appointments, and Status Breakdowns (Booked vs. Completed vs. Cancelled).
  * Review recent hospital-wide appointment logs.

### 2. Double-Booking Safety Net
To eliminate race conditions and double bookings, two layers of safety are implemented:
1. **Application Layer**: Atomic slot reservation via `Slot.findOneAndUpdate({ _id: slotId, status: 'available' }, { status: 'booked' })`. If the slot is claimed concurrently, Express immediately issues a `409 Conflict`.
2. **Database Layer (Safety Net)**: A unique compound partial index on MongoDB:
   ```javascript
   appointmentSchema.index(
     { doctor: 1, date: 1, time: 1 },
     { unique: true, partialFilterExpression: { status: 'Booked' } }
   );
   ```

---

## 📁 Project File Architecture

```text
Hospital or Clinic Appointment System/
│
├── backend/                               # Express & Node.js REST API
│   ├── config/
│   │   └── db.js                         # Mongoose database connection setup
│   ├── controllers/
│   │   ├── authController.js             # Patient self-registration & user login
│   │   ├── doctorController.js           # Doctor CRUD & specialty query filtering
│   │   ├── slotController.js             # Availability slot creation & retrieval
│   │   ├── appointmentController.js      # Booking, cancellation, completion logic
│   │   └── adminController.js            # System metrics & aggregated statistics
│   ├── middleware/
│   │   ├── authMiddleware.js             # JWT Bearer token extraction & verification
│   │   ├── roleMiddleware.js             # Granular role guards (patient, doctor, admin)
│   │   └── errorMiddleware.js            # Central 404 handler & error response formatter
│   ├── models/
│   │   ├── User.js                       # User schema with bcrypt pre-save hashing
│   │   ├── Doctor.js                     # Doctor profile linked to User credential
│   │   ├── Slot.js                       # Time slot schema with compound unique index
│   │   └── Appointment.js                # Appointment records with double-booking index
│   ├── routes/
│   │   ├── authRoutes.js                 # /api/auth routes
│   │   ├── doctorRoutes.js               # /api/doctors routes
│   │   ├── slotRoutes.js                 # /api/slots routes
│   │   ├── appointmentRoutes.js          # /api/appointments routes
│   │   └── adminRoutes.js                # /api/admin routes
│   ├── .env.example                      # Template for backend configuration
│   ├── package.json                      # Backend dependencies & npm scripts
│   ├── seed.js                           # Seeding script for Admin, 3 Doctors, & slots
│   └── server.js                         # Application entry point & route mounting
│
├── frontend/                              # Vite + React Client
│   ├── public/                           # Static assets
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js          # Preconfigured Axios with JWT Bearer interceptor
│   │   ├── components/
│   │   │   ├── Navbar.jsx                # Role-adaptive header navigation & user pill
│   │   │   └── ProtectedRoute.jsx        # RBAC route guard with automatic redirection
│   │   ├── context/
│   │   │   └── AuthContext.jsx           # Global user authentication provider
│   │   ├── pages/
│   │   │   ├── Login.jsx                 # Login view with 1-click demo credential autofills
│   │   │   ├── Register.jsx              # Patient registration with client validation
│   │   │   ├── DoctorsList.jsx           # Doctor directory with specialty filter & search
│   │   │   ├── BookAppointment.jsx       # Doctor picker & interactive available slot pills
│   │   │   ├── MyAppointments.jsx        # Patient booking history & cancellation
│   │   │   ├── DoctorDashboard.jsx       # Doctor slot creator & patient appointment completion
│   │   │   └── AdminDashboard.jsx        # Admin command center & doctor lifecycle management
│   │   ├── styles/
│   │   │   └── index.css                 # Clean, responsive CSS with medical teal styling
│   │   ├── App.jsx                       # Client route definitions
│   │   └── main.jsx                      # Vite React root mount
│   ├── index.html                        # HTML5 document template
│   ├── package.json                      # Frontend dependencies
│   └── vite.config.js                    # Vite configuration with /api backend proxy
│
├── .gitignore                             # Ignored node_modules, .env, and dist builds
└── README.md                              # Complete system documentation
```

---

## 🔐 Role Permissions Matrix

| Resource / Action | Patient | Doctor | Admin |
| :--- | :---: | :---: | :---: |
| Self-register account | ✅ | ❌ | ❌ |
| Login & view profile | ✅ | ✅ | ✅ |
| View Doctors directory | ✅ | ✅ | ✅ |
| Filter Doctors by Specialty | ✅ | ✅ | ✅ |
| Add / Edit / Delete Doctor | ❌ | ❌ | ✅ |
| View Available Time Slots | ✅ | ✅ | ✅ |
| Create Availability Slots | ❌ | ✅ | ❌ |
| Delete unbooked Slots | ❌ | ✅ | ❌ |
| Book Appointment | ✅ | ❌ | ❌ |
| View Own Appointments | ✅ (Own) | ✅ (Assigned) | ✅ (All) |
| Cancel Appointment (frees slot) | ✅ (Own) | ❌ | ❌ |
| Mark Appointment as Completed | ❌ | ✅ | ❌ |
| View Admin Statistics & Metrics | ❌ | ❌ | ✅ |

---

## 📡 REST API Reference

All endpoints are hosted under `/api`.

| Method | Endpoint | Allowed Roles | Description | HTTP Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new patient account | `201`, `400`, `409` |
| `POST` | `/api/auth/login` | Public | Login with credentials; returns JWT | `200`, `400`, `401` |
| `GET` | `/api/auth/me` | Authenticated | Fetch current user session details | `200`, `401` |
| `GET` | `/api/doctors` | Authenticated | List doctors (supports `?specialty=...`) | `200`, `401` |
| `GET` | `/api/doctors/:id` | Authenticated | View single doctor profile | `200`, `404` |
| `POST` | `/api/doctors` | Admin only | Create doctor user and medical profile | `201`, `400`, `403`, `409` |
| `PUT` | `/api/doctors/:id` | Admin only | Update doctor profile details | `200`, `400`, `404`, `403` |
| `DELETE` | `/api/doctors/:id` | Admin only | Delete doctor and linked user account | `200`, `404`, `403` |
| `GET` | `/api/slots` | Authenticated | View slots (filter by doctor, date, status) | `200`, `401` |
| `POST` | `/api/slots` | Doctor only | Create an availability slot | `201`, `400`, `409`, `403` |
| `DELETE` | `/api/slots/:id` | Doctor only | Delete an unbooked slot | `200`, `400`, `404`, `403` |
| `POST` | `/api/appointments` | Patient only | Book consultation slot (prevents double-booking) | `201`, `400`, `404`, `409` |
| `GET` | `/api/appointments/my` | Authenticated | View appointments (role-scoped) | `200`, `401` |
| `PUT` | `/api/appointments/:id/cancel` | Patient only | Cancel booking and release slot | `200`, `400`, `403`, `404` |
| `PUT` | `/api/appointments/:id/complete` | Doctor only | Mark appointment as completed | `200`, `400`, `403`, `404` |
| `GET` | `/api/admin/stats` | Admin only | Aggregate platform statistics | `200`, `401`, `403` |

---

## 🚀 Setup & Installation Guide

### Prerequisites
* **Node.js** (v18 or higher)
* **MongoDB** (Local Community Server running on `27017` or MongoDB Atlas URI)
* **Git** installed

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Abhinav-eng1/Hospital-or-Clinic-Appointment-System.git
cd Hospital-or-Clinic-Appointment-System
```

---

### Step 2: Backend Setup
1. Open a terminal and enter the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file (you can copy `.env.example`):
   ```env
   PORT=5001
   MONGO_URI=mongodb://127.0.0.1:27017/hospital_appointment_db
   JWT_SECRET=super_secret_jwt_key_for_hospital_system_12345
   ```
4. Run the seed script to initialize an Admin, 3 Doctors, and sample availability slots:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   # Server runs at http://localhost:5001
   ```

---

### Step 3: Frontend Setup
1. In a separate terminal, navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   # Open your browser at http://localhost:3000 (or the port Vite outputs)
   ```

---

## 👥 Seed Demo Credentials

The Login page includes **1-click quick autofill buttons** for all demo accounts:

| Role | Email | Password | Specialty & Fee |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hospital.com` | `adminpassword123` | System Administrator |
| **Doctor 1** | `sarah.connor@hospital.com` | `doctorpassword123` | Cardiology (12 yrs exp, $120 fee) |
| **Doctor 2** | `gregory.house@hospital.com` | `doctorpassword123` | Neurology (16 yrs exp, $150 fee) |
| **Doctor 3** | `meredith.grey@hospital.com` | `doctorpassword123` | Pediatrics (9 yrs exp, $95 fee) |
| **Patient** | `patient@hospital.com` | `patientpassword123` | Registered Patient |

---

## 📜 License
This project is open-source and available under the [ISC License](LICENSE).

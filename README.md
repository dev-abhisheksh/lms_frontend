# 🎨 LMS Hub — Frontend (React 19 + Vite)

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Lucide](https://img.shields.io/badge/Icons-Lucide-F04D23?logo=lucide&logoColor=white)](https://lucide.dev/)

The frontend of **LMS Hub** is a modern, high-performance web application built with **React 19** and **Vite**. It provides an intuitive, responsive interface for four different user roles, featuring real-time updates and interactive data visualizations.

---

## ✨ Key Features

### 🏢 Role-Specific Dashboards
The application dynamically renders interfaces based on user roles:
- **Admin & Manager:** Unified control panels for institutional and department management.
- **Teacher:** Content management, student tracking, and grading interfaces.
- **Student:** A personalized learning hub for course access, assignments, and test-taking.

### ⚡ Real-Time Interactions
Integrated with **Socket.IO Client**, the UI updates instantly when:
- New assignments are published.
- Announcements are sent.
- Live notifications are triggered.

### 📊 Data Visualization
Utilizes **Recharts** to provide administrators and teachers with visual insights into student performance, enrollment trends, and batch progress.

### 🧠 AI Assistant Interface
A dedicated interface for interacting with the **Gemini AI** service, allowing students and teachers to get instant explanations, summaries, and content assistance.

---

## 🛠️ Tech Stack

- **Framework:** React 19 (Functional Components & Hooks)
- **Build Tool:** Vite (Ultra-fast HMR)
- **Styling:** Tailwind CSS v4 (Modern, utility-first)
- **Routing:** React Router v7
- **Icons:** Lucide-React & React Icons
- **Real-time:** Socket.io-client
- **State Management:** Context API
- **Charts:** Recharts
- **Toasts:** React Hot Toast

---

## 📂 Project Structure

```text
src/
├── API/              # Axios instances & API call services
├── components/       # Shared UI components (Sidebars, Bottombars, Loaders)
│   ├── admin/        # Admin-specific components
│   ├── teacher/      # Teacher-specific components
│   └── login/        # Auth components
├── contexts/         # Global state (Notifications, Sidebar)
├── pages/            # View components (Dashboards, Course lists, etc.)
│   ├── StudentPages/ # Student-only views
│   └── TeacherSubPages/ # Teacher-only views
├── socket/           # Socket.IO event listeners & configuration
└── App.jsx           # Main application shell & routing
```

---

## 🚦 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Development
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 🎨 UI & UX Design
- **Responsive:** Mobile-first design with dedicated `Bottombar` for mobile and `Sidebar` for desktop.
- **Modern:** Clean aesthetics using Tailwind v4's latest features.
- **Interactive:** Hover states, skeleton loaders, and smooth transitions.

---

## 👨‍💻 Author
**Abhishek Sharma**  
[GitHub](https://github.com/dev-abhisheksh)

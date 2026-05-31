import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { NotificationProvider } from "./contexts/NotificationContext";
import Login from "./pages/Login";
import Courses from "./pages/Courses";
import Universal from "./components/Universal";
import CourseSingle from "./pages/CourseSingle";
import Assignments from "./pages/Assignments";
import StudentSubmissions from "./pages/StudentPages/StudentSubmissions";
import SubmissionDetail from "./pages/StudentPages/SubmissionDetail";
import StudentAssignmentDetail from "./pages/StudentPages/StudentAssignmentDetail";
import StudentTests from "./pages/StudentPages/StudentTests";
import TakeTest from "./pages/StudentPages/TakeTest";
import Ai from "./pages/Ai";
import Profile from "./pages/Profile";
import Modules from "./pages/Modules";
import ProtectedRoutes from "./pages/ProtectedRoutes";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDepartments from "./pages/AdminDepartments";
import AdminCourses from "./pages/AdminCourses";
import AdminEnrollments from "./pages/AdminEnrollments";
import AdminAssignRoles from "./pages/AdminAssignRoles";
import { AdminUsersManagement } from "./pages/AdminUsersManagement";
import AdminBatches from "./pages/AdminBatches";
import AdminAddUser from "./pages/AdminAddUser";
import AdminUniversal from "./components/admin/AdminUniversal";
import TeacherUniversal from "./components/teacher/TeacherUniversal";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherCourses from "./pages/TeacherSubPages/TeacherCourses";
import TeacherAssignments from "./pages/TeacherSubPages/TeacherAssignments";
import TeacherSubmissions from "./pages/TeacherSubPages/TeacherSubmissions";
import TeacherStudents from "./pages/TeacherSubPages/TeacherStudents";
import TeacherResources from "./pages/TeacherSubPages/TeacherResources";
import TeacherNotes from "./pages/TeacherSubPages/TeacherNotes";
import TeacherTests from "./pages/TeacherSubPages/TeacherTests";


import { Toaster } from "react-hot-toast";


const RootRedirect = () => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("accessToken");

  if (!token) return <Navigate to="/login" replace />;

  if (role === "admin" || role === "manager") return <Navigate to="/admin" replace />;
  if (role === "teacher") return <Navigate to="/teacher" replace />;
  if (role === "student") return <Navigate to="/student" replace />;

  return <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <NotificationProvider>
        <div className="h-screen w-full bg-[#D7D7E3]">
        <Routes>
          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoutes allowedRoles={["admin", "manager"]} />}>
            <Route element={<AdminUniversal />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/departments" element={<AdminDepartments />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/enrollments" element={<AdminEnrollments />} />
              <Route path="/admin/batches" element={<AdminBatches />} />
              <Route path="/admin/roles" element={<AdminAssignRoles />} />
              <Route path="/admin/users" element={<AdminUsersManagement />} />
              <Route path="/admin/add-user" element={<AdminAddUser />} />
            </Route>
          </Route>

          {/* Teacher Routes */}
          <Route element={<ProtectedRoutes allowedRoles={["teacher"]} />}>
            <Route element={<TeacherUniversal />}>
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/courses" element={<TeacherCourses />} />
              <Route path="/teacher/assignments" element={<TeacherAssignments />} />
              <Route path="/teacher/assignments/:assignmentId/submissions" element={<TeacherSubmissions />} />
              <Route path="/teacher/submissions" element={<TeacherSubmissions />} />
              <Route path="/teacher/students" element={<TeacherStudents />} />
              <Route path="/teacher/resources" element={<TeacherResources />} />
              <Route path="/teacher/notes" element={<TeacherNotes />} />
              <Route path="/teacher/tests" element={<TeacherTests />} />
            </Route>
          </Route>

          {/* Student Dashboard Routes */}
          <Route element={<ProtectedRoutes allowedRoles={["student"]} />}>
            <Route element={<Universal />}>
              <Route path="/student" element={<Courses />} />
              <Route path="/student/tests" element={<StudentTests />} />
              <Route path="/course/:courseID" element={<CourseSingle />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/assignments/:assignmentId" element={<StudentAssignmentDetail />} />
              <Route path="/submissions" element={<StudentSubmissions />} />
              <Route path="/submissions/:submissionId" element={<SubmissionDetail />} />
              <Route path="/ai" element={<Ai />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/module/:moduleID" element={<Modules />} />
            </Route>
            <Route path="/student/take-test/:testId" element={<TakeTest />} />
          </Route>

          <Route path="/login" element={<Login />} />
        </Routes>
        </div>
      </NotificationProvider>
    </BrowserRouter>
  );
};

export default App;

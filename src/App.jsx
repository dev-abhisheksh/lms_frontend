import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { NotificationProvider } from "./contexts/NotificationContext";
import Login from "./pages/Login";
import Courses from "./pages/Courses";
// import SingleCourse from "./components/Courses/SingleCourse";
import Universal from "./components/Universal";
import CourseSingle from "./pages/CourseSingle";
import Assignments from "./pages/Assignments";
import Ai from "./pages/Ai";
import Profile from "./pages/Profile";
import Modules from "./pages/Modules";
import ProtectedRoutes from "./pages/ProtectedRoutes";
import AdminDashboard from "./pages/AdminDashboard ";
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


const App = () => {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <div className="h-screen w-full bg-[#D7D7E3]">
        <Routes>
          <Route element={<ProtectedRoutes />}>

            <Route element={<AdminUniversal/>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/departments" element={<AdminDepartments />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/enrollments" element={<AdminEnrollments />} />
              <Route path="/admin/batches" element={<AdminBatches />} />
              <Route path="/admin/roles" element={<AdminAssignRoles />} />
              <Route path="/admin/users" element={<AdminUsersManagement />} />
              <Route path="/admin/add-user" element={<AdminAddUser />} />
            </Route>

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

            <Route element={<Universal />}>
              <Route path="/" element={<Courses />} />
              <Route path="/course/:courseID" element={<CourseSingle />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/ai" element={<Ai />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/module/:moduleID" element={<Modules />} />
            </Route>
          </Route>

          <Route path="/login" element={<Login />} />

        </Routes>
        </div>
      </NotificationProvider>
    </BrowserRouter>
  );
};

export default App;

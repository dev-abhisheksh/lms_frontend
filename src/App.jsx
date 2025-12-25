import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Courses from "./pages/Courses";
// import SingleCourse from "./components/Courses/SingleCourse";
import Universal from "./components/Universal";
import CourseSingle from "./pages/CourseSingle";
import Assignments from "./pages/Assignments";
import Ai from "./pages/Ai";
import Profile from "./pages/Profile";
import Modules from "./pages/Modules";


const App = () => {
  return (
    <BrowserRouter>
      <div className="h-screen w-full bg-[#D7D7E3]">
        <Routes>
          <Route element={<Universal />}>
            <Route path="/" element={<Courses />} />
            <Route path="/course/:courseID" element={<CourseSingle />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/ai" element={<Ai />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/modules/:moduleID" element={<Modules />} />
          </Route>

          <Route path="/login" element={<Login />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;

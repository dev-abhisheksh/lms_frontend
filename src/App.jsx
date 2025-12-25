import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Courses from "./pages/Courses";


const App = () => {
  return (
    <BrowserRouter>
      <div className="h-screen w-full bg-[#D7D7E3]">
        <Routes>

          <Route path="/" element={<Courses />} />
          <Route path="/login" element={<Login />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;

import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoutes = ({ allowedRoles }) => {
    const token = localStorage.getItem("accessToken")
    const role = localStorage.getItem("role")

    if (!token) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect to a default page based on role if they try to access an unauthorized route
        if (role === "admin" || role === "manager") return <Navigate to="/admin" replace />;
        if (role === "teacher") return <Navigate to="/teacher" replace />;
        return <Navigate to="/" replace />;
    }

    return (
        <Outlet />
    )
}

export default ProtectedRoutes
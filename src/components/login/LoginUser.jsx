import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../API/auth.api";

const LoginUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser({ email, password });

      const { accessToken, user } = res.data;

      // Store auth info
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("role", user.role);

      // Role-based redirect
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Login to your LMS dashboard
          </p>
        </div>

        <form onSubmit={loginFormSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don’t have an account?{" "}
          <span className="text-indigo-600 hover:underline cursor-pointer">
            Contact admin
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginUser;

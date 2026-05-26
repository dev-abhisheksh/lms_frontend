import React, { useState, useEffect } from "react";
import { Departments } from "../API/department.api";
import { registerUser } from "../API/user.api";

const AdminAddUser = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    year: "FY",
    cohortYear: "",
  });

  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [deptPage, setDeptPage] = useState(1);

  const DEPT_PAGE_SIZE = 8;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const years = ["FY", "SY", "TY"];

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await Departments();
        setDepartments(res.data.departments || []);
      } catch (err) {
        setDepartments([]);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeptSelect = (deptId) => {
    setSelectedDept(deptId);

    setForm((prev) => ({
      ...prev,
      department: deptId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await registerUser(form);

      setSuccess("User added successfully!");

      setForm({
        name: "",
        email: "",
        password: "",
        role: "student",
        department: "",
        year: "FY",
        cohortYear: "",
      });

      setSelectedDept("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add user"
      );
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(
    departments.length / DEPT_PAGE_SIZE
  );

  const pagedDepartments = departments.slice(
    (deptPage - 1) * DEPT_PAGE_SIZE,
    deptPage * DEPT_PAGE_SIZE
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT FORM SECTION */}

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Add User</h1>
              <p className="mt-1 text-sm text-gray-500">Create students, teachers, managers and admins for your LMS.</p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >

              {/* NAME */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              {/* ROLE */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* YEAR */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Academic Year</label>
                <select
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* COHORT */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Cohort Year</label>
                <input
                  type="number"
                  name="cohortYear"
                  value={form.cohortYear}
                  onChange={handleChange}
                  required
                  placeholder="2026"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              {/* ALERTS */}
              <div className="md:col-span-2">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 font-medium">{error}</div>
                )}
                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 font-medium">{success}</div>
                )}
              </div>

              {/* BUTTON */}
              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={loading || !selectedDept}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-all font-semibold text-lg disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add User"}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT DEPARTMENT SECTION */}
          <div className="bg-gray-900 text-white rounded-xl shadow-sm border border-gray-800 p-6 flex flex-col overflow-hidden">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Departments</h2>
              <p className="text-gray-400 mt-1 text-sm">Select the department for this user.</p>
            </div>
            <div className="flex-1 pr-1 space-y-3">
              {pagedDepartments.map((dept) => (
                <button
                  key={dept._id}
                  type="button"
                  onClick={() => handleDeptSelect(dept._id)}
                  className={`w-full rounded-lg p-4 text-left transition-all border font-medium text-base
                    ${selectedDept === dept._id ? "bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/30" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-base">{dept.name}</h3>
                      <p className="text-xs text-gray-300 mt-1">Department Access</p>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 ${selectedDept === dept._id ? "bg-white border-white" : "border-gray-400"}`} />
                  </div>
                </button>
              ))}
            </div>
            {/* PAGINATION */}
            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={() => setDeptPage((p) => Math.max(1, p - 1))}
                disabled={deptPage === 1}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs text-gray-300">Page {deptPage} / {totalPages || 1}</span>
              <button
                type="button"
                onClick={() => setDeptPage((p) => Math.min(totalPages, p + 1))}
                disabled={deptPage === totalPages || totalPages === 0}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAddUser;
import React, { useState, useEffect } from "react";
import { Departments } from "../API/department.api";
import { registerUser } from "../API/user.api";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Generate password: first 4 chars of name (Title-cased) + first 4 digits of phone */
const generatePassword = (fullName = "", phone = "") => {
  const namePart = fullName.trim().replace(/\s+/g, "");
  const nameFour =
    namePart.length >= 4
      ? namePart[0].toUpperCase() + namePart.slice(1, 4).toLowerCase()
      : namePart.length > 0
      ? namePart[0].toUpperCase() + namePart.slice(1).toLowerCase()
      : "";
  const digits = phone.replace(/\D/g, "");
  const phoneFour = digits.slice(0, 4);
  return nameFour + phoneFour;
};

/** Generate username from fullName: lowercase, underscores */
const generateUsername = (fullName = "") =>
  fullName.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

// ─── component ───────────────────────────────────────────────────────────────

const AdminAddUser = () => {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
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
  const [showPassword, setShowPassword] = useState(false);

  const years = ["FY", "SY", "TY"];
  const isStudent = form.role === "student";

  const generatedPassword = generatePassword(form.fullName, form.phone);
  const generatedUsername = generateUsername(form.fullName);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await Departments();
        setDepartments(res.data.departments || []);
      } catch {
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeptSelect = (deptId) => {
    setSelectedDept(deptId);
    setForm((prev) => ({ ...prev, department: deptId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!generatedPassword || generatedPassword.length < 4) {
      setError("Enter at least 1 character of name and 4 digits of phone to generate a valid password.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        fullName: form.fullName.trim(),
        username: generatedUsername,
        email: form.email.trim(),
        password: generatedPassword,
        role: form.role,
        department: form.department || undefined,
        ...(isStudent && form.year ? { year: form.year } : {}),
        ...(isStudent && form.cohortYear ? { cohortYear: form.cohortYear } : {}),
      };

      await registerUser(payload);
      setSuccess(`✅ User created! Email: ${form.email.trim()} | Password: ${generatedPassword}`);
      setForm({ fullName: "", phone: "", email: "", role: "student", department: "", year: "FY", cohortYear: "" });
      setSelectedDept("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(departments.length / DEPT_PAGE_SIZE);
  const pagedDepartments = departments.slice(
    (deptPage - 1) * DEPT_PAGE_SIZE,
    deptPage * DEPT_PAGE_SIZE
  );

  // shared input class
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300";
  const labelCls = "block mb-0.5 text-xs font-medium text-gray-700";

  return (
    <div className="h-full bg-gray-50 p-3 sm:p-4 lg:p-5 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">

          {/* ── LEFT FORM ── */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-5 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="mb-3 shrink-0">
              <h1 className="text-lg font-bold text-gray-900">Add User</h1>
              <p className="text-xs text-gray-500">Create students, teachers, managers and admins.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2.5 flex-1">

              {/* FULL NAME */}
              <div>
                <label className={labelCls}>Full Name</label>
                <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
                  required placeholder="Abhishek Sharma" className={inputCls} />
                {generatedUsername && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    Username: <span className="font-mono text-purple-600">{generatedUsername}</span>
                  </p>
                )}
              </div>

              {/* PHONE */}
              <div>
                <label className={labelCls}>Phone Number</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                  required placeholder="9175XXXXXX" className={inputCls} />
                <p className="mt-0.5 text-xs text-gray-400">Used to auto-generate the password.</p>
              </div>

              {/* EMAIL */}
              <div>
                <label className={labelCls}>Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  required placeholder="abhishek@example.com" className={inputCls} />
              </div>

              {/* ROLE */}
              <div>
                <label className={labelCls}>Role</label>
                <select name="role" value={form.role} onChange={handleChange} className={inputCls}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* YEAR — students only */}
              {isStudent && (
                <div>
                  <label className={labelCls}>Academic Year</label>
                  <select name="year" value={form.year} onChange={handleChange} required className={inputCls}>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              )}

              {/* COHORT YEAR — students only */}
              {isStudent && (
                <div>
                  <label className={labelCls}>Cohort / Admission Year</label>
                  <input type="number" name="cohortYear" value={form.cohortYear} onChange={handleChange}
                    required placeholder="2026" className={inputCls} />
                </div>
              )}

              {/* PASSWORD PREVIEW */}
              <div className="md:col-span-2">
                <label className={labelCls}>Auto-Generated Password</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-purple-50 border border-purple-200 rounded-lg px-3 py-1.5 font-mono text-purple-800 tracking-widest text-sm min-h-[34px] flex items-center">
                    {generatedPassword
                      ? (showPassword ? generatedPassword : "•".repeat(generatedPassword.length))
                      : <span className="text-gray-400 font-sans tracking-normal text-xs">Enter name &amp; phone to generate…</span>
                    }
                  </div>
                  {generatedPassword && (
                    <>
                      <button type="button" onClick={() => setShowPassword((v) => !v)}
                        className="text-xs text-purple-600 hover:text-purple-800 underline shrink-0">
                        {showPassword ? "Hide" : "Show"}
                      </button>
                      <button type="button" onClick={() => navigator.clipboard.writeText(generatedPassword)}
                        className="text-xs text-gray-500 hover:text-gray-800 underline shrink-0">
                        Copy
                      </button>
                    </>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-400">
                  First 4 chars of name + first 4 digits of phone. Student can change it after first login.
                </p>
              </div>

              {/* ALERTS */}
              <div className="md:col-span-2">
                {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs font-medium">{error}</div>}
                {success && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-800 text-xs font-medium break-all">{success}</div>}
              </div>

              {/* SUBMIT */}
              <div className="md:col-span-2">
                <button type="submit"
                  disabled={loading || !selectedDept || !generatedPassword}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all font-semibold text-sm disabled:opacity-50">
                  {loading ? "Adding…" : "Add User"}
                </button>
                {!selectedDept && (
                  <p className="text-center text-xs text-gray-400 mt-1">← Select a department on the right to enable this button.</p>
                )}
              </div>
            </form>
          </div>

          {/* ── RIGHT DEPARTMENT PANEL ── */}
          <div className="bg-gray-900 text-white rounded-xl shadow-sm border border-gray-800 p-4 flex flex-col overflow-hidden">
            <div className="mb-2 shrink-0">
              <h2 className="text-sm font-bold">Departments</h2>
              <p className="text-gray-400 text-xs">Select the department for this user.</p>
            </div>

            <div className="flex-1 space-y-1.5 overflow-hidden">
              {pagedDepartments.length === 0 && (
                <p className="text-gray-500 text-xs">No departments found.</p>
              )}
              {pagedDepartments.map((dept) => (
                <button
                  key={dept._id}
                  type="button"
                  onClick={() => handleDeptSelect(dept._id)}
                  className={`w-full rounded-lg px-3 py-2 text-left transition-all border text-sm
                    ${selectedDept === dept._id
                      ? "bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm leading-tight">{dept.name}</h3>
                      {dept.code && <p className="text-xs text-gray-300">{dept.code}</p>}
                    </div>
                    <div className={`h-3 w-3 rounded-full border-2 shrink-0 ${
                      selectedDept === dept._id ? "bg-white border-white" : "border-gray-400"}`} />
                  </div>
                </button>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between mt-3 shrink-0">
              <button type="button" onClick={() => setDeptPage((p) => Math.max(1, p - 1))}
                disabled={deptPage === 1}
                className="px-3 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 transition disabled:opacity-40">
                Prev
              </button>
              <span className="text-xs text-gray-300">{deptPage} / {totalPages || 1}</span>
              <button type="button" onClick={() => setDeptPage((p) => Math.min(totalPages, p + 1))}
                disabled={deptPage === totalPages || totalPages === 0}
                className="px-3 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 transition disabled:opacity-40">
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
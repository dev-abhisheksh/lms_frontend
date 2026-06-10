import React, { useState, useEffect } from "react";
import { Departments } from "../API/department.api";
import { registerUser } from "../API/user.api";
import { 
  MdPersonOutline, 
  MdPhoneIphone, 
  MdMailOutline, 
  MdOutlineDomain, 
  MdLayers, 
  MdEvent, 
  MdArrowForward,
  MdContentCopy,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircleOutline
} from "react-icons/md";
import toast from "react-hot-toast";

// ─── Helpers ────────────────────────────────────────────────────────────────

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

const generateUsername = (fullName = "") =>
  fullName.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

// ─── Components ──────────────────────────────────────────────────────────────

const FormInput = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">{label}</label>
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />}
      <input
        {...props}
        className={`h-12 w-full bg-slate-50 border-transparent focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 rounded-xl ${Icon ? 'pl-12' : 'px-4'} pr-4 text-xs font-bold text-slate-900 transition-all placeholder:text-slate-300`}
      />
    </div>
  </div>
);

const FormSelect = ({ label, icon: Icon, options, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">{label}</label>
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" size={20} />}
      <select
        {...props}
        className="h-12 w-full bg-slate-50 border-transparent focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 rounded-xl pl-12 pr-4 text-xs font-bold text-slate-900 transition-all appearance-none cursor-pointer"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  </div>
);

const AdminAddUser = () => {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    role: "student",
    department: "",
    year: "",
    section: "",
    cohortYear: "",
  });

  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [deptPage, setDeptPage] = useState(1);
  const DEPT_PAGE_SIZE = 6;

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    if (!selectedDept) {
      toast.error("Please select a department");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        username: generatedUsername,
        email: form.email.trim(),
        password: generatedPassword,
        role: form.role,
        department: form.department || undefined,
        ...(isStudent && form.year ? { year: form.year.trim() } : {}),
        ...(isStudent && form.section ? { section: form.section.trim() } : {}),
        ...(isStudent && form.cohortYear ? { cohortYear: form.cohortYear } : {}),
      };

      await registerUser(payload);
      toast.success("User registered successfully!");
      setForm({ fullName: "", phone: "", email: "", role: "student", department: "", year: "", section: "", cohortYear: "" });
      setSelectedDept("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(departments.length / DEPT_PAGE_SIZE);
  const pagedDepartments = departments.slice(
    (deptPage - 1) * DEPT_PAGE_SIZE,
    deptPage * DEPT_PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Add New User</h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          Onboard new students, faculty, or administrative staff to the system.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ── Left Column: Form (8 cols) ── */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 sm:p-7 rounded-[24px] border border-slate-100 shadow-sm h-full">
            <div className="mb-6">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900">Account Details</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Personal and professional information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Full Name"
                  name="fullName"
                  icon={MdPersonOutline}
                  required
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Abhishek Sharma"
                />
                <FormInput
                  label="Phone Number"
                  name="phone"
                  icon={MdPhoneIphone}
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9175XXXXXX"
                />
                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  icon={MdMailOutline}
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="abhishek@university.edu"
                />
                <FormSelect
                  label="System Role"
                  name="role"
                  icon={MdOutlineDomain}
                  value={form.role}
                  onChange={handleChange}
                  options={[
                    { value: 'student', label: 'Student' },
                    { value: 'teacher', label: 'Teacher' },
                    { value: 'manager', label: 'Manager' },
                    { value: 'admin', label: 'Admin' }
                  ]}
                />
              </div>

              {isStudent && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                  <FormInput
                    label="Academic Year"
                    name="year"
                    icon={MdLayers}
                    required
                    value={form.year}
                    onChange={handleChange}
                    placeholder="e.g. 10 or FY"
                  />
                  <FormInput
                    label="Section"
                    name="section"
                    icon={MdOutlineDomain}
                    value={form.section}
                    onChange={handleChange}
                    placeholder="e.g. A or Div-1"
                  />
                  <FormInput
                    label="Admission Year"
                    name="cohortYear"
                    type="number"
                    icon={MdEvent}
                    required
                    value={form.cohortYear}
                    onChange={handleChange}
                    placeholder="2026"
                  />
                </div>
              )}

              {/* Password Generator Preview */}
              <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Auto-Generated Access</label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
                      {showPassword ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
                    </button>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(generatedPassword); toast.success("Password copied!"); }} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
                      <MdContentCopy size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 opacity-50">Username</p>
                    <div className="h-10 flex items-center px-4 bg-white border border-slate-100 rounded-xl text-xs font-mono font-bold text-indigo-600">
                      {generatedUsername || "..."}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 opacity-50">Initial Password</p>
                    <div className="h-10 flex items-center px-4 bg-white border border-slate-100 rounded-xl text-xs font-mono font-bold text-indigo-600 tracking-[0.2em]">
                      {generatedPassword ? (showPassword ? generatedPassword : "••••••••") : "..."}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !selectedDept || !generatedPassword}
                className="h-12 w-full bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 group mt-2"
              >
                {loading ? "Registering..." : (
                  <>
                    <span>Add User to System</span>
                    <MdArrowForward size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              {!selectedDept && (
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-red-400 animate-pulse">
                  Please select a department from the panel on the right
                </p>
              )}
            </form>
          </div>
        </div>

        {/* ── Right Column: Department Selector (4 cols) ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-900 rounded-[24px] shadow-xl overflow-hidden flex flex-col flex-1 min-h-[400px]">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-base font-black tracking-tight text-white">Department</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Assign organizational unit</p>
            </div>

            <div className="flex-1 p-3 space-y-2">
              {pagedDepartments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-30">
                  <MdOutlineDomain size={48} className="text-white mb-4" />
                  <p className="text-xs font-bold text-white uppercase tracking-widest">No Units Found</p>
                </div>
              ) : pagedDepartments.map((dept) => (
                <button
                  key={dept._id}
                  type="button"
                  onClick={() => handleDeptSelect(dept._id)}
                  className={`w-full group rounded-xl px-4 py-3 text-left transition-all border
                    ${selectedDept === dept._id
                      ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/20"
                      : "bg-white/5 border-white/5 hover:bg-white/10"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <h3 className={`font-bold text-sm truncate ${selectedDept === dept._id ? "text-white" : "text-slate-200"}`}>
                        {dept.name}
                      </h3>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${selectedDept === dept._id ? "text-indigo-200" : "text-slate-500"}`}>
                        {dept.code || "No Code"}
                      </p>
                    </div>
                    {selectedDept === dept._id && <MdCheckCircleOutline className="text-white shrink-0 ml-4" size={20} />}
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-between">
              <button 
                type="button" 
                onClick={() => setDeptPage((p) => Math.max(1, p - 1))}
                disabled={deptPage === 1}
                className="h-9 px-4 rounded-lg bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-20"
              >
                Prev
              </button>
              <div className="flex items-center gap-1.5">
                {[...Array(totalPages)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all ${deptPage === i + 1 ? 'w-4 bg-indigo-500' : 'w-1.5 bg-slate-700'}`} 
                  />
                ))}
              </div>
              <button 
                type="button" 
                onClick={() => setDeptPage((p) => Math.min(totalPages, p + 1))}
                disabled={deptPage === totalPages || totalPages === 0}
                className="h-9 px-4 rounded-lg bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-20"
              >
                Next
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Quick Note</h4>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              New users will be prompted to complete their profile and update their password upon first login. Ensure the email provided is valid for notification delivery.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAddUser;

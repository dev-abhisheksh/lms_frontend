import React, { useEffect, useState, useMemo } from "react";
import {
  Departments,
  createDepartment,
  updateDepartment,
  toggleDepartment,
  assignManager,
} from "../API/department.api";
import { getAllUsers } from "../API/auth.api";
import { 
  MdOutlineSchool, 
  MdAdd, 
  MdEdit, 
  MdPerson, 
  MdClose, 
  MdSearch, 
  MdOutlineFileDownload, 
  MdNotificationsNone,
  MdDeleteOutline
} from "react-icons/md";
import { LuBookOpen, LuUsers, LuUserCog } from "react-icons/lu";
import toast, { Toaster } from "react-hot-toast";

// ── Components ───────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const ToggleSwitch = ({ enabled, onChange, disabled }) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`${
      enabled ? 'bg-indigo-600' : 'bg-gray-200'
    } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50`}
  >
    <span
      className={`${
        enabled ? 'translate-x-5' : 'translate-x-0'
      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
    />
  </button>
);

// ── Main Page Component ──────────────────────────────────────────────────────

const AdminDepartments = () => {
  const [departments, setDepartments]   = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [managers, setManagers]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [searchTerm, setSearchTerm]     = useState("");

  // ── Create / Edit modal ─────────────────────────────────────────────────────
  const [showForm, setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null); 
  const [formData, setFormData]   = useState({ name: "", code: "", description: "" });
  const [saving, setSaving]       = useState(false);

  // ── Assign Manager modal ────────────────────────────────────────────────────
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [assigningManager, setAssigningManager]   = useState(false);

  // ── Load data ───────────────────────────────────────────────────────────────
  const fetchAll = async (shouldSelectFirst = false) => {
    try {
      setLoading(true);
      const deptRes = await Departments();
      const depts = deptRes.data.departments || [];
      setDepartments(depts);
      setError(null);
      
      if (selectedDept) {
        const updated = depts.find(d => d._id === selectedDept._id);
        setSelectedDept(updated || (depts.length > 0 ? depts[0] : null));
      } else if (shouldSelectFirst && depts.length > 0) {
        setSelectedDept(depts[0]);
      }
    } catch {
      setError("Failed to load departments. Please refresh.");
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
    
    try {
      const usersRes = await getAllUsers({ role: "manager", limit: 100 });
      setManagers(usersRes.data.users || []);
    } catch {
      setManagers([]);
    }
  };

  useEffect(() => { fetchAll(true); }, []);

  // ── Filtered Departments ────────────────────────────────────────────────────
  const filteredDepartments = useMemo(() => {
    return departments.filter(d => 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [departments, searchTerm]);

  // ── Create / Edit ───────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setFormData({ name: "", code: "", description: "" });
    setShowForm(true);
  };
  const openEdit = (dept) => {
    setEditTarget(dept);
    setFormData({ name: dept.name, code: dept.code, description: dept.description || "" });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        await updateDepartment(editTarget._id, { name: formData.name, description: formData.description });
        toast.success("Department updated successfully");
      } else {
        await createDepartment(formData);
        toast.success("Department created successfully");
      }
      setShowForm(false);
      await fetchAll();
    } catch (err) {
      const msg = err.response?.data?.message || "Save failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ───────────────────────────────────────────────────────────
  const handleToggle = async (dept) => {
    try {
      const res = await toggleDepartment(dept._id);
      toast.success(res.data.message);
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Toggle failed");
    }
  };

  // ── Assign Manager ──────────────────────────────────────────────────────────
  const openManagerModal = (dept) => {
    setSelectedDept(dept);
    setSelectedManagerId(dept.manager?._id || "");
    setShowManagerModal(true);
  };

  const handleAssignManager = async () => {
    if (!selectedDept) return;
    setAssigningManager(true);
    try {
      const res = await assignManager(selectedDept._id, selectedManagerId || null);
      toast.success(res.data.message);
      setShowManagerModal(false);
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally {
      setAssigningManager(false);
    }
  };

  const removeManager = async () => {
    if (!selectedDept || !selectedDept.manager) return;
    try {
      const res = await assignManager(selectedDept._id, null);
      toast.success("Manager removed successfully");
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove manager");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-8 font-sans text-gray-900">
      <Toaster position="bottom-right" reverseOrder={false} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Department Management</h1>
            <p className="text-gray-500 mt-1">Organize and manage all academic departments.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm">
              <MdOutlineFileDownload className="w-5 h-5 text-gray-400" /> Export
            </button>
            <button className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-200">
              <MdNotificationsNone className="w-6 h-6" />
            </button>
          </div>
        </header>

        {loading && departments.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ── LEFT: Department Sidebar ── */}
            <aside className="lg:col-span-4 flex flex-col gap-4">
              <button
                onClick={openCreate}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200"
              >
                <MdAdd className="w-5 h-5" /> New Department
              </button>

              <div className="relative group">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-sm"
                />
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="max-h-[65vh] overflow-y-auto divide-y divide-gray-100">
                  {filteredDepartments.length === 0 ? (
                    <div className="p-10 text-center">
                      <p className="text-gray-400 text-sm">No departments found.</p>
                    </div>
                  ) : (
                    filteredDepartments.map(dept => (
                      <button
                        key={dept._id}
                        onClick={() => setSelectedDept(dept)}
                        className={`w-full text-left p-5 transition-all relative ${
                          selectedDept?._id === dept._id
                            ? "bg-gray-50"
                            : "hover:bg-gray-50/50"
                        }`}
                      >
                        {selectedDept?._id === dept._id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-900" />
                        )}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${dept.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <h3 className="font-bold text-gray-900 truncate max-w-[150px]">{dept.name}</h3>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md uppercase tracking-wider">
                            {dept.code}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                          <span>{dept.courseCount || 0} courses</span>
                          <span className="w-1 h-1 rounded-full bg-gray-200" />
                          <span>{dept.studentCount || 0} students</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </aside>

            {/* ── RIGHT: Department Details ── */}
            <main className="lg:col-span-8 space-y-6">
              {!selectedDept ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center border-dashed border-2">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MdOutlineSchool className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Department</h3>
                  <p className="text-gray-500 max-w-xs mx-auto">Choose a department from the list on the left to view and manage its details.</p>
                </div>
              ) : (
                <>
                  {/* Hero Card */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h2 className="text-3xl font-black text-gray-900 truncate">{selectedDept.name}</h2>
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg uppercase tracking-widest">
                            {selectedDept.code}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-medium">
                          <MdOutlineSchool className="w-4 h-4" />
                          <span>Academic Unit</span>
                          <span className="mx-1">•</span>
                          <span className={`flex items-center gap-1 ${selectedDept.isActive ? 'text-green-600' : 'text-red-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${selectedDept.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                            {selectedDept.isActive ? 'Active Status' : 'Inactive Status'}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Description</h4>
                          <p className="text-gray-600 leading-relaxed">
                            {selectedDept.description || "No description provided for this department."}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-6 shrink-0">
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                          <span className={`text-xs font-bold uppercase tracking-widest ${selectedDept.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                            {selectedDept.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <ToggleSwitch 
                            enabled={selectedDept.isActive} 
                            onChange={() => handleToggle(selectedDept)} 
                          />
                        </div>
                        <button 
                          onClick={() => openEdit(selectedDept)}
                          className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm text-gray-600"
                        >
                          <MdEdit className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                      icon={LuBookOpen} 
                      label="Total Courses" 
                      value={selectedDept.courseCount || 0} 
                      colorClass="bg-blue-50 text-blue-600"
                    />
                    <StatCard 
                      icon={LuUsers} 
                      label="Students" 
                      value={selectedDept.studentCount || 0} 
                      colorClass="bg-purple-50 text-purple-600"
                    />
                    <StatCard 
                      icon={LuUserCog} 
                      label="Faculty" 
                      value={selectedDept.facultyCount || 0} 
                      colorClass="bg-orange-50 text-orange-600"
                    />
                  </div>

                  {/* Manager Card */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 bg-gray-50/50 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900">Department Manager</h3>
                      <p className="text-sm text-gray-500">The lead administrator for this department.</p>
                    </div>
                    
                    <div className="p-8">
                      {selectedDept.manager ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-2xl border border-gray-200 border-dashed">
                          <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-gray-200">
                            {selectedDept.manager.fullName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xl font-bold text-gray-900 truncate">{selectedDept.manager.fullName}</h4>
                            <p className="text-gray-500 font-medium flex items-center gap-2 truncate">
                              <span className="w-4 h-4 text-gray-300">@</span> {selectedDept.manager.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openManagerModal(selectedDept)}
                              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                            >
                              <LuUserCog className="w-4 h-4" /> Change
                            </button>
                            <button
                              onClick={removeManager}
                              className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition"
                            >
                              <MdDeleteOutline className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-10 rounded-2xl border border-gray-100 bg-gray-50/50">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <MdPerson className="w-8 h-8 text-gray-300" />
                          </div>
                          <p className="text-gray-500 font-medium mb-4">No manager assigned yet.</p>
                          <button
                            onClick={() => openManagerModal(selectedDept)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200"
                          >
                            <MdAdd className="w-4 h-4" /> Assign Manager
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </main>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full p-10 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowForm(false)} 
              className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-50 rounded-full"
            >
              <MdClose className="w-6 h-6" />
            </button>
            
            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-900">
                {editTarget ? "Edit Department" : "New Department"}
              </h3>
              <p className="text-gray-500 mt-1">Fill in the details for the academic unit.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Department Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900 transition font-medium"
                />
              </div>

              {!editTarget && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Unique Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    placeholder="e.g. CSE"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900 transition font-bold tracking-widest"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Tell us about this department..."
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900 transition resize-none font-medium"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition shadow-xl shadow-gray-200 disabled:opacity-50"
                >
                  {saving ? "Processing..." : (editTarget ? "Save Changes" : "Create Unit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Manager Modal */}
      {showManagerModal && selectedDept && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-10 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowManagerModal(false)} 
              className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-50 rounded-full"
            >
              <MdClose className="w-6 h-6" />
            </button>
            
            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-900">Assign Manager</h3>
              <p className="text-gray-500 mt-1">Select a lead for <strong>{selectedDept.name}</strong></p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Select Personnel</label>
                {managers.length === 0 ? (
                  <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-sm text-amber-800 font-medium">No manager-role users found. Create one in User Management first.</p>
                  </div>
                ) : (
                  <select
                    value={selectedManagerId}
                    onChange={e => setSelectedManagerId(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900 transition font-bold"
                  >
                    <option value="">— None (Unassign) —</option>
                    {managers.map(m => (
                      <option key={m._id} value={m._id}>
                        {m.fullName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowManagerModal(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignManager}
                  disabled={assigningManager}
                  className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition shadow-xl shadow-gray-200 disabled:opacity-50"
                >
                  {assigningManager ? "Syncing..." : "Confirm Assignment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepartments;
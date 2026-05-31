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
import Loader from "../components/Loader";

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
      
      if (selectedDept) {
        const updated = depts.find(d => d._id === selectedDept._id);
        setSelectedDept(updated || (depts.length > 0 ? depts[0] : null));
      } else if (shouldSelectFirst && depts.length > 0) {
        setSelectedDept(depts[0]);
      }
    } catch {
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

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        await updateDepartment(editTarget._id, { name: formData.name, description: formData.description });
        toast.success("Department updated");
      } else {
        await createDepartment(formData);
        toast.success("Department created");
      }
      setShowForm(false);
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (dept) => {
    try {
      const res = await toggleDepartment(dept._id);
      toast.success(res.data.message);
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Toggle failed");
    }
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
      await assignManager(selectedDept._id, null);
      toast.success("Manager removed");
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove manager");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-8 font-sans text-gray-900">
      <Toaster position="bottom-right" reverseOrder={false} />
      
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Department Management</h1>
            <p className="text-sm text-gray-500 mt-1">Organize and manage all academic departments.</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-4 relative">
            <button onClick={() => { setEditTarget(null); setFormData({ name: "", code: "", description: "" }); setShowForm(true); }} className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200">
              <MdAdd className="w-5 h-5" /> New Department
            </button>

            <div className="relative group">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-sm" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative min-h-[300px]">
              {loading && departments.length === 0 && <Loader />}
              <div className="max-h-[65vh] overflow-y-auto divide-y divide-gray-100">
                {filteredDepartments.length === 0 && !loading ? (
                  <div className="p-10 text-center text-gray-400 text-sm">No departments found.</div>
                ) : filteredDepartments.map(dept => (
                  <button key={dept._id} onClick={() => setSelectedDept(dept)} className={`w-full text-left p-5 transition-all relative ${selectedDept?._id === dept._id ? "bg-gray-50" : "hover:bg-gray-50/50"}`}>
                    {selectedDept?._id === dept._id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-900" />}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${dept.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <h3 className="font-bold text-gray-900 truncate max-w-[150px] text-sm">{dept.name}</h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md uppercase">{dept.code}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                      <span>{dept.courseCount || 0} courses</span>
                      <span className="w-1 h-1 rounded-full bg-gray-200" />
                      <span>{dept.studentCount || 0} students</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Details */}
          <main className="lg:col-span-8 space-y-6 relative min-h-[500px]">
            {loading && departments.length > 0 && <Loader />}
            {!selectedDept ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center border-dashed border-2">
                <MdOutlineSchool className="w-10 h-10 text-gray-200 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Department</h3>
                <p className="text-gray-500 max-w-xs mx-auto text-sm">Choose a department from the list on the left to view details.</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h2 className="text-3xl font-black text-gray-900 truncate leading-tight tracking-tight">{selectedDept.name}</h2>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black rounded-lg uppercase tracking-widest">{selectedDept.code}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-medium">
                        <MdOutlineSchool className="w-4 h-4" />
                        <span>Academic Unit</span>
                        <span className="mx-1">•</span>
                        <span className={`flex items-center gap-1 ${selectedDept.isActive ? 'text-green-600' : 'text-red-500'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${selectedDept.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                          {selectedDept.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed text-sm">{selectedDept.description || "No description provided."}</p>
                    </div>
                    <div className="flex flex-col items-end gap-6 shrink-0">
                      <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedDept.isActive ? 'text-green-600' : 'text-gray-400'}`}>{selectedDept.isActive ? 'Active' : 'Inactive'}</span>
                        <ToggleSwitch enabled={selectedDept.isActive} onChange={() => handleToggle(selectedDept)} />
                      </div>
                      <button onClick={() => openEdit(selectedDept)} className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm text-gray-600"><MdEdit className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard icon={LuBookOpen} label="Total Courses" value={selectedDept.courseCount || 0} colorClass="bg-blue-50 text-blue-600" />
                  <StatCard icon={LuUsers} label="Students" value={selectedDept.studentCount || 0} colorClass="bg-purple-50 text-purple-600" />
                  <StatCard icon={LuUserCog} label="Faculty" value={selectedDept.facultyCount || 0} colorClass="bg-orange-50 text-orange-600" />
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-8 py-5 bg-gray-50/50 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-900">Department Manager</h3><p className="text-xs text-gray-500">Lead administrator for this department.</p></div>
                  <div className="p-8">
                    {selectedDept.manager ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-2xl border border-gray-200 border-dashed">
                        <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white text-base font-black shrink-0">{selectedDept.manager.fullName.charAt(0)}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-gray-900 truncate">{selectedDept.manager.fullName}</h4>
                          <p className="text-xs text-gray-400 font-medium truncate">@ {selectedDept.manager.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => openManagerModal(selectedDept)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm">Change</button>
                          <button onClick={removeManager} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"><MdDeleteOutline className="w-6 h-6" /></button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 rounded-2xl border border-gray-100 bg-gray-50/50">
                        <MdPerson className="w-8 h-8 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium mb-4 text-sm">No manager assigned yet.</p>
                        <button onClick={() => openManagerModal(selectedDept)} className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200"><MdAdd className="w-4 h-4" /> Assign Manager</button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modals with their own local saving states */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full p-10 relative">
            {saving && <Loader label="Saving..." />}
            <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full"><MdClose className="w-6 h-6" /></button>
            <div className="mb-8"><h3 className="text-2xl font-black text-gray-900">{editTarget ? "Edit Department" : "New Department"}</h3><p className="text-gray-500 mt-1 text-sm">Fill in the details for the academic unit.</p></div>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Department Name</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all font-medium" /></div>
              {!editTarget && (<div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Unique Code</label><input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all font-bold tracking-widest" /></div>)}
              <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description</label><textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all resize-none font-medium leading-relaxed" /></div>
              <div className="flex gap-4 pt-4"><button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition">Cancel</button><button type="submit" disabled={saving} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl disabled:opacity-50">{saving ? "Syncing..." : (editTarget ? "Save" : "Create")}</button></div>
            </form>
          </div>
        </div>
      )}

      {showManagerModal && selectedDept && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-10 relative">
            {assigningManager && <Loader label="Syncing..." />}
            <button onClick={() => setShowManagerModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full"><MdClose className="w-6 h-6" /></button>
            <div className="mb-8"><h3 className="text-2xl font-black text-gray-900">Assign Manager</h3><p className="text-gray-500 mt-1 text-sm font-medium">Select a lead for {selectedDept.name}</p></div>
            <div className="space-y-6">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Personnel</label>
                {managers.length === 0 ? (<div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-xs font-bold text-amber-800">No manager-role users found.</div>) : (
                  <select value={selectedManagerId} onChange={e => setSelectedManagerId(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all font-bold appearance-none cursor-pointer">
                    <option value="">— None (Unassign) —</option>
                    {managers.map(m => (<option key={m._id} value={m._id}>{m.fullName}</option>))}
                  </select>
                )}
              </div>
              <div className="flex gap-4 pt-4"><button onClick={() => setShowManagerModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition">Cancel</button><button onClick={handleAssignManager} disabled={assigningManager} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl disabled:opacity-50">Confirm</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepartments;
import React, { useEffect, useState } from "react";
import {
  Departments,
  createDepartment,
  updateDepartment,
  toggleDepartment,
  assignManager,
} from "../API/department.api";
import { getAllUsers } from "../API/auth.api";
import { MdOutlineSchool, MdAdd, MdEdit, MdPerson, MdClose } from "react-icons/md";

// ── component ──────────────────────────────────────────────────────────────────
const AdminDepartments = () => {
  const [departments, setDepartments]   = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [managers, setManagers]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError]               = useState(null);

  // ── Create / Edit modal ─────────────────────────────────────────────────────
  const [showForm, setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create, obj = edit
  const [formData, setFormData]   = useState({ name: "", code: "", description: "" });
  const [saving, setSaving]       = useState(false);

  // ── Assign Manager modal ────────────────────────────────────────────────────
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [assigningManager, setAssigningManager]   = useState(false);

  // ── Load data ───────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    try {
      setLoading(true);
      const deptRes = await Departments();
      const depts = deptRes.data.departments || [];
      setDepartments(depts);
      setError(null);
      if (selectedDept) {
        const updated = depts.find(d => d._id === selectedDept._id);
        setSelectedDept(updated || null);
      }
    } catch {
      setError("Failed to load departments. Please refresh.");
    } finally {
      setLoading(false);
    }
    // Load managers separately — non-critical
    try {
      const usersRes = await getAllUsers({ role: "manager", limit: 100 });
      setManagers(usersRes.data.users || []);
    } catch {
      setManagers([]);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const flash = (msg) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(""), 4000); };

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
    setError(null);
    try {
      if (editTarget) {
        await updateDepartment(editTarget._id, { name: formData.name, description: formData.description });
        flash(`"${formData.name}" updated successfully.`);
      } else {
        await createDepartment(formData);
        flash(`Department "${formData.name}" created.`);
      }
      setShowForm(false);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ───────────────────────────────────────────────────────────
  const handleToggle = async (dept) => {
    setError(null);
    try {
      const res = await toggleDepartment(dept._id);
      flash(res.data.message);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Toggle failed");
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
    setError(null);
    try {
      const res = await assignManager(selectedDept._id, selectedManagerId || null);
      flash(res.data.message);
      setShowManagerModal(false);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Assignment failed");
    } finally {
      setAssigningManager(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-lg">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <MdOutlineSchool className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">
              Create and manage departments, assign managers, and toggle active status.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
          >
            <MdAdd className="w-5 h-5" /> New Department
          </button>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Main grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent" />
              <p className="mt-3 text-sm text-gray-500">Loading departments...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT: Department list ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Departments ({departments.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 max-h-[60vh] overflow-y-auto">
                  {departments.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No departments yet.{" "}
                      <button onClick={openCreate} className="text-indigo-600 hover:underline font-medium">Create one</button>
                    </div>
                  ) : (
                    departments.map(dept => (
                      <button
                        key={dept._id}
                        onClick={() => setSelectedDept(dept)}
                        className={`w-full text-left p-4 transition-colors ${
                          selectedDept?._id === dept._id
                            ? "bg-blue-50 border-l-4 border-blue-600"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{dept.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            dept.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {dept.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{dept.code}</p>
                        {dept.manager && (
                          <p className="text-xs text-indigo-500 mt-0.5 flex items-center gap-1">
                            <MdPerson className="w-3 h-3" /> {dept.manager.fullName}
                          </p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Department detail ── */}
            <div className="lg:col-span-2">
              {!selectedDept ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <MdOutlineSchool className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Department</h3>
                  <p className="text-gray-500 text-sm">Click a department from the list to view details, edit, or assign a manager.</p>
                </div>
              ) : (
                <>
                  {/* Dept header */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2 className="text-2xl font-bold text-gray-900">{selectedDept.name}</h2>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            selectedDept.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {selectedDept.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Code: <span className="font-mono font-medium">{selectedDept.code}</span></p>
                        {selectedDept.description && (
                          <p className="text-sm text-gray-600 mt-2">{selectedDept.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => openEdit(selectedDept)}
                          className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        >
                          <MdEdit className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleToggle(selectedDept)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            selectedDept.isActive
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          {selectedDept.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Manager card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-base font-semibold text-gray-900">Department Manager</h3>
                      <button
                        onClick={() => openManagerModal(selectedDept)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
                      >
                        <MdPerson className="w-3.5 h-3.5" />
                        {selectedDept.manager ? "Change Manager" : "Assign Manager"}
                      </button>
                    </div>

                    {selectedDept.manager ? (
                      <div className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <MdPerson className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-900">{selectedDept.manager.fullName}</p>
                          <p className="text-sm text-gray-500">{selectedDept.manager.email}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">@{selectedDept.manager.username}</p>
                        </div>
                        <button
                          onClick={async () => {
                            setError(null);
                            try {
                              const res = await assignManager(selectedDept._id, null);
                              flash(res.data.message);
                              await fetchAll();
                            } catch (err) {
                              setError(err.response?.data?.message || "Failed to remove manager");
                            }
                          }}
                          className="ml-auto text-red-600 hover:text-red-900 font-medium text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <MdPerson className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No manager assigned to this department.</p>
                        <button
                          onClick={() => openManagerModal(selectedDept)}
                          className="mt-3 text-indigo-600 hover:underline text-sm font-medium"
                        >
                          Assign a manager
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══ CREATE / EDIT MODAL ══════════════════════════════════════════════ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 z-60 relative">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-semibold text-gray-900">
                {editTarget ? `Edit "${editTarget.name}"` : "Create Department"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <MdClose className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Bachelor of Computer Applications"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {!editTarget && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    placeholder="e.g. BCA"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Unique code, auto-uppercased. Cannot be changed after creation.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Optional description..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-300 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50">
                  {saving ? (editTarget ? "Saving..." : "Creating...") : (editTarget ? "Save Changes" : "Create Department")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ ASSIGN MANAGER MODAL ═════════════════════════════════════════════ */}
      {showManagerModal && selectedDept && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 z-60 relative">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Assign Manager</h3>
                <p className="text-sm text-gray-500 mt-0.5">Department: <strong>{selectedDept.name}</strong></p>
              </div>
              <button onClick={() => setShowManagerModal(false)} className="text-gray-400 hover:text-gray-600">
                <MdClose className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Manager</label>
              {managers.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">No manager-role users found. Add a user with the <strong>manager</strong> role first via the Add User page.</p>
                </div>
              ) : (
                <select
                  value={selectedManagerId}
                  onChange={e => setSelectedManagerId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">— No Manager —</option>
                  {managers.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.fullName} ({m.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowManagerModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-300 transition">
                Cancel
              </button>
              <button
                onClick={handleAssignManager}
                disabled={assigningManager}
                className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {assigningManager ? "Assigning..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepartments;
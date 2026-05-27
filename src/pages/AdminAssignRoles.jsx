import React, { useEffect, useMemo, useState } from "react";
import { getAllUsers, updateUserRole } from "../API/auth.api";

// Role order: low -> high
const ROLES = ["student", "ta", "teacher", "manager"];
const ROLE_ORDER = ["student", "ta", "teacher", "manager", "admin"];

const AdminAssignRoles = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await getAllUsers({ limit: 100 });
        // Hide admin accounts from this UI
        const list = (res.data.users || []).filter((u) => (u.role || "").toLowerCase() !== "admin");
        setUsers(list);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => (u.fullName || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q) || (u.username || "").toLowerCase().includes(q)
    );
  }, [users, query]);

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((u) => u._id)));
  };

  const handleRoleChange = async (userId, role) => {
    const prev = users;
    const user = users.find((u) => u._id === userId);
    if (!user) return;
    const currentIndex = ROLE_ORDER.indexOf((user.role || "").toLowerCase());
    const newIndex = ROLE_ORDER.indexOf((role || "").toLowerCase());
    if (newIndex < currentIndex) {
      setError("Role downgrade is not allowed");
      return;
    }

    // optimistic UI
    setUsers((prevList) => prevList.map((u) => (u._id === userId ? { ...u, role } : u)));
    try {
      await updateUserRole(userId, { role });
    } catch (err) {
      console.error("Failed to update role", err);
      setError("Failed to update role");
      setUsers(prev);
    }
  };

  const handleBulkAssign = async (role) => {
    if (!role || selected.size === 0) return;
    const ids = Array.from(selected);
    const prev = users;
    // validate per-user: skip downgrades
    const allowedIds = [];
    const skipped = [];
    ids.forEach((id) => {
      const u = users.find((x) => x._id === id);
      if (!u) return skipped.push(id);
      const currentIndex = ROLE_ORDER.indexOf((u.role || "").toLowerCase());
      const newIndex = ROLE_ORDER.indexOf((role || "").toLowerCase());
      if (newIndex < currentIndex) skipped.push(id);
      else allowedIds.push(id);
    });

    // optimistic update for allowed ones
    setUsers((prevList) => prevList.map((u) => (allowedIds.includes(u._id) ? { ...u, role } : u)));
    setSelected(new Set());

    try {
      await Promise.all(allowedIds.map((id) => updateUserRole(id, { role })));
      if (skipped.length > 0) setError(`${skipped.length} user(s) skipped: downgrade not allowed`);
    } catch (err) {
      console.error("Bulk role update failed", err);
      setError("Bulk update failed");
      setUsers(prev);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch ((role || "").toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-orange-100 text-orange-800";
      case "teacher":
        return "bg-green-100 text-green-800";
      case "student":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-lg">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Assign Roles</h1>
          <p className="mt-1 text-sm text-gray-500">Assign or change system roles for users</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="md:col-span-2 flex items-center gap-3">
              <select
                onChange={(e) => handleBulkAssign(e.target.value)}
                defaultValue=""
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Bulk assign role</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
              <div className="text-sm text-gray-500">Select users, then choose a role to apply</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-3 text-sm text-gray-500">Loading users...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selected.size === filtered.length && filtered.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <p className="text-gray-500">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" checked={selected.has(u._id)} onChange={() => toggleSelect(u._id)} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{u.fullName || u.username || "-"}</div>
                          <div className="text-xs text-gray-500">{u.username ? `@${u.username}` : ""}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{u.email || "-"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}>
                            {u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <select
                            value={u.role || ""}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile view */}
            <div className="md:hidden divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                filtered.map((u) => (
                  <div key={u._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900">{u.fullName || u.username}</h3>
                        <p className="text-xs text-gray-500 mt-1">{u.email}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-2 ${getRoleBadgeColor(u.role)}`}>
                        {u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={selected.has(u._id)} onChange={() => toggleSelect(u._id)} className="mt-1" />
                        <div className="text-sm text-gray-600">{u.username ? `@${u.username}` : ""}</div>
                      </div>
                      <div>
                        <select value={u.role || ""} onChange={(e) => handleRoleChange(u._id, e.target.value)} className="px-3 py-1 border border-gray-300 rounded-lg">
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r.charAt(0).toUpperCase() + r.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAssignRoles;
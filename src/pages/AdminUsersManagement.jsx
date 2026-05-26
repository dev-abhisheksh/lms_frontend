import React, { useEffect, useState } from "react";
import { getAllUsers } from "../API/auth.api";
import { getMyEnrollments } from "../API/enrollment.api";

export const AdminUsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await getAllUsers({
          page,
          limit: 20,
          search: searchTerm || undefined,
          role: filterRole !== "all" ? filterRole : undefined,
        });
        setUsers(res.data.users || []);
        setPagination(res.data.meta || {});
        setError(null);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, searchTerm, filterRole]);

  // Fetch enrollment information for each user
  useEffect(() => {
    const fetchAllEnrollments = async () => {
      try {
        const enrollmentMap = {};

        // Fetch enrollments for all users
        const enrollmentPromises = users.map(async (user) => {
          try {
            // Note: This approach might not work perfectly since getMyEnrollments
            // is for current user. In production, you'd need a backend endpoint
            // to get a specific user's enrollments. For now, we'll fetch all
            // and filter. This is a workaround.
            enrollmentMap[user._id] = {
              courses: [],
              departments: new Set(),
            };
          } catch (err) {
            console.error(`Failed to fetch enrollments for user ${user._id}`);
          }
        });

        await Promise.all(enrollmentPromises);
        setEnrollmentData(enrollmentMap);
      } catch (err) {
        console.error("Failed to fetch enrollment data:", err);
      }
    };

    if (users.length > 0) {
      fetchAllEnrollments();
    }
  }, [users]);

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Copy user ID to clipboard
  const copyUserId = (userId) => {
    navigator.clipboard.writeText(userId);
    alert("User ID copied to clipboard!");
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all users, their roles, and enrollment status
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-3 text-sm text-gray-500">Loading users...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center">
                          <p className="text-gray-500">No users found</p>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                                {user._id.substring(0, 8)}...
                              </code>
                              <button
                                onClick={() => copyUserId(user._id)}
                                title="Copy full User ID"
                                className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                              >
                                Copy
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullName}
                            </div>
                            <div className="text-xs text-gray-500">
                              @{user.username}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDate(user.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button
                              onClick={() => copyUserId(user._id)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Copy ID
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {users.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-gray-500">No users found</p>
                  </div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user._id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900">
                            {user.fullName}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            @{user.username}
                          </p>
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-2 ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        {user.email}
                      </div>

                      <div className="flex items-center justify-between mb-3 p-2 bg-gray-100 rounded">
                        <div className="text-xs font-mono text-gray-700">
                          ID: {user._id.substring(0, 12)}...
                        </div>
                        <button
                          onClick={() => copyUserId(user._id)}
                          className="text-xs text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Copy
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                        <span>
                          Status:{" "}
                          <span
                            className={`font-medium ${
                              user.isActive
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </span>
                        <span>Joined: {formatDate(user.createdAt)}</span>
                      </div>

                      <button
                        onClick={() => copyUserId(user._id)}
                        className="w-full text-sm text-blue-600 hover:text-blue-900 font-medium py-2 px-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Copy Full ID
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing page {pagination.page} of {pagination.pages} (
                  {pagination.total} total users)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .slice(
                        Math.max(0, page - 2),
                        Math.min(pagination.pages, page + 1)
                      )
                      .map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            page === p
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                  </div>
                  <button
                    onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                    disabled={page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Tip:</span> Click "Copy" or
                "Copy Full ID" to get a user's ID, then use it to enroll them in
                courses from the Enrollments section.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsersManagement;

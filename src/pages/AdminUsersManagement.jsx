import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAllUsers } from "../API/auth.api";
import { Departments } from "../API/department.api";
import { getMyEnrollments } from "../API/enrollment.api";

export const AdminUsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const years = ["FY", "SY", "TY"];

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await Departments();
        setDepartments(res.data.departments || []);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    };
    fetchDepartments();
  }, []);

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
          department: filterDepartment !== "all" ? filterDepartment : undefined,
          year: filterYear !== "all" ? filterYear : undefined,
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
  }, [page, searchTerm, filterRole, filterDepartment, filterYear]);

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
    toast.success("User ID copied to clipboard!");
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div>
              <select
                value={filterDepartment}
                onChange={(e) => {
                  setFilterDepartment(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterYear}
                onChange={(e) => {
                  setFilterYear(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
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
            {/* Important Info Banner */}
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <span className="font-semibold">📌 To Enroll Users:</span> Copy the full User ID (MongoDB ObjectId) from below, then go to <a href="/admin/enrollments" className="text-amber-700 hover:text-amber-900 font-medium underline">Enrollments</a> to assign them to courses.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Full User ID (for Enrollment)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
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
                              <code className="text-xs bg-gray-900 text-green-400 px-3 py-2 rounded font-mono font-bold">
                                {user._id}
                              </code>
                              <button
                                onClick={() => copyUserId(user._id)}
                                title="Copy full User ID for enrollment"
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded whitespace-nowrap"
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {user.department ? user.department.name : "-"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.department ? user.department.code : ""}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.year
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {user.year || "N/A"}
                            </span>
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
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => copyUserId(user._id)}
                              className="text-blue-600 hover:text-blue-900 font-medium text-xs underline"
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

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                        <div>
                          <span className="font-semibold">Department:</span>
                          <p className="text-gray-700">{user.department ? user.department.name : "-"}</p>
                        </div>
                        <div>
                          <span className="font-semibold">Year:</span>
                          <p className="text-purple-700 font-medium">{user.year || "-"}</p>
                        </div>
                      </div>

                      <div className="mb-3 p-2 bg-gray-900 rounded border border-gray-700">
                        <div className="text-xs font-mono text-green-400 break-all font-bold">
                          {user._id}
                        </div>
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
                        className="w-full text-sm text-white font-semibold py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        Copy Full ID for Enrollment
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
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                <span className="font-semibold">✓ How to Enroll Users:</span>
              </p>
              <ol className="text-sm text-green-800 space-y-1 ml-4 list-decimal">
                <li>Find the user in the list above</li>
                <li>Click <span className="font-semibold">"Copy"</span> button to copy their full MongoDB ID (shown in dark box)</li>
                <li>Go to <a href="/admin/enrollments" className="font-semibold underline hover:text-green-900">Enrollments</a> page</li>
                <li>Select a course and click "Enroll User"</li>
                <li>Paste the copied User ID into the input field</li>
                <li>Select their role (Student/Teacher) and click "Enroll"</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsersManagement;

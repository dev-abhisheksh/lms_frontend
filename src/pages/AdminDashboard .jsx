import React, { useEffect, useState } from "react";
import { Departments } from "../API/department.api";

const AdminDashboard = () => {
    const [allDepartments, setAllDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllDepartments = async () => {
            try {
                const res = await Departments();
                setAllDepartments(res.data.departments);
            } catch (err) {
                setError("Failed to load departments");
                console.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllDepartments();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Departments</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your organization's departments</p>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                                <p className="mt-3 text-sm text-gray-500">Loading departments...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <div className="mx-auto h-12 w-12 text-red-500">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-3 text-sm text-blue-600 hover:underline"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Desktop Table View */}
                    {!loading && !error && (
                        <>
                            <div className="hidden md:block overflow-x-auto rounded-2xl">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Code
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {allDepartments.map((dept) => (
                                            <tr key={dept._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{dept.code}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-500 max-w-xs truncate">{dept.description}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${dept.isActive
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                        }`}>
                                                        {dept.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <button className="text-blue-600 hover:text-blue-900 font-medium mr-4">
                                                        Edit
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-900 font-medium">
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-gray-200">
                                {allDepartments.map((dept) => (
                                    <div key={dept._id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-base font-semibold text-gray-900">{dept.name}</h3>
                                                <p className="text-sm text-gray-500 mt-1">Code: {dept.code}</p>
                                            </div>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${dept.isActive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                }`}>
                                                {dept.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>

                                        {dept.description && (
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{dept.description}</p>
                                        )}

                                        <div className="flex gap-3 pt-3 border-t border-gray-100">
                                            <button className="flex-1 text-sm text-blue-600 hover:text-blue-900 font-medium py-2 px-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                                Edit
                                            </button>
                                            <button className="flex-1 text-sm text-red-600 hover:text-red-900 font-medium py-2 px-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Empty State */}
                            {allDepartments.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="mx-auto h-12 w-12 text-gray-400">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-3 text-sm font-medium text-gray-900">No departments</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new department.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
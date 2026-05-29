import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { myCourses } from "../API/course.api";
import { connectTestSocket, disconnectTestSocket } from "../socket/test.socket";
import { connectAssignmentSocket, disconnectAssignmentSocket } from "../socket/assignment.socket";
import { useNotifications } from "../contexts/NotificationContext";

const Grids = () => {
    const [myCoursez, setMyCoursez] = useState([])
    const [loading, setLoading] = useState(true)
    const { addNotification } = useNotifications();

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const res = await myCourses();
                const courses = res.data.courses;
                setMyCoursez(courses);

                if (courses.length > 0) {
                    const courseIds = courses.map(c => c.course._id);
                    
                    // Listen for tests
                    connectTestSocket(courseIds, {
                        onPublished: (data) => {
                            addNotification({
                                type: 'test',
                                message: data.message,
                                data: data.test
                            });
                        }
                    });

                    // Listen for assignments
                    connectAssignmentSocket(courseIds, {
                        onCreated: (data) => {
                            addNotification({
                                type: 'assignment',
                                message: `New assignment: ${data.title}`,
                                data: data
                            });
                        }
                    });
                }
            } catch (error) {
                console.error(
                    "FETCH COURSES ERROR:",
                    error.response?.data || error.message
                );
            } finally {
                setLoading(false);
            }
        };

        loadCourses();

        return () => {
            disconnectTestSocket();
            disconnectAssignmentSocket();
        };
    }, []);

    return (
        <div className="w-full h-full p-3 sm:p-4 md:p-6 bg-white rounded-lg overflow-y-scroll scrollbar-hide">

            {/* ── Section header ────────────────────────────────────────── */}
            <div className="mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    My Courses
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                    {myCoursez.length} course{myCoursez.length !== 1 ? "s" : ""} enrolled
                </p>
            </div>

            {/* ── Loading State ──────────────────────────────────────────── */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div 
                            key={i} 
                            className="bg-gray-100 rounded-lg border border-gray-200 p-4 animate-pulse h-56"
                        />
                    ))}
                </div>
            )}

            {/* ── Empty State ────────────────────────────────────────────── */}
            {myCoursez.length === 0 && !loading && (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No Courses Found</h3>
                    <p className="text-sm text-gray-600">No enrollments found. Please contact your administrator.</p>
                </div>
            )}

            {/* ── Courses Grid ────────────────────────────────────────────── */}
            {!loading && myCoursez.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {myCoursez.map((item) => (
                        <Link
                            key={item._id}
                            to={`/course/${item.course._id}`}
                            className="bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all group no-underline flex flex-col h-full overflow-hidden"
                        >
                            {/* Course Image Header */}
                            <div className="w-full h-40 overflow-hidden bg-gray-100 border-b border-gray-200 relative">
                                {item.course.image ? (
                                    <img 
                                        src={item.course.image} 
                                        alt={item.course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                        <svg className="w-10 h-10 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Course Info */}
                            <div className="flex-1 p-4 flex flex-col">
                                {/* Title & Status Badge */}
                                <div className="mb-3">
                                    <h2 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {item.course.title}
                                    </h2>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
                                    {item.course.description || "No description available"}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Click to continue</span>
                                    <svg 
                                        className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

        </div>
    );
};

export default Grids;
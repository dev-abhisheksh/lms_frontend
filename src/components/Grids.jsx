import React, { useDeferredValue, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { myCourses } from "../API/course.api";

const Grids = () => {

    const navigate = useNavigate()
    const [myCoursez, setMyCoursez] = useState([])
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        const loadCourses = async () => {
            try {
                const res = await myCourses();
                setMyCoursez(res.data.courses);
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
    }, []);



    return (
        <div className="w-full h-full p-3 sm:p-4 md:p-6 bg-gray-50 rounded-xl overflow-y-scroll scrollbar-hide">

            {/* Section header */}
            <div className="mb-4 sm:mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    My Courses
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Courses you are currently enrolled in
                </p>
            </div>

            {/* Empty State */}
            {myCoursez.length === 0 && !loading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
                    <p className="text-sm text-gray-500">No enrollments found. Please contact your administrator.</p>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {myCoursez.map((item) => (
                    <Link
                        key={item._id}
                        to={`/course/${item.course._id}`}
                        className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:shadow-md hover:border-[#7034FF]/30 transition-all group no-underline"
                    >
                        {/* Course Image */}
                        <div className="w-full h-32 sm:h-40 rounded-lg overflow-hidden mb-4">
                            {item.course.image ? (
                                <img 
                                    src={item.course.image} 
                                    alt={item.course.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#7034FF] to-purple-600 flex items-center justify-center">
                                    <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Course Content */}
                        <div className="flex flex-col">
                            <div className="flex items-start justify-between mb-3">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug group-hover:text-[#7034FF] transition-colors flex-1">
                                    {item.course.title}
                                </h2>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium ml-2 flex-shrink-0">
                                    Enrolled
                                </span>
                            </div>

                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
                                {item.course.description || "No description available"}
                            </p>

                            {/* Footer */}
                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Continue Learning
                                </span>
                                <svg
                                    className="w-5 h-5 text-gray-400 group-hover:text-[#7034FF] group-hover:translate-x-1 transition-all"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>


        </div>
    );
};

export default Grids;
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { myCourses } from "../API/course.api";
import { 
    MdOutlineSchool, 
    MdOutlineCollectionsBookmark, 
    MdOutlineTrendingUp,
    MdOutlinePlayCircleOutline,
    MdChevronRight
} from "react-icons/md";

const Grids = () => {
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

    const stats = [
        { label: "Active Courses", value: myCoursez.length, icon: MdOutlineSchool, color: "bg-indigo-50 text-indigo-600" },
        { label: "Resources", value: "24", icon: MdOutlineCollectionsBookmark, color: "bg-blue-50 text-blue-600" },
        { label: "Progress", value: "78%", icon: MdOutlineTrendingUp, color: "bg-green-50 text-green-600" },
    ];

    if (loading) {
        return (
            <div className="w-full h-full p-3 sm:p-6 bg-[#F9FAFB] overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-slate-100" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-slate-100" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-3 sm:p-6 bg-[#F9FAFB] overflow-y-auto scrollbar-hide">
            {/* ── Page Header ────────────────────────────────────────── */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                        My Courses
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                        Welcome back! You have {myCoursez.length} active enrollments.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                        Session: Summer 2026
                    </span>
                </div>
            </div>

            {/* ── Stat Cards (Horizontal & Compact) ─────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">
                                {stat.label}
                            </span>
                            <span className="text-lg font-black text-slate-900 leading-none">
                                {stat.value}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Empty State ────────────────────────────────────────────── */}
            {myCoursez.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 mx-auto mb-6 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                        <MdOutlineSchool size={32} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">No Enrolled Courses</h3>
                    <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
                        You are not currently enrolled in any courses. Please contact the academic office for registration.
                    </p>
                </div>
            )}

            {/* ── Courses Grid ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCoursez.map((item) => (
                    <Link
                        key={item._id}
                        to={`/course/${item.course._id}`}
                        className="bg-white border border-slate-100 rounded-[24px] overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 hover:scale-[1.01] transition-all group flex flex-col h-full shadow-sm"
                    >
                        {/* Course Image Header */}
                        <div className="w-full h-44 overflow-hidden bg-slate-100 relative">
                            {item.course.image ? (
                                <img 
                                    src={item.course.image} 
                                    alt={item.course.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10">
                                        <MdOutlineSchool className="w-full h-full scale-150 rotate-12" />
                                    </div>
                                    <MdOutlinePlayCircleOutline className="w-12 h-12 text-white/80 relative z-10" />
                                </div>
                            )}
                            {/* Metadata Badge */}
                            <div className="absolute top-4 left-4">
                                <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-lg">
                                    {item.course.courseCode || "CRS-101"}
                                </span>
                            </div>
                        </div>

                        {/* Course Info */}
                        <div className="flex-1 p-6 flex flex-col">
                            <div className="flex items-start justify-between mb-3">
                                <h2 className="text-base font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                    {item.course.title}
                                </h2>
                            </div>

                            <p className="text-xs sm:text-sm font-medium text-slate-500 line-clamp-2 mb-6 flex-grow leading-relaxed">
                                {item.course.description || "No course description available at this moment. Click to explore the curriculum."}
                            </p>

                            {/* Footer / Action */}
                            <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <MdOutlinePlayCircleOutline size={18} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Continue Learning
                                    </span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <MdChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Grids;
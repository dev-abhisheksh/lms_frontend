import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { myCourses } from "../../API/course.api";
import { getTestsByCourse, getMyTestSubmissions } from "../../API/test.api";
import {
    MdQuiz,
    MdAccessTime,
    MdGrade,
    MdCheckCircle,
    MdPlayArrow,
    MdMenuBook,
    MdCalendarToday,
    MdOutlineInfo,
    MdChevronRight
} from "react-icons/md";
import { connectTestSocket, disconnectTestSocket } from "../../socket/test.socket";

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
    <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">{label}</p>
            <p className="text-lg font-black text-slate-900 leading-tight">{value}</p>
        </div>
    </div>
);

const StudentTests = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [tests, setTests] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState("all");

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [coursesRes, subsRes] = await Promise.all([
                    myCourses(),
                    getMyTestSubmissions()
                ]);

                const enrolledCourses = coursesRes.data.courses || [];
                setCourses(enrolledCourses);
                setSubmissions(subsRes.data.submissions || []);

                // Load tests for all courses
                const testPromises = enrolledCourses.map(c => getTestsByCourse(c.course._id));
                const testsRes = await Promise.all(testPromises);
                const allTests = testsRes.flatMap(res => res.data.tests || []);
                setTests(allTests);

                const courseIds = enrolledCourses.map(c => c.course._id);
                connectTestSocket(courseIds, {
                    onPublished: (data) => {
                        setTests(prev => {
                            const exists = prev.find(t => t._id === data.test._id);
                            if (exists) return prev;
                            return [data.test, ...prev];
                        });
                    },
                    onUnpublished: (data) => {
                        setTests(prev => prev.filter(t => t._id !== data.testId));
                    },
                    onUpdated: (data) => {
                        setTests(prev => prev.map(t => t._id === data.test._id ? data.test : t));
                    },
                    onDeleted: (data) => {
                        setTests(prev => prev.filter(t => t._id !== data.testId));
                    }
                });

            } catch (error) {
                console.error("Error loading student tests:", error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
        return () => disconnectTestSocket();
    }, []);

    const filteredTests = selectedCourse === "all"
        ? tests
        : tests.filter(t => t.course === selectedCourse);

    const getTestStatus = (testId) => {
        const sub = submissions.find(s => s.test._id === testId);
        return sub ? { status: "completed", score: sub.score, total: sub.totalMarks, graded: sub.status === "graded" } : { status: "pending" };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] p-3 sm:p-6 space-y-6 animate-pulse">
                <div className="space-y-2">
                    <div className="h-8 bg-slate-100 rounded-lg w-64"></div>
                    <div className="h-4 bg-slate-100 rounded-lg w-96"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 h-96 bg-white rounded-2xl border border-slate-100"></div>
                    <div className="lg:col-span-8 h-96 bg-white rounded-2xl border border-slate-100"></div>
                </div>
            </div>
        );
    }

    const avgScore = submissions.length > 0
        ? Math.round((submissions.reduce((acc, curr) => acc + (curr.score / curr.totalMarks), 0) / submissions.length) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-[#F9FAFB] p-3 sm:p-6 antialiased font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* ── Page Header ── */}
                <header>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Assessments Hub</h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Track your academic progress and upcoming tests</p>
                </header>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard 
                        icon={MdQuiz} 
                        label="Total Assessments" 
                        value={tests.length} 
                        colorClass="bg-indigo-50 text-indigo-600" 
                    />
                    <StatCard 
                        icon={MdCheckCircle} 
                        label="Completed" 
                        value={submissions.length} 
                        colorClass="bg-green-50 text-green-600" 
                    />
                    <StatCard 
                        icon={MdGrade} 
                        label="Average Performance" 
                        value={`${avgScore}%`} 
                        colorClass="bg-amber-50 text-amber-600" 
                    />
                </div>

                {/* ── Master-Detail Layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Master: Sidebar (lg:col-span-4) */}
                    <aside className="lg:col-span-4 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                                    <MdMenuBook className="w-5 h-5 text-indigo-600" />
                                    Your Courses
                                </h2>
                            </div>
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={() => setSelectedCourse("all")}
                                    className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                                        selectedCourse === "all" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "hover:bg-slate-50 text-slate-600"
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedCourse === "all" ? "bg-white/20" : "bg-slate-100"}`}>
                                        <MdQuiz className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold truncate">All Assessments</p>
                                        <p className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${selectedCourse === "all" ? "text-white/70" : "text-slate-400"}`}>
                                            {tests.length} Total
                                        </p>
                                    </div>
                                </button>

                                {courses.map((c) => (
                                    <button
                                        key={c.course._id}
                                        onClick={() => setSelectedCourse(c.course._id)}
                                        className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                                            selectedCourse === c.course._id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "hover:bg-slate-50 text-slate-600"
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedCourse === c.course._id ? "bg-white/20" : "bg-slate-100"}`}>
                                            <span className="font-black text-[10px] uppercase tracking-tighter">{c.course.courseCode?.slice(0, 3)}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold truncate">{c.course.title}</p>
                                            <p className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${selectedCourse === c.course._id ? "text-white/70" : "text-slate-400"}`}>
                                                {c.course.courseCode}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Detail Area (lg:col-span-8) */}
                    <main className="lg:col-span-8">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[500px] overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 truncate pr-4">
                                    {selectedCourse === "all" ? "Active Assessments" : courses.find(c => c.course._id === selectedCourse)?.course.title}
                                </h3>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 shrink-0">
                                    {filteredTests.length} Tests
                                </span>
                            </div>

                            <div className="flex-1 p-4 sm:p-6">
                                {filteredTests.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                                            <MdQuiz className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900">No assessments scheduled</h4>
                                        <p className="text-xs font-medium text-slate-500 mt-1 max-w-xs mx-auto">Check back later or contact your instructor for upcoming quizzes.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredTests.map((test) => {
                                            const status = getTestStatus(test._id);
                                            const isCompleted = status.status === 'completed';
                                            
                                            return (
                                                <div 
                                                    key={test._id} 
                                                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group cursor-default"
                                                >
                                                    {/* Leading */}
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                                        isCompleted ? "bg-green-50 text-green-600" : "bg-indigo-50 text-indigo-600"
                                                    }`}>
                                                        <MdQuiz className="w-5 h-5" />
                                                    </div>

                                                    {/* Center */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <h4 className="text-sm font-bold text-slate-900 truncate">{test.title}</h4>
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">
                                                                {test.type}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                                                                <MdAccessTime className="w-3 h-3" />
                                                                {test.duration}m
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                                                                <MdGrade className="w-3 h-3" />
                                                                {test.totalMarks} Pts
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Trailing */}
                                                    <div className="shrink-0">
                                                        {isCompleted ? (
                                                            <div className="text-right">
                                                                <p className="text-[8px] font-black uppercase text-green-600 mb-0.5 tracking-widest">Completed</p>
                                                                <div className="flex items-baseline justify-end gap-1">
                                                                    <span className="text-lg font-black text-slate-900">{status.score}</span>
                                                                    <span className="text-[10px] font-bold text-slate-300">/ {status.total}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => navigate(`/student/take-test/${test._id}`)}
                                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm flex items-center gap-1"
                                                            >
                                                                Start
                                                                <MdPlayArrow className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default StudentTests;

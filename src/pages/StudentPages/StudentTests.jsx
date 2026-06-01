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
    MdOutlineInfo
} from "react-icons/md";
import { connectTestSocket, disconnectTestSocket } from "../../socket/test.socket";

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
            <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-8 space-y-8 animate-pulse">
                <div className="h-10 bg-slate-200 rounded-xl w-64"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-white rounded-[32px] border border-slate-100"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 h-[500px] bg-white rounded-[32px] border border-slate-100"></div>
                    <div className="lg:col-span-8 h-[500px] bg-white rounded-[32px] border border-slate-100"></div>
                </div>
            </div>
        );
    }

    const avgScore = submissions.length > 0
        ? Math.round((submissions.reduce((acc, curr) => acc + (curr.score / curr.totalMarks), 0) / submissions.length) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* ── Page Header ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Assessments Hub</h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">Track your academic progress and upcoming tests</p>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <MdQuiz className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Assessments</p>
                            <p className="text-2xl font-bold text-slate-900">{tests.length}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                            <MdCheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Completed</p>
                            <p className="text-2xl font-bold text-slate-900">{submissions.length}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                            <MdGrade className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Average Performance</p>
                            <p className="text-2xl font-bold text-slate-900">{avgScore}%</p>
                        </div>
                    </div>
                </div>

                {/* ── Master-Detail Layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Master: Sidebar (lg:col-span-4) */}
                    <aside className="lg:col-span-4 space-y-4">
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
                            <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-6 flex items-center gap-2">
                                <MdMenuBook className="w-5 h-5 text-indigo-600" />
                                Your Courses
                            </h2>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedCourse("all")}
                                    className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-3 ${
                                        selectedCourse === "all" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "hover:bg-slate-50 text-slate-600"
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedCourse === "all" ? "bg-white/20" : "bg-slate-100"}`}>
                                        <MdQuiz className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">All Assessments</p>
                                        <p className={`text-[10px] font-black uppercase tracking-wider ${selectedCourse === "all" ? "text-white/70" : "text-slate-400"}`}>
                                            {tests.length} Total
                                        </p>
                                    </div>
                                </button>

                                {courses.map((c) => (
                                    <button
                                        key={c.course._id}
                                        onClick={() => setSelectedCourse(c.course._id)}
                                        className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-3 ${
                                            selectedCourse === c.course._id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "hover:bg-slate-50 text-slate-600"
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedCourse === c.course._id ? "bg-white/20" : "bg-slate-100"}`}>
                                            <span className="font-bold text-xs">{c.course.courseCode?.slice(0, 2)}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold truncate">{c.course.title}</p>
                                            <p className={`text-[10px] font-black uppercase tracking-wider ${selectedCourse === c.course._id ? "text-white/70" : "text-slate-400"}`}>
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
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm min-h-[500px] overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                                    {selectedCourse === "all" ? "All Available Tests" : courses.find(c => c.course._id === selectedCourse)?.course.title}
                                </h3>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                    {filteredTests.length} Items Found
                                </span>
                            </div>

                            <div className="p-8">
                                {filteredTests.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 mb-6">
                                            <MdQuiz className="w-10 h-10" />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900">No assessments scheduled</h4>
                                        <p className="text-sm font-medium text-slate-500 mt-2 max-w-xs">Check back later or contact your instructor for upcoming quizzes.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredTests.map((test) => {
                                            const status = getTestStatus(test._id);
                                            const isCompleted = status.status === 'completed';
                                            
                                            return (
                                                <div 
                                                    key={test._id} 
                                                    className="group flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-[32px] border border-slate-100 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-slate-200/50 hover:bg-slate-50/50"
                                                >
                                                    {/* Leading */}
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                                                        isCompleted ? "bg-green-50 text-green-600" : "bg-indigo-50 text-indigo-600"
                                                    }`}>
                                                        <MdQuiz className="w-7 h-7" />
                                                    </div>

                                                    {/* Center */}
                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="text-sm font-bold text-slate-900">{test.title}</h4>
                                                            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                                                {test.type}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs font-medium text-slate-500 line-clamp-1">{test.description}</p>
                                                        <div className="flex items-center gap-4 pt-1">
                                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                                <MdAccessTime className="w-3.5 h-3.5" />
                                                                <span className="text-[10px] font-bold uppercase">{test.duration}m</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                                <MdGrade className="w-3.5 h-3.5" />
                                                                <span className="text-[10px] font-bold uppercase">{test.totalMarks} Points</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Trailing */}
                                                    <div className="flex items-center gap-4 shrink-0">
                                                        {isCompleted ? (
                                                            <div className="text-right">
                                                                <p className="text-xs font-bold text-green-600 mb-1">Completed</p>
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-xl font-black text-slate-900">{status.score}</span>
                                                                    <span className="text-xs font-bold text-slate-400">/ {status.total}</span>
                                                                </div>
                                                                {!status.graded && (
                                                                    <p className="text-[8px] font-black uppercase text-amber-500 tracking-wider">Pending Grade</p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => navigate(`/student/take-test/${test._id}`)}
                                                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center gap-2 group-hover:scale-105"
                                                            >
                                                                Start Test
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

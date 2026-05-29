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
        return sub ? { status: "completed", score: sub.score, total: sub.totalMarks } : { status: "pending" };
    };

    if (loading) {
        return (
            <div className="p-8 animate-pulse space-y-6">
                <div className="h-10 bg-gray-200 rounded-lg w-48"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 bg-gray-100 rounded-2xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Available Assessments</h1>
                    <p className="text-gray-500 font-medium mt-1">Take your quizzes and track your performance</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                    <MdMenuBook className="text-gray-400 ml-2" />
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none pr-4"
                    >
                        <option value="all">All Courses</option>
                        {courses.map(c => (
                            <option key={c.course._id} value={c.course._id}>{c.course.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
                    <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-2">Total Tests</p>
                    <p className="text-4xl font-black">{tests.length}</p>
                </div>
                <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-100">
                    <p className="text-emerald-100 text-xs font-black uppercase tracking-widest mb-2">Completed</p>
                    <p className="text-4xl font-black">{submissions.length}</p>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Average Score</p>
                    <p className="text-4xl font-black text-gray-900">
                        {submissions.length > 0
                            ? Math.round((submissions.reduce((acc, curr) => acc + (curr.score / curr.totalMarks), 0) / submissions.length) * 100)
                            : 0}%
                    </p>
                </div>
            </div>

            {/* Tests Grid */}
            {filteredTests.length === 0 ? (
                <div className="bg-gray-50 rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
                    <MdQuiz className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">No tests available</h3>
                    <p className="text-gray-500">There are no assessments scheduled for this selection.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTests.map((test) => {
                        const status = getTestStatus(test._id);
                        const course = courses.find(c => c.course._id === test.course)?.course;

                        return (
                            <div key={test._id} className="group bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500'}`}>
                                        <MdQuiz className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        {test.type}
                                    </span>
                                </div>

                                <div className="space-y-2 flex-1">
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{course?.title}</p>
                                    <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                        {test.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2">{test.description}</p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <MdAccessTime className="w-4 h-4" />
                                            <span className="text-xs font-bold">{test.duration}m</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <MdGrade className="w-4 h-4" />
                                            <span className="text-xs font-bold">{test.totalMarks}pts</span>
                                        </div>
                                    </div>

                                    {status.status === 'completed' ? (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                            <MdCheckCircle className="w-4 h-4" />
                                            <span className="text-xs font-black uppercase tracking-widest">{status.score}/{status.total}</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => navigate(`/student/take-test/${test._id}`)}
                                            className="px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-indigo-600 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2 group/btn"
                                        >
                                            Start
                                            <MdPlayArrow className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentTests;

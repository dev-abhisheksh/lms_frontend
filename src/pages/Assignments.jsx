import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getAssignments } from '../API/assignment.api';
import { myCourses } from '../API/course.api';
import { mySubmissions } from '../API/submission.api';
import { 
    MdAssignment, 
    MdCalendarToday, 
    MdCheckCircle, 
    MdPending, 
    MdGrade, 
    MdRefresh, 
    MdError, 
    MdClose,
    MdSearch,
    MdFilterList,
    MdOutlineLibraryBooks,
    MdArrowForward,
    MdTimer,
    MdOutlineInfo,
    MdChevronRight
} from 'react-icons/md';
import { connectAssignmentSocket, disconnectAssignmentSocket } from '../socket/assignment.socket';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
    <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{label}</p>
            <p className="text-lg font-black text-slate-900 leading-tight">{value}</p>
        </div>
    </div>
);

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, submitted, graded
    const [searchTerm, setSearchTerm] = useState("");
    const socketConnected = useRef(false);
    
    const navigate = useNavigate();

    // ─── Fetch enrolled course IDs (for socket rooms) ──────────────────
    useEffect(() => {
        const loadCourseIds = async () => {
            try {
                const res = await myCourses();
                const enrollments = res.data?.courses || [];
                const ids = enrollments
                    .filter(e => e.course?._id)
                    .map(e => e.course._id);
                setEnrolledCourseIds(ids);
            } catch (err) {
                console.error("Error fetching enrolled courses for socket:", err);
            }
        };
        loadCourseIds();
    }, []);

    // ─── Fetch assignments ─────────────────────────────────────────────
    const fetchAssignments = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setIsRefreshing(true);
            else setInitialLoading(true);

            setError(null);
            const [assignmentsRes, submissionsRes] = await Promise.all([
                getAssignments(),
                mySubmissions().catch(() => ({ data: { submissions: [] } }))
            ]);

            if (assignmentsRes.data?.assignments) {
                const fetchedAssignments = assignmentsRes.data.assignments;
                const fetchedSubmissions = submissionsRes.data?.submissions || [];
                
                const submissionsMap = fetchedSubmissions.reduce((acc, sub) => {
                    const assignId = sub.assignment?._id || sub.assignment;
                    acc[assignId] = {
                        status: sub.status,
                        submissionId: sub._id,
                        grade: sub.grade
                    };
                    return acc;
                }, {});
                
                const mergedAssignments = fetchedAssignments.map(a => {
                    const subInfo = submissionsMap[a._id];
                    if (subInfo) {
                        return { ...a, submissionStatus: subInfo.status, submissionId: subInfo.submissionId, grade: subInfo.grade };
                    }
                    return { ...a, submissionStatus: 'pending' };
                });

                setAssignments(mergedAssignments);
            } else {
                setAssignments([]);
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
            setError(error.response?.data?.message || "Failed to load assignments.");
        } finally {
            if (isRefresh) setIsRefreshing(false);
            else setInitialLoading(false);
        }
    }, []);

    // ─── Initial load ──────────────────────────────────────────────────
    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    // ─── Setup Socket.IO connection ─────────────────────────────────────
    useEffect(() => {
        if (initialLoading || enrolledCourseIds.length === 0) return;
        if (socketConnected.current) return;
        socketConnected.current = true;

        connectAssignmentSocket(
            enrolledCourseIds,
            {
                onCreated: (assignment) => {
                    setAssignments(prev => {
                        if (!assignment.isPublished) return prev;
                        if (prev.some(a => a._id === assignment._id)) return prev;
                        return [assignment, ...prev];
                    });
                },
                onUpdated: (assignment) => {
                    setAssignments(prev => {
                        const exists = prev.some(a => a._id === assignment._id);
                        if (exists) {
                            if (!assignment.isPublished) return prev.filter(a => a._id !== assignment._id);
                            return prev.map(a => a._id === assignment._id ? assignment : a);
                        } else if (assignment.isPublished) {
                            return [assignment, ...prev];
                        }
                        return prev;
                    });
                },
                onDeleted: ({ assignmentId }) => {
                    setAssignments(prev => prev.filter(a => a._id !== assignmentId));
                }
            }
        );

        return () => {
            socketConnected.current = false;
            disconnectAssignmentSocket();
        };
    }, [initialLoading, enrolledCourseIds]);

    const filteredAssignments = assignments.filter(a => {
        const matchesFilter = filter === 'all' || a.submissionStatus === filter;
        const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (a.course?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const getStatusStyle = (assignment) => {
        switch (assignment.submissionStatus) {
            case 'submitted':
                return { label: 'Submitted', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: MdCheckCircle };
            case 'late':
                return { label: 'Late', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: MdTimer };
            case 'graded':
                return { label: 'Graded', color: 'bg-green-50 text-green-600 border-green-100', icon: MdGrade };
            default:
                return { label: 'Pending', color: 'bg-slate-50 text-slate-400 border-slate-100', icon: MdPending };
        }
    };

    const isOverdue = (dueDate) => new Date(dueDate) < new Date();

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] p-3 sm:p-6 space-y-6 animate-pulse">
                <div className="flex justify-between items-center h-12">
                    <div className="h-8 bg-slate-100 rounded-lg w-48"></div>
                    <div className="h-10 bg-slate-100 rounded-xl w-32"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 bg-white rounded-2xl border border-slate-100"></div>
                    ))}
                </div>
                <div className="space-y-3 pt-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-20 bg-white rounded-2xl border border-slate-100"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] p-3 sm:p-6 antialiased font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* ── Page Header ── */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Task Center</h1>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Manage your coursework and upcoming deadlines</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={() => fetchAssignments(true)}
                            className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
                            title="Refresh List"
                        >
                            <MdRefresh className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <StatCard 
                            icon={MdAssignment} 
                            label="Active Tasks" 
                            value={assignments.length} 
                            colorClass="bg-indigo-50 text-indigo-600" 
                        />
                    </div>
                </header>

                {/* ── Filters & Search ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-8 bg-white p-2 px-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <MdSearch className="w-5 h-5 text-slate-300" />
                        <input 
                            type="text" 
                            placeholder="Search tasks..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 bg-transparent text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-300"
                        />
                    </div>

                    <div className="lg:col-span-4 bg-white p-2 px-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <MdFilterList className="w-5 h-5 text-slate-300" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="flex-1 bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer appearance-none"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending Only</option>
                            <option value="submitted">Turned In</option>
                            <option value="graded">Evaluated</option>
                        </select>
                    </div>
                </div>

                {/* ── Main Content ── */}
                <div className="space-y-3">
                    {filteredAssignments.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-6">
                                <MdOutlineLibraryBooks className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">No Assignments Located</h3>
                            <p className="text-xs font-medium text-slate-500 mt-2 max-w-xs mx-auto">Check back later or adjust your filters for more results.</p>
                        </div>
                    ) : (
                        filteredAssignments.map((assignment) => {
                            const style = getStatusStyle(assignment);
                            const overdue = isOverdue(assignment.dueDate) && assignment.submissionStatus === 'pending';
                            const courseTitle = assignment.course?.title || 'Course';

                            return (
                                <div
                                    key={assignment._id}
                                    onClick={() => {
                                        if (['submitted', 'graded', 'late'].includes(assignment.submissionStatus)) {
                                            navigate(`/submissions/${assignment.submissionId}`);
                                        } else {
                                            navigate(`/assignments/${assignment._id}`);
                                        }
                                    }}
                                    className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 hover:border-indigo-100 hover:shadow-md transition-all group flex items-center gap-4 cursor-pointer relative overflow-hidden"
                                >
                                    {/* Left: Icon Badge */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${overdue ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                                        <MdAssignment className="w-6 h-6" />
                                    </div>

                                    {/* Center: Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="text-sm font-bold text-slate-900 truncate">{assignment.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-1 ${style.color} ${style.border} ${style.bg}`}>
                                                <style.icon className="w-2.5 h-2.5" />
                                                {style.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px]">
                                                {courseTitle}
                                            </p>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                                <MdCalendarToday className={`w-3 h-3 ${overdue ? 'text-rose-500' : 'text-slate-300'}`} />
                                                <span className={overdue ? 'text-rose-600' : ''}>{formatDate(assignment.dueDate)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Metrics & Action */}
                                    <div className="flex items-center gap-6 shrink-0">
                                        <div className="hidden sm:block text-right">
                                            <p className="text-[8px] font-black uppercase text-slate-300 tracking-widest">Weightage</p>
                                            <p className="text-xs font-black text-slate-900">{assignment.maxMarks || 100} pts</p>
                                        </div>
                                        {assignment.submissionStatus === 'graded' && (
                                            <div className="text-right">
                                                <p className="text-[8px] font-black uppercase text-green-600 tracking-widest">Score</p>
                                                <p className="text-sm font-black text-slate-900 leading-none mt-0.5">{assignment.grade} <span className="text-[10px] text-slate-300">/ {assignment.maxMarks}</span></p>
                                            </div>
                                        )}
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <MdChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* ── Real-time Tip ── */}
                {!initialLoading && filteredAssignments.length > 0 && (
                    <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 flex items-center gap-3 max-w-2xl mx-auto">
                         <MdOutlineInfo className="w-5 h-5 text-indigo-400 shrink-0" />
                         <p className="text-[10px] font-bold text-indigo-700/70 leading-relaxed uppercase tracking-widest">
                            Real-time synchronization active. New tasks will appear instantly.
                         </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Assignments;

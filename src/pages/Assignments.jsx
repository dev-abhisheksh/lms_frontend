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
    MdDownload, 
    MdRefresh, 
    MdError, 
    MdClose,
    MdSearch,
    MdFilterList,
    MdOutlineLibraryBooks,
    MdArrowForward,
    MdTimer,
    MdOutlineInfo
} from 'react-icons/md';
import { connectAssignmentSocket, disconnectAssignmentSocket } from '../socket/assignment.socket';
import { useNavigate } from 'react-router-dom';

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, submitted, graded
    const [sortBy, setSortBy] = useState('dueDate'); // dueDate, title
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
            setError(error.response?.data?.message || "Failed to load assignments. Please try again.");
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

    // ─── Filter & Sort Logic ───────────────────────────────────────────
    const filteredAssignments = assignments.filter(a => {
        const matchesFilter = filter === 'all' || a.submissionStatus === filter;
        const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (a.course?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    }).sort((a, b) => {
        if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
    });

    // ─── UI Helpers ────────────────────────────────────────────────────
    const getStatusBadge = (assignment) => {
        switch (assignment.submissionStatus) {
            case 'submitted':
                return { label: 'Submitted', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: MdCheckCircle };
            case 'late':
                return { label: 'Late', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: MdTimer };
            case 'graded':
                return { label: 'Graded', color: 'bg-green-50 text-green-600 border-green-100', icon: MdGrade };
            default:
                return { label: 'Pending', color: 'bg-slate-50 text-slate-500 border-slate-100', icon: MdPending };
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

    return (
        <div className='min-h-screen bg-[#F9FAFB] p-4 sm:p-6 lg:p-8'>
            <div className='max-w-7xl mx-auto space-y-8'>
                
                {/* ── Page Header ── */}
                <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
                    <div>
                        <h1 className='text-3xl font-extrabold tracking-tight text-slate-900'>Assignments</h1>
                        <p className='text-sm font-medium text-slate-500 mt-1'>
                            Track your coursework, deadlines, and submissions
                        </p>
                    </div>

                    <div className='flex gap-3'>
                        <button
                            onClick={() => fetchAssignments(true)}
                            className='w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all shadow-sm'
                        >
                            <MdRefresh className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <div className='hidden sm:flex items-center gap-3 px-6 bg-white border border-slate-200 rounded-2xl shadow-sm'>
                            <div className='w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600'>
                                <MdAssignment className='w-5 h-5' />
                            </div>
                            <div>
                                <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>Total Tasks</p>
                                <p className='text-sm font-bold text-slate-900'>{assignments.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Filters & Search ── */}
                <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-center'>
                    <div className='lg:col-span-8 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4'>
                        <MdSearch className='w-5 h-5 text-slate-300 ml-2' />
                        <input 
                            type="text" 
                            placeholder="Search by assignment title or course..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 bg-transparent text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-300 placeholder:font-medium"
                        />
                    </div>

                    <div className='lg:col-span-4 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4'>
                        <MdFilterList className='w-5 h-5 text-slate-300 ml-2' />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="flex-1 bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="submitted">Submitted</option>
                            <option value="graded">Graded</option>
                        </select>
                    </div>
                </div>

                {/* ── Error State ── */}
                {error && (
                    <div className='bg-rose-50 border border-rose-100 rounded-3xl p-6 flex items-start gap-4 animate-in fade-in zoom-in duration-150'>
                        <div className='w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm shrink-0'>
                            <MdError className='w-6 h-6' />
                        </div>
                        <div className='flex-1'>
                            <h3 className='text-rose-900 font-bold'>Unable to load assignments</h3>
                            <p className='text-rose-700 text-sm font-medium mt-1'>{error}</p>
                            <button onClick={() => fetchAssignments(true)} className='mt-3 text-rose-600 font-black text-[10px] uppercase tracking-widest hover:underline'>
                                Try Again →
                            </button>
                        </div>
                        <button onClick={() => setError(null)} className='text-rose-400 hover:text-rose-600'>
                            <MdClose className='w-5 h-5' />
                        </button>
                    </div>
                )}

                {/* ── Main Content ── */}
                <div className='grid grid-cols-1 gap-6'>
                    {initialLoading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className='bg-white rounded-[32px] h-32 border border-slate-100 animate-pulse' />
                        ))
                    ) : filteredAssignments.length === 0 ? (
                        <div className='bg-white rounded-[40px] border border-slate-100 p-20 text-center shadow-sm flex flex-col items-center justify-center'>
                            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 mb-8">
                                <MdOutlineLibraryBooks className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">No Assignments Found</h3>
                            <p className="text-sm font-medium text-slate-500 mt-3 max-w-sm mx-auto leading-relaxed">
                                You don't have any assignments matching the current filters.
                            </p>
                        </div>
                    ) : (
                        filteredAssignments.map((assignment) => {
                            const badge = getStatusBadge(assignment);
                            const overdue = isOverdue(assignment.dueDate) && assignment.submissionStatus === 'pending';
                            const courseTitle = assignment.course?.title || assignment.courseId?.title || 'Course';

                            return (
                                <div
                                    key={assignment._id}
                                    className='bg-white rounded-[32px] border border-slate-100 p-6 sm:p-8 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden'
                                >
                                    {/* Status Indicator Strip */}
                                    <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${overdue ? 'bg-rose-500' : 'bg-transparent'}`}></div>

                                    {/* Left: Icon & Title */}
                                    <div className='flex items-center gap-6 flex-1 min-w-0'>
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all ${overdue ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'}`}>
                                            <MdAssignment className='w-7 h-7' />
                                        </div>
                                        <div className='min-w-0'>
                                            <div className='flex items-center gap-3 flex-wrap mb-1'>
                                                <h3 className='text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-md'>
                                                    {assignment.title}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${badge.color}`}>
                                                    <badge.icon className='w-3 h-3' />
                                                    {badge.label}
                                                </span>
                                            </div>
                                            <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>
                                                {courseTitle}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Center: Metadata */}
                                    <div className='flex items-center gap-8 sm:gap-12 flex-wrap'>
                                        <div className='space-y-1'>
                                            <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>Due Date</p>
                                            <div className='flex items-center gap-2'>
                                                <MdCalendarToday className={`w-4 h-4 ${overdue ? 'text-rose-500' : 'text-slate-400'}`} />
                                                <p className={`text-sm font-bold ${overdue ? 'text-rose-600' : 'text-slate-900'}`}>
                                                    {formatDate(assignment.dueDate)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className='space-y-1'>
                                            <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>Points</p>
                                            <div className='flex items-center gap-2'>
                                                <MdGrade className='w-4 h-4 text-slate-400' />
                                                <p className='text-sm font-bold text-slate-900'>{assignment.maxMarks || 100}</p>
                                            </div>
                                        </div>

                                        {assignment.submissionStatus === 'graded' && (
                                            <div className='space-y-1'>
                                                <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>Result</p>
                                                <p className='text-sm font-black text-green-600'>{assignment.grade} / {assignment.maxMarks}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Action */}
                                    <button 
                                        onClick={() => {
                                            if (assignment.submissionStatus === 'submitted' || assignment.submissionStatus === 'graded' || assignment.submissionStatus === 'late') {
                                                navigate(`/submissions/${assignment.submissionId}`);
                                            } else {
                                                navigate(`/assignments/${assignment._id}`);
                                            }
                                        }}
                                        className='px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.05] active:scale-95 transition-all shrink-0'
                                    >
                                        {assignment.submissionStatus === 'pending' ? 'Go to Task' : 'View Work'}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* ── Help Tip ── */}
                {!initialLoading && filteredAssignments.length > 0 && (
                    <div className='bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100/50 flex items-center gap-4 max-w-3xl mx-auto'>
                         <div className='w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0'>
                            <MdOutlineInfo className='w-5 h-5' />
                         </div>
                         <p className='text-xs font-medium text-indigo-700/70 leading-relaxed'>
                            Assignments are updated in real-time. If a new task is published by your teacher, it will appear here instantly without needing to refresh.
                         </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Assignments;

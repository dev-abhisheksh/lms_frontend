import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getAssignments } from '../API/assignment.api';
import { myCourses } from '../API/course.api';
import { mySubmissions } from '../API/submission.api';
import { MdAssignment, MdCalendarToday, MdCheckCircle, MdPending, MdGrade, MdDownload, MdRefresh, MdError, MdClose } from 'react-icons/md';
import { connectAssignmentSocket, disconnectAssignmentSocket } from '../socket/assignment.socket';
import { useNavigate } from 'react-router-dom';
import SubmissionModal from './StudentPages/SubmissionModal';

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, submitted, graded
    const [sortBy, setSortBy] = useState('dueDate'); // dueDate, title
    const socketConnected = useRef(false);
    
    const navigate = useNavigate();
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                console.log(`✅ Loaded ${assignmentsRes.data.count || 0} assignments`);
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

    // ─── Setup Socket.IO connection for real-time updates ──────────────
    useEffect(() => {
        // Wait until we have enrolled course IDs and initial load is done
        if (initialLoading || enrolledCourseIds.length === 0) return;

        // Prevent duplicate connections
        if (socketConnected.current) return;
        socketConnected.current = true;

        connectAssignmentSocket(
            enrolledCourseIds,
            {
                // onCreated — a new assignment was published
                onCreated: (assignment) => {
                    setAssignments(prev => {
                        // Don't add if it already exists or isn't published
                        if (!assignment.isPublished) return prev;
                        if (prev.some(a => a._id === assignment._id)) return prev;
                        return [assignment, ...prev];
                    });
                },
                // onUpdated — assignment was toggled or edited
                onUpdated: (assignment) => {
                    setAssignments(prev => {
                        const exists = prev.some(a => a._id === assignment._id);
                        if (exists) {
                            if (!assignment.isPublished) {
                                // Unpublished → remove from student view
                                return prev.filter(a => a._id !== assignment._id);
                            }
                            // Update in place
                            return prev.map(a => a._id === assignment._id ? assignment : a);
                        } else if (assignment.isPublished) {
                            // Newly published, add to list
                            return [assignment, ...prev];
                        }
                        return prev;
                    });
                },
                // onDeleted — assignment was deleted
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

    // ─── Filter assignments ────────────────────────────────────────────
    const getFilteredAssignments = useCallback(() => {
        let filtered = [...assignments];

        if (filter !== 'all') {
            filtered = filtered.filter(a => a.submissionStatus === filter);
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === 'dueDate') {
                return new Date(a.dueDate) - new Date(b.dueDate);
            } else if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            }
            return 0;
        });

        return filtered;
    }, [assignments, filter, sortBy]);

    const filteredAssignments = getFilteredAssignments();

    // ─── Helper functions ──────────────────────────────────────────────
    const getStatusBadge = (assignment) => {
        let status = 'Pending';
        let color = 'bg-orange-100 text-orange-700';
        let icon = MdPending;

        if (assignment.submissionStatus === 'submitted' || assignment.submissionStatus === 'late') {
            color = assignment.submissionStatus === 'late' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';
            icon = MdCheckCircle;
            status = assignment.submissionStatus === 'late' ? 'Late' : 'Submitted';
        } else if (assignment.submissionStatus === 'graded') {
            color = 'bg-green-100 text-green-700';
            icon = MdGrade;
            status = 'Graded';
        }

        return { status, color, icon };
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date();
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ─── Render ────────────────────────────────────────────────────────
    return (
        <div className='h-full w-full bg-white rounded-lg overflow-hidden flex flex-col'>

            {/* Header */}
            <div className='sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 z-10'>
                <div className='flex items-center justify-between mb-4'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900'>Assignments</h1>
                        <p className='text-sm text-gray-600 mt-1'>
                            {initialLoading ? 'Loading...' : `${assignments.length} total ${assignments.length === 1 ? 'assignment' : 'assignments'}`}
                        </p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={() => fetchAssignments(true)}
                            disabled={isRefreshing}
                            className='p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50'
                            title="Refresh"
                        >
                            <MdRefresh className={`w-6 h-6 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <div className='p-3 bg-blue-100 rounded-lg'>
                            <MdAssignment className='w-6 h-6 text-blue-600' />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2'>
                        <MdError className='w-5 h-5 text-red-600 mt-0.5 shrink-0' />
                        <div className='flex-1 text-sm text-red-700'>
                            <p className='font-medium'>{error}</p>
                            <button
                                onClick={() => fetchAssignments(true)}
                                className='text-red-600 hover:text-red-800 font-medium mt-1'
                            >
                                Try Again →
                            </button>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className='text-red-400 hover:text-red-600 shrink-0'
                        >
                            <MdClose className='w-5 h-5' />
                        </button>
                    </div>
                )}

                {/* Filters & Sort */}
                {!initialLoading && assignments.length > 0 && (
                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3'>
                        {/* Filter Buttons */}
                        <div className='col-span-2 sm:col-span-2 flex gap-2 flex-wrap'>
                            {['all', 'pending', 'submitted', 'graded'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${filter === f
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className='px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                            <option value='dueDate'>Due Date</option>
                            <option value='title'>Title</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className='flex-1 p-4 sm:p-6 overflow-y-auto'>

                {/* Loading State */}
                {initialLoading && (
                    <div className='space-y-3'>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className='bg-gray-200 rounded-lg h-24 animate-pulse' />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!initialLoading && filteredAssignments.length === 0 && !error && (
                    <div className='text-center py-16'>
                        <div className='w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
                            <MdAssignment className='w-10 h-10 text-gray-400' />
                        </div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-1'>No assignments found</h3>
                        <p className='text-sm text-gray-600'>
                            {filter === 'all'
                                ? 'No assignments have been assigned yet'
                                : `No ${filter} assignments in this filter`
                            }
                        </p>
                    </div>
                )}

                {/* Assignments List */}
                {!initialLoading && filteredAssignments.length > 0 && (
                    <div className='space-y-3'>
                        {filteredAssignments.map((assignment) => {
                            const { status, color, icon: StatusIcon } = getStatusBadge(assignment);
                            const overdue = isOverdue(assignment.dueDate);
                            const course = assignment.course?.title || assignment.courseId?.title || 'Course';

                            return (
                                <div
                                    key={assignment._id}
                                    className='bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all group'
                                >
                                    <div className='flex items-start gap-4'>
                                        {/* Icon */}
                                        <div className='p-3 bg-blue-50 rounded-lg shrink-0 hidden sm:flex'>
                                            <MdAssignment className='w-6 h-6 text-blue-600' />
                                        </div>

                                        {/* Details */}
                                        <div className='flex-1 min-w-0'>
                                            {/* Title & Status */}
                                            <div className='flex items-start justify-between gap-2 mb-2'>
                                                <h3 className='text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2'>
                                                    {assignment.title}
                                                </h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 flex items-center gap-1 ${color}`}>
                                                    <StatusIcon className='w-3.5 h-3.5' />
                                                    {status}
                                                </span>
                                            </div>

                                            {/* Course Name */}
                                            <p className='text-xs sm:text-sm text-gray-600 mb-2 font-medium'>
                                                {course}
                                            </p>

                                            {/* Description */}
                                            {assignment.description && (
                                                <p className='text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3'>
                                                    {assignment.description}
                                                </p>
                                            )}

                                            {/* Meta Info */}
                                            <div className='flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm'>
                                                {/* Due Date */}
                                                <div className='flex items-center gap-1'>
                                                    <MdCalendarToday className={`w-4 h-4 ${overdue ? 'text-red-500' : 'text-gray-400'}`} />
                                                    <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                                                        {formatDate(assignment.dueDate)}
                                                    </span>
                                                </div>

                                                {/* Max Marks */}
                                                {assignment.maxMarks && (
                                                    <div className='flex items-center gap-1 text-gray-600'>
                                                        <MdGrade className='w-4 h-4' />
                                                        <span>{assignment.maxMarks} points</span>
                                                    </div>
                                                )}

                                                {/* Grade if graded */}
                                                {assignment.submissionStatus === 'graded' && assignment.grade !== undefined && (
                                                    <div className='flex items-center gap-1 text-green-600 font-medium'>
                                                        <MdCheckCircle className='w-4 h-4' />
                                                        <span>Scored: {assignment.grade}/{assignment.maxMarks || 100}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Attachments */}
                                            {assignment.attachments && assignment.attachments.length > 0 && (
                                                <div className='mt-3 pt-3 border-t border-gray-100'>
                                                    <button className='flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium'>
                                                        <MdDownload className='w-4 h-4' />
                                                        {assignment.attachments.length} attachment(s)
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <button 
                                            onClick={() => {
                                                if (assignment.submissionStatus === 'submitted' || assignment.submissionStatus === 'graded' || assignment.submissionStatus === 'late') {
                                                    navigate(`/submissions/${assignment.submissionId}`);
                                                } else {
                                                    setSelectedAssignment(assignment);
                                                    setIsModalOpen(true);
                                                }
                                            }}
                                            className='px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shrink-0 whitespace-nowrap'
                                        >
                                            {assignment.submissionStatus === 'submitted' || assignment.submissionStatus === 'graded' || assignment.submissionStatus === 'late' ? 'View' : 'Submit'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <SubmissionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedAssignment(null);
                }}
                assignment={selectedAssignment}
                onSuccess={() => {
                    setIsModalOpen(false);
                    setSelectedAssignment(null);
                    fetchAssignments(true);
                }}
            />
        </div>
    );
};

export default Assignments;
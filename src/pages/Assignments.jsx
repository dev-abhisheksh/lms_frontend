import React, { useEffect, useState } from 'react';
import { getAssignments } from '../API/assignment.api';
import { MdAssignment, MdCalendarToday, MdCheckCircle, MdPending, MdGrade, MdDownload } from 'react-icons/md';

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, submitted, graded
    const [sortBy, setSortBy] = useState('dueDate'); // dueDate, title, course

    useEffect(() => {
        const fetchAssignments = async () => {
            setLoading(true);
            try {
                const res = await getAssignments();
                setAssignments(res.data?.assignments || []);
            } catch (error) {
                console.error("Error fetching assignments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, []);

    // Filter assignments based on status
    const getFilteredAssignments = () => {
        let filtered = [...assignments];
        
        if (filter !== 'all') {
            filtered = filtered.filter(a => {
                // Assuming submission status is in the assignment object
                return a.submissionStatus === filter;
            });
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
    };

    const filteredAssignments = getFilteredAssignments();

    const getStatusBadge = (assignment) => {
        let status = 'pending';
        let color = 'bg-orange-100 text-orange-700';
        let icon = MdPending;

        if (assignment.submissionStatus === 'submitted') {
            color = 'bg-blue-100 text-blue-700';
            icon = MdCheckCircle;
            status = 'Submitted';
        } else if (assignment.submissionStatus === 'graded') {
            color = 'bg-green-100 text-green-700';
            icon = MdGrade;
            status = 'Graded';
        } else {
            status = 'Pending';
        }

        return { status, color, icon };
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date() && !dueDate.submitted;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className='h-full w-full bg-white rounded-lg overflow-y-auto flex flex-col'>
            
            {/* Header */}
            <div className='sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6'>
                <div className='flex items-center justify-between mb-4'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900'>Assignments</h1>
                        <p className='text-sm text-gray-600 mt-1'>{assignments.length} total assignments</p>
                    </div>
                    <div className='p-3 bg-blue-100 rounded-lg'>
                        <MdAssignment className='w-6 h-6 text-blue-600' />
                    </div>
                </div>

                {/* Filters & Sort */}
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3'>
                    {/* Filter Buttons */}
                    <div className='col-span-2 sm:col-span-2 flex gap-2 flex-wrap'>
                        {['all', 'pending', 'submitted', 'graded'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                    filter === f
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
            </div>

            {/* Content */}
            <div className='flex-1 p-4 sm:p-6 overflow-y-auto'>
                
                {/* Loading State */}
                {loading && (
                    <div className='space-y-3'>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className='bg-gray-100 rounded-lg h-20 animate-pulse' />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredAssignments.length === 0 && (
                    <div className='text-center py-12'>
                        <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
                            <MdAssignment className='w-8 h-8 text-gray-400' />
                        </div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-1'>No assignments found</h3>
                        <p className='text-sm text-gray-600'>
                            {filter === 'all' 
                                ? 'No assignments yet' 
                                : `No ${filter} assignments`
                            }
                        </p>
                    </div>
                )}

                {/* Assignments List */}
                {!loading && filteredAssignments.length > 0 && (
                    <div className='space-y-3'>
                        {filteredAssignments.map((assignment) => {
                            const { status, color, icon: StatusIcon } = getStatusBadge(assignment);
                            const overdue = isOverdue(assignment.dueDate);

                            return (
                                <div 
                                    key={assignment._id}
                                    className='bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all group cursor-pointer'
                                >
                                    <div className='flex items-start gap-4'>
                                        {/* Icon */}
                                        <div className='p-3 bg-blue-50 rounded-lg shrink-0 hidden sm:flex'>
                                            <MdAssignment className='w-6 h-6 text-blue-600' />
                                        </div>

                                        {/* Details */}
                                        <div className='flex-1 min-w-0'>
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
                                            {assignment.courseId?.title && (
                                                <p className='text-xs sm:text-sm text-gray-600 mb-2'>
                                                    {assignment.courseId.title}
                                                </p>
                                            )}

                                            {/* Description */}
                                            {assignment.description && (
                                                <p className='text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3'>
                                                    {assignment.description}
                                                </p>
                                            )}

                                            {/* Due Date & Details */}
                                            <div className='flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm'>
                                                <div className='flex items-center gap-1 text-gray-600'>
                                                    <MdCalendarToday className='w-4 h-4' />
                                                    <span className={overdue ? 'text-red-600 font-medium' : ''}>
                                                        Due: {formatDate(assignment.dueDate)}
                                                    </span>
                                                </div>

                                                {/* Points if available */}
                                                {assignment.totalPoints && (
                                                    <div className='flex items-center gap-1 text-gray-600'>
                                                        <MdGrade className='w-4 h-4' />
                                                        <span>{assignment.totalPoints} points</span>
                                                    </div>
                                                )}

                                                {/* Grade if graded */}
                                                {assignment.submissionStatus === 'graded' && assignment.grade !== undefined && (
                                                    <div className='flex items-center gap-1 text-green-600 font-medium'>
                                                        <MdGrade className='w-4 h-4' />
                                                        <span>Grade: {assignment.grade}/{assignment.totalPoints || 100}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Attachments if any */}
                                            {assignment.attachments && assignment.attachments.length > 0 && (
                                                <div className='mt-3 pt-3 border-t border-gray-100'>
                                                    <div className='flex items-center gap-1 text-xs text-gray-600'>
                                                        <MdDownload className='w-4 h-4' />
                                                        <span>{assignment.attachments.length} file(s) attached</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <button className='px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shrink-0'>
                                            {assignment.submissionStatus === 'submitted' ? 'View' : 'Submit'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
};

export default Assignments;
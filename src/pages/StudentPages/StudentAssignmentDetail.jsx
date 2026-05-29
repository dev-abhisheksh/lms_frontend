import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignmentById } from '../../API/assignment.api';
import { mySubmissions } from '../../API/submission.api';
import { MdArrowBack, MdDownload, MdCalendarToday, MdGrade, MdCheckCircle, MdMenuBook, MdAccessTime, MdInfoOutline } from 'react-icons/md';
import SubmissionModal from './SubmissionModal';

const StudentAssignmentDetail = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [submissionStatus, setSubmissionStatus] = useState(null);
    const [submissionId, setSubmissionId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assignRes, subRes] = await Promise.all([
                getAssignmentById(assignmentId),
                mySubmissions().catch(() => ({ data: { submissions: [] } }))
            ]);

            setAssignment(assignRes.data?.assignment);

            // Find if student has already submitted
            const subs = subRes.data?.submissions || [];
            const mySub = subs.find(s => 
                (s.assignment?._id || s.assignment) === assignmentId && 
                s.status !== 'deleted'
            );

            if (mySub) {
                setSubmissionStatus(mySub.status);
                setSubmissionId(mySub._id);
            } else {
                setSubmissionStatus('pending');
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load assignment details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (assignmentId) fetchData();
    }, [assignmentId]);

    const isOverdue = assignment ? new Date(assignment.dueDate) < new Date() : false;

    if (loading) {
        return (
            <div className="h-full w-full bg-white rounded-xl shadow-sm p-6 flex flex-col animate-pulse">
                <div className="h-40 bg-gray-200 rounded-2xl mb-8 w-full"></div>
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-6">
                        <div className="h-64 bg-gray-100 rounded-2xl"></div>
                    </div>
                    <div className="w-full lg:w-80 space-y-6">
                        <div className="h-48 bg-gray-50 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !assignment) {
        return (
            <div className="h-full w-full bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-rose-100">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Assignment Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-sm">{error || "This assignment might have been deleted or you don't have access."}</p>
                <button 
                    onClick={() => navigate('/assignments')}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium flex items-center gap-2"
                >
                    <MdArrowBack className="w-5 h-5" />
                    Back to Assignments
                </button>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-gray-50/50 rounded-xl flex flex-col overflow-y-auto relative">
            
            {/* Header Banner */}
            <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 p-6 md:p-10 shrink-0">
                <div className="absolute inset-0 overflow-hidden rounded-t-xl opacity-20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl mix-blend-screen"></div>
                </div>
                
                <div className="relative z-10 max-w-6xl mx-auto">
                    <button 
                        onClick={() => navigate('/assignments')}
                        className="flex items-center gap-2 text-sm text-blue-100 hover:text-white font-medium mb-6 transition-colors w-fit bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm"
                    >
                        <MdArrowBack className="w-4 h-4" />
                        Back to Assignments
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className="inline-flex items-center gap-1.5 text-sm text-blue-100 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                    <MdMenuBook className="w-4 h-4" />
                                    {assignment?.course?.title}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight tracking-tight">
                                {assignment.title}
                            </h1>
                        </div>
                        
                        <div className="shrink-0 flex gap-3">
                            {submissionStatus === 'submitted' || submissionStatus === 'graded' || submissionStatus === 'late' ? (
                                <button
                                    onClick={() => navigate(`/submissions/${submissionId}`)}
                                    className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-bold shadow-lg flex items-center gap-2"
                                >
                                    <MdCheckCircle className="w-5 h-5" />
                                    View Submission
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-8 py-3 bg-white text-indigo-900 rounded-xl hover:bg-blue-50 transition-colors font-bold shadow-lg shadow-black/10 flex items-center gap-2"
                                >
                                    Submit Work
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
                    
                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <MdInfoOutline className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">Instructions</h3>
                            </div>
                            <div className="p-6">
                                {assignment.description ? (
                                    <div className="prose prose-sm md:prose-base max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">
                                        {assignment.description}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic mb-6">No specific instructions provided for this assignment.</p>
                                )}

                                {assignment.attachments && assignment.attachments.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Reference Materials</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {assignment.attachments.map((file, idx) => (
                                                <a 
                                                    key={idx}
                                                    href={file.url || file.secure_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                                                >
                                                    <div className="p-2 bg-gray-50 rounded-md group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shrink-0">
                                                        <MdDownload className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-700">
                                                        {file.original_filename || `Material ${idx + 1}`}
                                                    </span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-80 space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 text-lg mb-5">Assignment Details</h3>
                            
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOverdue && submissionStatus === 'pending' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                                        <MdCalendarToday className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Due Date</p>
                                        <p className={`text-sm font-semibold ${isOverdue && submissionStatus === 'pending' ? 'text-rose-600' : 'text-gray-900'}`}>
                                            {new Date(assignment.dueDate).toLocaleString()}
                                        </p>
                                        {isOverdue && submissionStatus === 'pending' && (
                                            <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                                                <MdAccessTime className="w-3.5 h-3.5" />
                                                Overdue
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
                                        <MdGrade className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Points</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {assignment.maxMarks} max marks
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${submissionStatus === 'graded' ? 'bg-emerald-50 text-emerald-600' : submissionStatus === 'submitted' || submissionStatus === 'late' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                                        <MdCheckCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                        <p className="text-sm font-semibold text-gray-900 capitalize">
                                            {submissionStatus}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SubmissionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                assignment={assignment}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchData(); // refresh to update status to submitted
                }}
            />
        </div>
    );
};

export default StudentAssignmentDetail;

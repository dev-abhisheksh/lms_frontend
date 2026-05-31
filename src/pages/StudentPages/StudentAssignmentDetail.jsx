import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignmentById } from '../../API/assignment.api';
import { mySubmissions } from '../../API/submission.api';
import { 
    MdArrowBack, MdDownload, MdCalendarToday, MdGrade, 
    MdCheckCircle, MdMenuBook, MdAccessTime, MdInfoOutline, 
    MdOutlineDescription, MdAttachment, MdSend 
} from 'react-icons/md';
import SubmissionModal from './SubmissionModal';

const StudentAssignmentDetail = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [submissionStatus, setSubmissionStatus] = useState(null);
    const [submissionId, setSubmissionId] = useState(null);
    const [mySubmission, setMySubmission] = useState(null);
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
                setMySubmission(mySub);
                setSubmissionStatus(mySub.status);
                setSubmissionId(mySub._id);
            } else {
                setMySubmission(null);
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
            <div className="h-full w-full bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded-lg w-1/4"></div>
                <div className="h-32 bg-gray-100 rounded-2xl w-full"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-64 bg-gray-50 rounded-2xl"></div>
                        <div className="h-40 bg-gray-50 rounded-2xl"></div>
                    </div>
                    <div className="space-y-6">
                        <div className="h-80 bg-gray-50 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !assignment) {
        return (
            <div className="h-full w-full bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
                    <MdInfoOutline className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Assignment Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-sm">{error || "This assignment might have been deleted or you don't have access."}</p>
                <button 
                    onClick={() => navigate('/assignments')}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-semibold flex items-center gap-2"
                >
                    <MdArrowBack /> Back to Assignments
                </button>
            </div>
        );
    }

    const getStatusConfig = (status) => {
        switch (status) {
            case 'graded':
                return { label: 'Graded', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: MdCheckCircle };
            case 'submitted':
                return { label: 'Submitted', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', icon: MdCheckCircle };
            case 'late':
                return { label: 'Submitted Late', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', icon: MdAccessTime };
            default:
                return { label: 'Pending', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', icon: MdAccessTime };
        }
    };

    const statusConfig = getStatusConfig(submissionStatus);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="h-full w-full bg-gray-50/50 rounded-2xl flex flex-col overflow-y-auto scrollbar-hide">
            
            {/* ── Breadcrumbs & Simple Header ────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 md:px-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <button 
                            onClick={() => navigate('/assignments')}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-2"
                        >
                            <MdArrowBack /> Back to Assignments
                        </button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {assignment.title}
                            </h1>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MdMenuBook className="text-indigo-500" /> {assignment.course?.title}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {submissionStatus !== 'pending' ? (
                            <button
                                onClick={() => navigate(`/submissions/${submissionId}`)}
                                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm flex items-center gap-2"
                            >
                                View My Submission
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-200 flex items-center gap-2"
                            >
                                <MdSend /> Submit Now
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Main Grid Layout ───────────────────────────────────────── */}
            <div className="p-6 md:p-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Instructions & Content */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Grade Alert Section (If Graded) */}
                        {submissionStatus === 'graded' && mySubmission && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 text-center md:text-left">
                                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
                                        <MdGrade className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-emerald-900 font-bold text-lg">Assignment Graded!</h3>
                                        <p className="text-emerald-700 text-sm font-medium">Your instructor has reviewed your work.</p>
                                    </div>
                                </div>
                                <div className="bg-white px-8 py-4 rounded-xl border border-emerald-100 text-center shadow-sm">
                                    <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Your Score</span>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-3xl font-black text-emerald-900">{mySubmission.grade}</span>
                                        <span className="text-gray-400 font-bold">/ {assignment.maxMarks}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Overview Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                                <MdOutlineDescription className="text-indigo-600" />
                                <h2 className="font-bold text-gray-900">Instructions</h2>
                            </div>
                            <div className="p-6 md:p-8">
                                {assignment.description ? (
                                    <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-wrap font-medium">
                                        {assignment.description}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic text-center py-4">No instructions provided.</p>
                                )}
                            </div>
                        </div>

                        {/* Attachments */}
                        {assignment.attachments?.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                                    <MdAttachment className="text-amber-600" />
                                    <h2 className="font-bold text-gray-900">Reference Materials</h2>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {assignment.attachments.map((file, idx) => (
                                        <a 
                                            key={idx}
                                            href={file.url || file.secure_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/10 transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-indigo-600">
                                                <MdDownload className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{file.original_filename || `Material ${idx + 1}`}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Download</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Meta Info */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                            <h3 className="font-bold text-gray-900 text-lg border-b border-gray-50 pb-4">Details</h3>
                            
                            <div className="space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOverdue && submissionStatus === 'pending' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                        <MdCalendarToday />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Due Date</p>
                                        <p className={`text-sm font-bold ${isOverdue && submissionStatus === 'pending' ? 'text-rose-600' : 'text-gray-900'}`}>
                                            {new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                            {new Date(assignment.dueDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                        <MdGrade />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Max Score</p>
                                        <p className="text-sm font-bold text-gray-900">{assignment.maxMarks} Points</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusConfig.bg} ${statusConfig.color}`}>
                                        <StatusIcon />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Status</p>
                                        <p className="text-sm font-bold text-gray-900">{statusConfig.label}</p>
                                    </div>
                                </div>
                            </div>

                            {submissionStatus === 'pending' && (
                                <div className="pt-4">
                                    <button 
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                                    >
                                        Submit Assignment
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Help Box */}
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6">
                            <div className="flex gap-3 text-indigo-600 mb-3">
                                <MdInfoOutline className="shrink-0 w-5 h-5" />
                                <h4 className="font-bold text-sm">Need help?</h4>
                            </div>
                            <p className="text-xs text-indigo-700/70 leading-relaxed font-medium">
                                If you're having trouble submitting or have questions about the assignment, please reach out to your instructor.
                            </p>
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
                    fetchData();
                }}
            />
        </div>
    );
};

export default StudentAssignmentDetail;


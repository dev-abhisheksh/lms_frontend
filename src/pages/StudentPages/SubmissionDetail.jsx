import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSingleSubmission } from '../../API/submission.api';
import { 
    MdArrowBack, MdDownload, MdGrade, MdAccessTime, 
    MdCheckCircle, MdNotes, MdOutlineFeedback, MdCalendarToday, 
    MdMenuBook, MdOutlineDescription, MdAttachment, MdInfoOutline 
} from 'react-icons/md';

const SubmissionDetail = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await getSingleSubmission(submissionId);
                setSubmission(res.data?.submission);
            } catch (err) {
                console.error("Error fetching submission details:", err);
                setError("Failed to load submission details.");
            } finally {
                setLoading(false);
            }
        };

        if (submissionId) {
            fetchDetail();
        }
    }, [submissionId]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'graded':
                return { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Graded', icon: MdGrade };
            case 'late':
                return { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100', label: 'Late Submission', icon: MdAccessTime };
            case 'submitted':
            default:
                return { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Submitted', icon: MdCheckCircle };
        }
    };

    if (loading) {
        return (
            <div className="h-full w-full bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded-lg w-1/4"></div>
                <div className="h-32 bg-gray-100 rounded-2xl w-full"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-80 bg-gray-50 rounded-2xl"></div>
                    </div>
                    <div className="space-y-6">
                        <div className="h-64 bg-gray-50 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !submission) {
        return (
            <div className="h-full w-full bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
                    <MdInfoOutline className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-sm">{error || "The submission you're looking for doesn't exist or you don't have access to it."}</p>
                <button 
                    onClick={() => navigate('/submissions')}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-semibold flex items-center gap-2"
                >
                    <MdArrowBack /> Back to My Submissions
                </button>
            </div>
        );
    }

    const { assignment, textAnswer, files, submittedAt, status, grade, feedback } = submission;
    const statusStyle = getStatusStyle(status);
    const StatusIcon = statusStyle.icon;
    const dueDate = new Date(assignment?.dueDate);
    const submitDate = new Date(submittedAt);

    return (
        <div className="h-full w-full bg-gray-50/50 rounded-2xl flex flex-col overflow-y-auto scrollbar-hide">
            
            {/* ── Header Area ───────────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 px-6 py-6 md:px-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <button 
                            onClick={() => navigate('/submissions')}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-2"
                        >
                            <MdArrowBack /> Back to My Submissions
                        </button>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                                {assignment?.title}
                            </h1>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}>
                                {statusStyle.label}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MdMenuBook className="text-indigo-500" /> {assignment?.course?.title}
                        </p>
                    </div>

                    {status === 'graded' && (
                        <div className="shrink-0 bg-white px-10 py-5 rounded-2xl border-2 border-emerald-500 text-center shadow-xl shadow-emerald-500/10">
                            <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">Final Score</span>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-black text-gray-900">{grade}</span>
                                <span className="text-xl font-bold text-gray-400">/ {assignment?.maxMarks}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Content Grid ──────────────────────────────────────────── */}
            <div className="p-6 md:p-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Main Content (Left) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Instructor's Feedback */}
                        {feedback ? (
                            <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                                <div className="absolute -top-4 -right-4 opacity-5">
                                    <MdOutlineFeedback className="w-32 h-32" />
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
                                        <MdOutlineFeedback className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-lg font-bold text-emerald-900">Instructor's Feedback</h2>
                                </div>
                                <p className="text-emerald-800 leading-relaxed font-medium italic relative z-10">
                                    "{feedback}"
                                </p>
                            </section>
                        ) : status === 'graded' ? (
                            <section className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-center gap-4">
                                <MdInfoOutline className="text-gray-400 w-6 h-6" />
                                <p className="text-sm text-gray-500 font-medium italic">No written feedback provided by the instructor.</p>
                            </section>
                        ) : null}

                        {/* Text Answer */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                                <MdNotes className="text-indigo-600" />
                                <h2 className="font-bold text-gray-900">Your Response</h2>
                            </div>
                            <div className="p-6 md:p-8">
                                {textAnswer ? (
                                    <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-wrap font-medium">
                                        {textAnswer}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic text-center py-4">No written response provided.</p>
                                )}
                            </div>
                        </div>

                        {/* Files */}
                        {files && files.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                                    <MdAttachment className="text-blue-600" />
                                    <h2 className="font-bold text-gray-900">Attached Documents</h2>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {files.map((file, idx) => (
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
                                                <p className="text-sm font-bold text-gray-900 truncate">{file.original_filename || `Attachment ${idx + 1}`}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    {(file.bytes / 1024).toFixed(0)} KB • Download
                                                </p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Meta Sidebar (Right) */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                            <h3 className="font-bold text-gray-900 text-lg border-b border-gray-50 pb-4">Timeline</h3>
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === 'late' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        <MdCheckCircle />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted On</p>
                                        <p className="text-sm font-bold text-gray-900">
                                            {submitDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] text-gray-500 font-medium">
                                            {submitDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                        <MdCalendarToday />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deadline</p>
                                        <p className="text-sm font-bold text-gray-900">
                                            {dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] text-gray-500 font-medium">
                                            {dueDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submission ID</span>
                                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                    #{submissionId.slice(-6).toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Assignment Link Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h4 className="font-bold text-gray-900 text-sm mb-4">Need to review?</h4>
                            <button 
                                onClick={() => navigate(`/assignments/${assignment?._id}`)}
                                className="w-full py-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                            >
                                <MdOutlineDescription /> View Original Assignment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionDetail;


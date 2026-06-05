import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSingleSubmission } from '../../API/submission.api';
import { 
    MdArrowBack, MdDownload, MdGrade, MdAccessTime, 
    MdCheckCircle, MdNotes, MdOutlineFeedback, MdCalendarToday, 
    MdMenuBook, MdOutlineDescription, MdAttachment, MdInfoOutline,
    MdOpenInNew,
    MdTimer,
    MdOutlineAssignmentTurnedIn
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
                return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', label: 'Graded', icon: MdGrade };
            case 'late':
                return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', label: 'Late Submission', icon: MdTimer };
            case 'submitted':
            default:
                return { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', label: 'Processing', icon: MdCheckCircle };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] p-3 sm:p-6 animate-pulse space-y-6">
                <div className="h-16 bg-white rounded-2xl w-full"></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="h-64 bg-white rounded-2xl"></div>
                        <div className="h-40 bg-white rounded-2xl"></div>
                    </div>
                    <div className="lg:col-span-4 h-96 bg-white rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (error || !submission) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] p-6 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <MdInfoOutline className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Submission Not Found</h2>
                <p className="text-xs font-medium text-slate-500 mb-6 max-w-xs">{error || "The record you're looking for doesn't exist."}</p>
                <button 
                    onClick={() => navigate('/submissions')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center gap-2"
                >
                    <MdArrowBack /> Return to Archive
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
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col antialiased font-sans text-slate-900">
            
            {/* ── Page Header ── */}
            <div className="bg-white border-b border-slate-100 px-4 py-6 sm:px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4">
                        <button 
                            onClick={() => navigate('/submissions')}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            <MdArrowBack className="w-4 h-4" /> Return to Archive
                        </button>
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                                    {assignment?.title}
                                </h1>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}>
                                    {statusStyle.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <MdMenuBook className="text-indigo-500 w-4 h-4" /> {assignment?.course?.title}
                            </div>
                        </div>
                    </div>

                    {status === 'graded' && (
                        <div className="bg-white px-8 py-4 rounded-2xl border border-green-100 text-center shadow-sm min-w-[150px]">
                            <span className="block text-[8px] font-black text-green-600 uppercase tracking-widest mb-1">Final Score</span>
                            <div className="flex items-baseline justify-center gap-0.5">
                                <span className="text-3xl font-black text-slate-900">{grade}</span>
                                <span className="text-slate-300 font-bold text-sm">/ {assignment?.maxMarks}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main Content Area ── */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Side: Body Content (lg:col-span-8) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Instructor's Feedback */}
                        {status === 'graded' && (
                            <div className={`rounded-2xl p-6 border ${feedback ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${feedback ? 'bg-white text-indigo-600' : 'bg-white text-slate-400'}`}>
                                        <MdOutlineFeedback className="w-5 h-5" />
                                    </div>
                                    <h2 className={`text-base font-black tracking-tight ${feedback ? 'text-indigo-900' : 'text-slate-900'}`}>
                                        Instructor Feedback
                                    </h2>
                                </div>
                                {feedback ? (
                                    <p className="text-indigo-800 text-sm leading-relaxed font-medium italic">
                                        "{feedback}"
                                    </p>
                                ) : (
                                    <p className="text-slate-400 text-xs font-medium italic">
                                        No written commentary provided.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Submission Body */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <MdNotes className="w-4 h-4" />
                                </div>
                                <h2 className="text-sm font-bold tracking-tight text-slate-900 uppercase tracking-widest">Your Response</h2>
                            </div>
                            <div className="p-6 sm:p-8">
                                {textAnswer ? (
                                    <div className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                        {textAnswer}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-slate-400 text-xs font-medium italic">No written response included.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Attached Files */}
                        {files && files.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <MdAttachment className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-sm font-bold tracking-tight text-slate-900 uppercase tracking-widest">Assets</h2>
                                </div>
                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {files.map((file, idx) => (
                                        <a 
                                            key={idx}
                                            href={file.url || file.secure_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-slate-50 transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-colors">
                                                <MdDownload className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-slate-900 truncate">{file.original_filename || `Asset ${idx + 1}`}</p>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                                    {(file.bytes / 1024).toFixed(0)} KB
                                                </p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Metadata (lg:col-span-4) */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Timeline */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-4">Timeline</h3>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${status === 'late' ? 'bg-rose-50 text-rose-600' : 'bg-green-50 text-green-600'}`}>
                                        <MdOutlineAssignmentTurnedIn className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Handed In</p>
                                        <p className="text-xs font-bold text-slate-900">
                                            {submitDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] font-medium text-slate-500">
                                            {submitDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                        <MdCalendarToday className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Deadline</p>
                                        <p className="text-xs font-bold text-slate-900">
                                            {dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] font-medium text-slate-500">
                                            {dueDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">ID</span>
                                <span className="text-[10px] font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                    #{submissionId.slice(-8).toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                            <button 
                                onClick={() => navigate(`/assignments/${assignment?._id}`)}
                                className="w-full py-3 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                            >
                                <MdOutlineDescription className="w-4 h-4" /> View Original Brief
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionDetail;

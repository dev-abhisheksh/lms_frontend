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
            <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-8 animate-pulse space-y-8">
                <div className="h-20 bg-white rounded-[32px] w-full"></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        <div className="h-64 bg-white rounded-[40px]"></div>
                        <div className="h-40 bg-white rounded-[40px]"></div>
                    </div>
                    <div className="lg:col-span-4 h-96 bg-white rounded-[40px]"></div>
                </div>
            </div>
        );
    }

    if (error || !submission) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] p-8 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[40px] flex items-center justify-center mb-8 shadow-sm">
                    <MdInfoOutline className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Submission Not Found</h2>
                <p className="text-slate-500 mb-8 max-w-sm font-medium">{error || "The record you're looking for doesn't exist or access is restricted."}</p>
                <button 
                    onClick={() => navigate('/submissions')}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-2"
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
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
            
            {/* ── Page Header ── */}
            <div className="bg-white border-b border-slate-100 px-6 py-8 md:px-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <button 
                            onClick={() => navigate('/submissions')}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            <MdArrowBack className="w-4 h-4" /> Return to Archive
                        </button>
                        <div>
                            <div className="flex flex-wrap items-center gap-4 mb-2">
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                                    {assignment?.title}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}>
                                    {statusStyle.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                                <MdMenuBook className="text-indigo-500" /> {assignment?.course?.title}
                            </div>
                        </div>
                    </div>

                    {status === 'graded' && (
                        <div className="bg-white px-10 py-6 rounded-[28px] border border-green-100 text-center shadow-xl shadow-green-100/50 min-w-[180px]">
                            <span className="block text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-2">Final Score</span>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-black text-slate-900">{grade}</span>
                                <span className="text-slate-300 font-bold text-lg">/ {assignment?.maxMarks}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main Content Area ── */}
            <div className="p-6 md:p-10 flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Side: Body Content (lg:col-span-8) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Instructor's Feedback Showcase */}
                        {status === 'graded' && (
                            <div className={`rounded-[32px] p-8 border ${feedback ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${feedback ? 'bg-white text-indigo-600' : 'bg-white text-slate-400'}`}>
                                        <MdOutlineFeedback className="w-6 h-6" />
                                    </div>
                                    <h2 className={`text-lg font-black tracking-tight ${feedback ? 'text-indigo-900' : 'text-slate-900'}`}>
                                        {feedback ? "Instructor's Remarks" : "Assessment Feedback"}
                                    </h2>
                                </div>
                                {feedback ? (
                                    <p className="text-indigo-800 text-sm md:text-base leading-relaxed font-medium italic italic px-2">
                                        "{feedback}"
                                    </p>
                                ) : (
                                    <p className="text-slate-400 text-sm font-medium italic px-2">
                                        The instructor has finalized your grade without additional written commentary.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Submission Body */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <MdNotes className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold tracking-tight text-slate-900">Your Response</h2>
                            </div>
                            <div className="p-8 md:p-10">
                                {textAnswer ? (
                                    <div className="text-slate-700 text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap">
                                        {textAnswer}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <MdInfoOutline className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                        <p className="text-slate-400 font-medium italic">No written response was included with this submission.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Attached Files */}
                        {files && files.length > 0 && (
                            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <MdAttachment className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight text-slate-900">Submitted Assets</h2>
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {files.map((file, idx) => (
                                        <a 
                                            key={idx}
                                            href={file.url || file.secure_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 hover:scale-[1.02] transition-all group"
                                        >
                                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-white transition-colors">
                                                <MdDownload className="w-6 h-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-slate-900 truncate">{file.original_filename || `Asset ${idx + 1}`}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                                                    Archive Asset • {(file.bytes / 1024).toFixed(0)} KB
                                                </p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Metadata (lg:col-span-4) */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Timeline Specs */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 space-y-8">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-b border-slate-50 pb-6">Timeline Records</h3>
                            
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${status === 'late' ? 'bg-rose-50 text-rose-600' : 'bg-green-50 text-green-600'}`}>
                                        <MdOutlineAssignmentTurnedIn className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Handed In</p>
                                        <p className="text-sm font-bold text-slate-900">
                                            {submitDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                                            {submitDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                                        <MdCalendarToday className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deadline Reference</p>
                                        <p className="text-sm font-bold text-slate-900">
                                            {dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                                            {dueDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Log ID</span>
                                <span className="text-[10px] font-mono font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                    #{submissionId.slice(-8).toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Navigation Card */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                            <h4 className="font-black text-slate-900 text-sm mb-4 tracking-tight">Post-Submission</h4>
                            <button 
                                onClick={() => navigate(`/assignments/${assignment?._id}`)}
                                className="w-full py-4 bg-slate-50 border border-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                            >
                                <MdOutlineDescription className="w-4 h-4" /> Original Brief
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionDetail;

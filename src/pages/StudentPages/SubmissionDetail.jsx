import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSingleSubmission } from '../../API/submission.api';
import { MdArrowBack, MdDownload, MdGrade, MdAccessTime, MdCheckCircle, MdNotes, MdOutlineFeedback, MdCalendarToday, MdMenuBook, MdOutlineDescription, MdAttachment } from 'react-icons/md';

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
                return { color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200', label: 'Graded', icon: MdGrade };
            case 'late':
                return { color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-200', label: 'Late Submission', icon: MdAccessTime };
            case 'submitted':
            default:
                return { color: 'text-indigo-700', bg: 'bg-indigo-100', border: 'border-indigo-200', label: 'Submitted', icon: MdCheckCircle };
        }
    };

    if (loading) {
        return (
            <div className="h-full w-full bg-white rounded-2xl shadow-sm p-6 flex flex-col animate-pulse">
                <div className="h-48 bg-gray-100 rounded-3xl mb-8 w-full"></div>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                        <div className="h-80 bg-gray-50 rounded-3xl"></div>
                        <div className="h-40 bg-gray-50 rounded-3xl"></div>
                    </div>
                    <div className="w-full lg:w-96 space-y-6">
                        <div className="h-64 bg-gray-50 rounded-3xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !submission) {
        return (
            <div className="h-full w-full bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-8 shadow-inner border border-rose-100">
                    <span className="text-4xl">⚠️</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Submission Not Found</h2>
                <p className="text-gray-500 mb-10 max-w-sm text-lg leading-relaxed">{error || "The submission you're looking for doesn't exist or you don't have access to it."}</p>
                <button 
                    onClick={() => navigate('/student')}
                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all font-bold flex items-center gap-3 shadow-xl shadow-gray-200"
                >
                    <MdArrowBack className="w-6 h-6" />
                    Back to Dashboard
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
        <div className="h-full w-full bg-white rounded-2xl flex flex-col overflow-y-auto relative scrollbar-hide">
            
            {/* ── Header Banner ─────────────────────────────────────────── */}
            <div className="relative bg-[#0F172A] overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -ml-24 -mb-24"></div>
                
                <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto">
                    <button 
                        onClick={() => navigate('/submissions')}
                        className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white font-semibold mb-8 transition-all w-fit"
                    >
                        <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                            <MdArrowBack className="w-4 h-4" />
                        </div>
                        Back to My Submissions
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4 max-w-4xl">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${statusStyle.bg} ${statusStyle.color} px-4 py-2 rounded-full border border-white/5 shadow-sm`}>
                                    <StatusIcon className="w-4 h-4" />
                                    {statusStyle.label}
                                </span>
                                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
                                    <MdMenuBook className="w-4 h-4" />
                                    {assignment?.course?.title}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                                {assignment?.title}
                            </h1>
                        </div>

                        {status === 'graded' && (
                            <div className="shrink-0 bg-emerald-500 text-white rounded-[32px] p-1 shadow-2xl shadow-emerald-500/20">
                                <div className="bg-[#0F172A] rounded-[30px] px-10 py-6 flex flex-col items-center">
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Final Grade</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black">{grade}</span>
                                        <span className="text-xl font-bold text-slate-500">/ {assignment?.maxMarks}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Main Content Area ─────────────────────────────────────── */}
            <div className="flex-1 p-6 md:p-10 lg:p-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                    
                    {/* Main Content (Left) */}
                    <div className="lg:col-span-8 space-y-12">
                        
                        {/* Instructor's Feedback (High Priority) */}
                        {feedback && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                                        <MdOutlineFeedback className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Instructor's Feedback</h2>
                                </div>
                                <div className="bg-emerald-50/30 rounded-[32px] p-8 border-2 border-emerald-100 relative">
                                    <div className="absolute top-0 right-0 p-6 opacity-10">
                                        <MdOutlineFeedback className="w-24 h-24 text-emerald-600" />
                                    </div>
                                    <p className="text-lg text-emerald-900 leading-relaxed font-semibold italic relative z-10">
                                        "{feedback}"
                                    </p>
                                </div>
                            </section>
                        )}

                        {/* Submission Content */}
                        <section className="space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                    <MdNotes className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Submission</h2>
                            </div>

                            {/* Text Answer */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Written Response</h3>
                                <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100">
                                    {textAnswer ? (
                                        <div className="prose prose-lg prose-indigo max-w-none text-gray-700 leading-relaxed font-medium">
                                            {textAnswer.split('\n').map((para, i) => (
                                                <p key={i} className={i > 0 ? 'mt-4' : ''}>{para}</p>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 italic text-center py-6 font-medium">No written response provided.</p>
                                    )}
                                </div>
                            </div>

                            {/* Attached Files */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Attached Documents</h3>
                                {files && files.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {files.map((file, idx) => (
                                            <a 
                                                key={idx}
                                                href={file.url || file.secure_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-5 p-5 bg-white border border-gray-100 rounded-3xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                                            >
                                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0 border border-gray-100 group-hover:border-indigo-100">
                                                    <MdDownload className="w-7 h-7 text-gray-400 group-hover:text-indigo-600 transition-transform group-hover:-translate-y-1" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="block text-sm font-black text-gray-900 truncate mb-1 group-hover:text-indigo-600 transition-colors">
                                                        {file.original_filename || `Attachment ${idx + 1}`}
                                                    </span>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        {file.format || 'FILE'} • {(file.bytes / 1024).toFixed(0)} KB
                                                    </span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 border-dashed text-center">
                                        <p className="text-gray-400 italic font-medium">No files were attached to this submission.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Original Assignment Reference */}
                        <section className="space-y-6 pt-12 border-t border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                                    <MdOutlineDescription className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Assignment Instructions</h2>
                            </div>
                            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                                <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                                    {assignment?.description || "No description provided."}
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-12 space-y-8">
                            
                            {/* Submission Stats */}
                            <div className="bg-[#0F172A] rounded-[32px] p-8 shadow-2xl shadow-slate-200 text-white space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full -mr-20 -mt-20"></div>
                                
                                <h3 className="text-xl font-black tracking-tight relative z-10">Submission Summary</h3>
                                
                                <div className="space-y-8 relative z-10">
                                    <div className="flex items-start gap-5">
                                        <div className={`p-3 rounded-2xl shrink-0 ${submitDate > dueDate ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                            <MdCheckCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Handed In</p>
                                            <p className="text-lg font-black text-white">
                                                {submitDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-xs font-bold text-slate-500 mt-1">
                                                {submitDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-5">
                                        <div className="p-3 bg-white/5 text-slate-400 rounded-2xl shrink-0">
                                            <MdCalendarToday className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Original Deadline</p>
                                            <p className="text-lg font-black text-white">
                                                {dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-xs font-bold text-slate-500 mt-1">
                                                {dueDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center justify-between border-t border-white/5">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Submission ID</span>
                                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded">
                                            #{submissionId.slice(-6).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Need Help Box */}
                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                <h4 className="font-black text-slate-900 tracking-tight text-sm mb-2">Something wrong?</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                                    If you believe there is an error in your grade or feedback, please contact your instructor directly through the official channels.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionDetail;

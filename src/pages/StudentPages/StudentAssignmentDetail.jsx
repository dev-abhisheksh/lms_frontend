import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignmentById } from '../../API/assignment.api';
import { mySubmissions } from '../../API/submission.api';
import { 
    MdArrowBack, MdDownload, MdCalendarToday, MdGrade, 
    MdCheckCircle, MdMenuBook, MdAccessTime, MdInfoOutline, 
    MdOutlineDescription, MdAttachment, MdSend,
    MdOutlineLibraryBooks,
    MdTimer,
    MdOpenInNew,
    MdHelpOutline
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
            <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-8 animate-pulse space-y-8">
                <div className="h-20 bg-white rounded-3xl w-full"></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        <div className="h-64 bg-white rounded-[32px]"></div>
                        <div className="h-40 bg-white rounded-[32px]"></div>
                    </div>
                    <div className="lg:col-span-4 h-96 bg-white rounded-[32px]"></div>
                </div>
            </div>
        );
    }

    if (error || !assignment) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] p-8 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[40px] flex items-center justify-center mb-8 shadow-sm">
                    <MdInfoOutline className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Assignment Not Found</h2>
                <p className="text-slate-500 mb-8 max-w-sm font-medium">{error || "This assignment might have been deleted or you don't have access."}</p>
                <button 
                    onClick={() => navigate('/assignments')}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-2"
                >
                    <MdArrowBack /> Back to Assignments
                </button>
            </div>
        );
    }

    const getStatusConfig = (status) => {
        switch (status) {
            case 'graded':
                return { label: 'Graded', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: MdCheckCircle };
            case 'submitted':
                return { label: 'Submitted', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: MdCheckCircle };
            case 'late':
                return { label: 'Late', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: MdTimer };
            default:
                return { label: 'Pending', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100', icon: MdAccessTime };
        }
    };

    const statusConfig = getStatusConfig(submissionStatus);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
            
            {/* ── Page Header ── */}
            <div className="bg-white border-b border-slate-100 px-6 py-8 md:px-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <button 
                            onClick={() => navigate('/assignments')}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            <MdArrowBack className="w-4 h-4" /> Return to Archive
                        </button>
                        <div>
                            <div className="flex flex-wrap items-center gap-4 mb-2">
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                                    {assignment.title}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                                    {statusConfig.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                                <MdMenuBook className="text-indigo-500" /> {assignment.course?.title || assignment.courseId?.title}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {submissionStatus !== 'pending' ? (
                            <button
                                onClick={() => navigate(`/submissions/${submissionId}`)}
                                className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl hover:bg-slate-50 transition-all font-black text-xs uppercase tracking-widest shadow-sm flex items-center gap-2"
                            >
                                <MdOpenInNew className="w-4 h-4" /> View My Submission
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-10 py-4 bg-indigo-600 text-white rounded-2xl hover:scale-[1.05] active:scale-95 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-2"
                            >
                                <MdSend className="w-4 h-4" /> Submit Records
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="p-6 md:p-10 flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Master Panel (lg:col-span-8) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Grade Showcase */}
                        {submissionStatus === 'graded' && mySubmission && (
                            <div className="bg-green-50 border border-green-100 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in zoom-in duration-300">
                                <div className="flex items-center gap-6 text-center md:text-left">
                                    <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-green-600 shadow-sm border border-green-50">
                                        <MdGrade className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-green-900 text-xl font-black tracking-tight">Assignment Graded!</h3>
                                        <p className="text-green-700 text-sm font-medium mt-1">Excellent work! Your instructor has posted your results.</p>
                                    </div>
                                </div>
                                <div className="bg-white px-10 py-6 rounded-[28px] border border-green-100 text-center shadow-xl shadow-green-100/50 min-w-[180px]">
                                    <span className="block text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-2">Final Score</span>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-black text-green-900">{mySubmission.grade}</span>
                                        <span className="text-slate-300 font-bold text-lg">/ {assignment.maxMarks}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Instructions Section */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <MdOutlineDescription className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold tracking-tight text-slate-900">Brief & Instructions</h2>
                            </div>
                            <div className="p-8 md:p-10">
                                {assignment.description ? (
                                    <div className="text-slate-700 text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap">
                                        {assignment.description}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <MdInfoOutline className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                        <p className="text-slate-400 font-medium italic">No instructions provided for this assignment.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Resources Section */}
                        {assignment.attachments?.length > 0 && (
                            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                        <MdAttachment className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight text-slate-900">Resource Materials</h2>
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {assignment.attachments.map((file, idx) => (
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
                                                <p className="text-sm font-bold text-slate-900 truncate">{file.original_filename || `Material ${idx + 1}`}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Static Asset • {file.format?.toUpperCase() || 'FILE'}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Meta Controls (lg:col-span-4) */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Specs Card */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 space-y-8">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-b border-slate-50 pb-6">Specifications</h3>
                            
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isOverdue && submissionStatus === 'pending' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                        <MdCalendarToday className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Submission Date</p>
                                        <p className={`text-sm font-bold ${isOverdue && submissionStatus === 'pending' ? 'text-rose-600' : 'text-slate-900'}`}>
                                            {new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                                            {new Date(assignment.dueDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                                        <MdGrade className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weightage</p>
                                        <p className="text-sm font-bold text-slate-900">{assignment.maxMarks || 100} Maximum Points</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${statusConfig.bg} ${statusConfig.color}`}>
                                        <StatusIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Submission Status</p>
                                        <p className="text-sm font-bold text-slate-900">{statusConfig.label}</p>
                                    </div>
                                </div>
                            </div>

                            {submissionStatus === 'pending' && (
                                <div className="pt-6">
                                    <button 
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Upload Final Work
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Support Block */}
                        <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-[32px] p-8">
                            <div className="flex gap-4 text-indigo-600 mb-4">
                                <MdHelpOutline className="shrink-0 w-6 h-6" />
                                <h4 className="font-bold text-sm tracking-tight">Need Guidance?</h4>
                            </div>
                            <p className="text-xs text-indigo-700/60 leading-relaxed font-medium">
                                If you're experiencing technical difficulties or have questions regarding the task brief, please consult your course instructor via the dashboard.
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

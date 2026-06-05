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
            <div className="min-h-screen bg-[#F9FAFB] p-3 sm:p-6 lg:p-8 animate-pulse space-y-6">
                <div className="h-16 bg-white rounded-2xl w-full border border-slate-100 shadow-sm"></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="h-64 bg-white rounded-2xl border border-slate-100 shadow-sm"></div>
                        <div className="h-40 bg-white rounded-2xl border border-slate-100 shadow-sm"></div>
                    </div>
                    <div className="lg:col-span-4 h-96 bg-white rounded-2xl border border-slate-100 shadow-sm"></div>
                </div>
            </div>
        );
    }

    if (error || !assignment) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-rose-100">
                    <MdInfoOutline className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Assignment Not Found</h2>
                <p className="text-xs font-medium text-slate-500 mb-6 max-w-xs">{error || "This assignment might have been removed."}</p>
                <button 
                    onClick={() => navigate('/assignments')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center gap-2"
                >
                    <MdArrowBack /> Return to List
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
                return { label: 'Pending', color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100', icon: MdAccessTime };
        }
    };

    const statusConfig = getStatusConfig(submissionStatus);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col antialiased font-sans text-slate-900">
            
            {/* ── Page Header ── */}
            <div className="bg-white border-b border-slate-100 px-4 py-6 sm:px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4">
                        <button 
                            onClick={() => navigate('/assignments')}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            <MdArrowBack className="w-4 h-4" /> Return to Task Center
                        </button>
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                                    {assignment.title}
                                </h1>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border flex items-center gap-1 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                                    <StatusIcon className="w-2.5 h-2.5" />
                                    {statusConfig.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <MdMenuBook className="text-indigo-500 w-3.5 h-3.5" /> {assignment.course?.title || 'Unknown Course'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {submissionStatus !== 'pending' ? (
                            <button
                                onClick={() => navigate(`/submissions/${submissionId}`)}
                                className="px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-50 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm flex items-center gap-2"
                            >
                                <MdOpenInNew className="w-4 h-4 text-slate-400" /> My Submission
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:scale-[1.05] active:scale-95 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center gap-2"
                            >
                                <MdSend className="w-4 h-4" /> Turn In Work
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Master Panel (lg:col-span-8) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Grade Showcase */}
                        {submissionStatus === 'graded' && mySubmission && (
                            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 animate-in fade-in zoom-in duration-300 shadow-sm shadow-green-50">
                                <div className="flex items-center gap-4 text-center sm:text-left">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm border border-green-100">
                                        <MdGrade className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-green-900 text-base font-black tracking-tight uppercase tracking-widest">Assessment Finalized</h3>
                                        <p className="text-green-700 text-xs font-medium mt-0.5">Your results are ready for review below.</p>
                                    </div>
                                </div>
                                <div className="bg-white px-6 py-3 rounded-xl border border-green-100 text-center shadow-md min-w-[140px]">
                                    <span className="block text-[8px] font-black text-green-600 uppercase tracking-widest mb-0.5">Final Score</span>
                                    <div className="flex items-baseline justify-center gap-0.5">
                                        <span className="text-2xl font-black text-green-900">{mySubmission.grade}</span>
                                        <span className="text-slate-300 font-bold text-xs">/ {assignment.maxMarks}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Instructions Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <MdOutlineDescription className="w-4 h-4" />
                                </div>
                                <h2 className="text-sm font-black tracking-tight text-slate-900 uppercase tracking-widest">Brief & Instructions</h2>
                            </div>
                            <div className="p-6 sm:p-8">
                                {assignment.description ? (
                                    <div className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                        {assignment.description}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 opacity-40">
                                        <MdInfoOutline className="w-10 h-10 mx-auto mb-4" />
                                        <p className="text-xs font-black uppercase tracking-widest">No instructions provided</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Resources Section */}
                        {assignment.attachments?.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <MdAttachment className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-sm font-black tracking-tight text-slate-900 uppercase tracking-widest">Resource Materials</h2>
                                </div>
                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {assignment.attachments.map((file, idx) => (
                                        <a 
                                            key={idx}
                                            href={file.url || file.secure_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-slate-50 transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-white transition-colors shadow-sm">
                                                <MdDownload className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-slate-900 truncate">{file.original_filename || `Asset ${idx + 1}`}</p>
                                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-0.5">Asset • {file.format?.toUpperCase() || 'FILE'}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Meta Controls (lg:col-span-4) */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Specs Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-4">Specifications</h3>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOverdue && submissionStatus === 'pending' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                        <MdCalendarToday className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Deadline</p>
                                        <p className={`text-xs font-bold ${isOverdue && submissionStatus === 'pending' ? 'text-rose-600' : 'text-slate-900'}`}>
                                            {new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] font-medium text-slate-500">
                                            {new Date(assignment.dueDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                                        <MdGrade className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Weightage</p>
                                        <p className="text-xs font-bold text-slate-900">{assignment.maxMarks || 100} Total Points</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${statusConfig.bg} ${statusConfig.color}`}>
                                        <StatusIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Current Status</p>
                                        <p className="text-xs font-bold text-slate-900">{statusConfig.label}</p>
                                    </div>
                                </div>
                            </div>

                            {submissionStatus === 'pending' && (
                                <div className="pt-4 border-t border-slate-50">
                                    <button 
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Submit Final Work
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Support Block */}
                        <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-6">
                            <div className="flex gap-3 text-indigo-600 mb-3">
                                <MdHelpOutline className="shrink-0 w-5 h-5" />
                                <h4 className="font-black text-xs uppercase tracking-widest">Need Support?</h4>
                            </div>
                            <p className="text-[10px] text-indigo-700/60 leading-relaxed font-bold uppercase tracking-wider">
                                Contact your course instructor via the dashboard message center for clarification on the assignment brief.
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

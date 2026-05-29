import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignmentById } from '../../API/assignment.api';
import { mySubmissions } from '../../API/submission.api';
import { MdArrowBack, MdDownload, MdCalendarToday, MdGrade, MdCheckCircle, MdMenuBook, MdAccessTime, MdInfoOutline, MdOutlineDescription, MdAttachment } from 'react-icons/md';
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

    if (error || !assignment) {
        return (
            <div className="h-full w-full bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-8 shadow-inner border border-rose-100">
                    <span className="text-4xl">⚠️</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Assignment Not Found</h2>
                <p className="text-gray-500 mb-10 max-w-sm text-lg leading-relaxed">{error || "This assignment might have been deleted or you don't have access."}</p>
                <button 
                    onClick={() => navigate('/assignments')}
                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all font-bold flex items-center gap-3 shadow-xl shadow-gray-200"
                >
                    <MdArrowBack className="w-6 h-6" />
                    Back to Assignments
                </button>
            </div>
        );
    }

    const getStatusConfig = (status) => {
        switch (status) {
            case 'graded':
                return { label: 'Graded', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: MdCheckCircle };
            case 'submitted':
                return { label: 'Submitted', color: 'text-blue-700', bg: 'bg-blue-100', icon: MdCheckCircle };
            case 'late':
                return { label: 'Submitted Late', color: 'text-amber-700', bg: 'bg-amber-100', icon: MdAccessTime };
            default:
                return { label: 'Pending Submission', color: 'text-gray-600', bg: 'bg-gray-100', icon: MdAccessTime };
        }
    };

    const statusConfig = getStatusConfig(submissionStatus);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="h-full w-full bg-white rounded-2xl flex flex-col overflow-y-auto relative scrollbar-hide">
            
            {/* ── Modern Header Banner ───────────────────────────────────── */}
            <div className="relative bg-[#1A1A1A] overflow-hidden">
                {/* Abstract visual elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] -ml-24 -mb-24"></div>
                
                <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto">
                    <button 
                        onClick={() => navigate('/assignments')}
                        className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white font-semibold mb-8 transition-all w-fit"
                    >
                        <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                            <MdArrowBack className="w-4 h-4" />
                        </div>
                        Back to Assignments
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-4 max-w-3xl">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
                                    <MdMenuBook className="w-4 h-4" />
                                    {assignment?.course?.title}
                                </span>
                                <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${statusConfig.bg} ${statusConfig.color} px-4 py-2 rounded-full border border-white/10`}>
                                    <StatusIcon className="w-4 h-4" />
                                    {statusConfig.label}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                                {assignment.title}
                            </h1>
                        </div>
                        
                        <div className="shrink-0">
                            {submissionStatus === 'submitted' || submissionStatus === 'graded' || submissionStatus === 'late' ? (
                                <button
                                    onClick={() => navigate(`/submissions/${submissionId}`)}
                                    className="w-full md:w-auto px-10 py-5 bg-white text-gray-900 rounded-2xl hover:bg-gray-100 transition-all font-black text-lg shadow-2xl flex items-center justify-center gap-3 group"
                                >
                                    View My Submission
                                    <MdCheckCircle className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full md:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-lg shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3 group"
                                >
                                    Submit Assignment
                                    <MdArrowBack className="w-6 h-6 rotate-180 group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Layout ────────────────────────────────────────────── */}
            <div className="flex-1 p-6 md:p-10 lg:p-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                    
                    {/* Left Column: Core Info */}
                    <div className="lg:col-span-8 space-y-12">
                        
                        {/* Description Section */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                    <MdOutlineDescription className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Assignment Overview</h2>
                            </div>
                            
                            <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100">
                                {assignment.description ? (
                                    <div className="prose prose-lg prose-indigo max-w-none text-gray-700 leading-relaxed font-medium">
                                        {assignment.description.split('\n').map((para, i) => (
                                            <p key={i} className={i > 0 ? 'mt-4' : ''}>{para}</p>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic text-lg text-center py-10">No specific instructions provided for this assignment.</p>
                                )}
                            </div>
                        </section>

                        {/* Attachments Section */}
                        {assignment.attachments && assignment.attachments.length > 0 && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                                        <MdAttachment className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Supporting Materials</h2>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {assignment.attachments.map((file, idx) => (
                                        <a 
                                            key={idx}
                                            href={file.url || file.secure_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-5 p-5 bg-white border border-gray-100 rounded-2xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                                        >
                                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0 border border-gray-100 group-hover:border-indigo-100">
                                                <MdDownload className="w-7 h-7 text-gray-400 group-hover:text-indigo-600 transition-transform group-hover:-translate-y-1" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="block text-sm font-black text-gray-900 truncate mb-1 group-hover:text-indigo-600 transition-colors">
                                                    {file.original_filename || `Resource ${idx + 1}`}
                                                </span>
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                    Download Resource
                                                </span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Key Details Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-12 space-y-8">
                            
                            {/* Summary Card */}
                            <div className="bg-gray-900 rounded-3xl p-8 shadow-2xl shadow-gray-200 text-white space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                                
                                <h3 className="text-xl font-black tracking-tight relative z-10">Essential Details</h3>
                                
                                <div className="space-y-8 relative z-10">
                                    <div className="flex items-start gap-5">
                                        <div className={`p-3 rounded-2xl shrink-0 ${isOverdue && submissionStatus === 'pending' ? 'bg-rose-500/20 text-rose-300' : 'bg-white/10 text-gray-300'}`}>
                                            <MdCalendarToday className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Due Date</p>
                                            <p className={`text-lg font-black ${isOverdue && submissionStatus === 'pending' ? 'text-rose-400' : 'text-white'}`}>
                                                {new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            {isOverdue && submissionStatus === 'pending' && (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-400 rounded-full text-[10px] font-black uppercase tracking-widest mt-2 border border-rose-500/30">
                                                    <MdAccessTime className="w-3.5 h-3.5" />
                                                    Overdue
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-5">
                                        <div className="p-3 bg-white/10 text-gray-300 rounded-2xl shrink-0">
                                            <MdGrade className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Maximum Score</p>
                                            <p className="text-2xl font-black text-white">
                                                {assignment.maxMarks} <span className="text-lg text-gray-500 font-bold ml-1">pts</span>
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-5">
                                        <div className={`p-3 rounded-2xl shrink-0 ${submissionStatus === 'graded' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-gray-300'}`}>
                                            <MdCheckCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Status</p>
                                            <p className="text-lg font-black text-white capitalize">
                                                {submissionStatus}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Help Box */}
                            <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 flex gap-4">
                                <div className="text-indigo-600 p-1">
                                    <MdInfoOutline className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-black text-indigo-900 tracking-tight text-sm mb-1">Need help?</h4>
                                    <p className="text-xs text-indigo-700/70 leading-relaxed font-semibold">
                                        If you encounter any issues while submitting, please contact your course instructor or technical support.
                                    </p>
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

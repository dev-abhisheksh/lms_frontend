import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSingleSubmission } from '../../API/submission.api';
import { MdArrowBack, MdDownload, MdGrade, MdAccessTime, MdCheckCircle, MdNotes, MdOutlineFeedback, MdCalendarToday, MdMenuBook } from 'react-icons/md';

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
            <div className="h-full w-full bg-white rounded-xl shadow-sm p-6 flex flex-col animate-pulse">
                <div className="h-32 bg-gray-200 rounded-2xl mb-8 w-full"></div>
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-6">
                        <div className="h-64 bg-gray-100 rounded-2xl"></div>
                        <div className="h-40 bg-gray-100 rounded-2xl"></div>
                    </div>
                    <div className="w-full lg:w-80 space-y-6">
                        <div className="h-48 bg-gray-50 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !submission) {
        return (
            <div className="h-full w-full bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-rose-100">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-sm">{error || "The submission you're looking for doesn't exist or you don't have access to it."}</p>
                <button 
                    onClick={() => navigate('/submissions')}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium flex items-center gap-2 shadow-lg shadow-gray-200"
                >
                    <MdArrowBack className="w-5 h-5" />
                    Back to Submissions
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
        <div className="h-full w-full bg-gray-50/50 rounded-xl flex flex-col overflow-y-auto">
            
            {/* Header Banner */}
            <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 md:p-10 shrink-0">
                <div className="absolute inset-0 overflow-hidden rounded-t-xl opacity-20">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl mix-blend-screen"></div>
                    <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500 rounded-full blur-3xl mix-blend-screen"></div>
                </div>
                
                <div className="relative z-10 max-w-6xl mx-auto">
                    <button 
                        onClick={() => navigate('/submissions')}
                        className="flex items-center gap-2 text-sm text-gray-300 hover:text-white font-medium mb-6 transition-colors w-fit bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm"
                    >
                        <MdArrowBack className="w-4 h-4" />
                        My Submissions
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${statusStyle.bg} ${statusStyle.color} shadow-sm`}>
                                    <StatusIcon className="w-4 h-4" />
                                    {statusStyle.label}
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-sm text-gray-300 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                    <MdMenuBook className="w-4 h-4" />
                                    {assignment?.course?.title}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight tracking-tight">
                                {assignment?.title}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
                    
                    {/* Main Content (Left Column) */}
                    <div className="flex-1 space-y-6">
                        
                        {/* Assignment Instructions */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-blue-50/50">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <MdMenuBook className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">Assignment Instructions</h3>
                            </div>
                            <div className="p-6">
                                {assignment?.description ? (
                                    <div className="prose prose-sm md:prose-base max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {assignment.description}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-gray-400 italic">No specific instructions were provided.</p>
                                    </div>
                                )}

                                {assignment?.attachments && assignment.attachments.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Reference Materials</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {assignment.attachments.map((file, idx) => (
                                                <a 
                                                    key={idx}
                                                    href={file.url || file.secure_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group/file"
                                                >
                                                    <div className="p-2 bg-gray-50 rounded-md group-hover/file:bg-blue-100 group-hover/file:text-blue-600 transition-colors shrink-0">
                                                        <MdDownload className="w-4 h-4 text-gray-500 group-hover/file:text-blue-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 truncate group-hover/file:text-blue-700">
                                                        {file.original_filename || `Material ${idx + 1}`}
                                                    </span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Text Answer */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <MdNotes className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">Submitted Text</h3>
                            </div>
                            <div className="p-6">
                                {textAnswer ? (
                                    <div className="prose prose-sm md:prose-base max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {textAnswer}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400 italic">No text answer was provided for this submission.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Attached Files */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                    <MdDownload className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">Attachments</h3>
                                <span className="ml-auto bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                                    {files?.length || 0} Files
                                </span>
                            </div>
                            
                            <div className="p-6">
                                {files && files.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {files.map((file, idx) => (
                                            <a 
                                                key={idx}
                                                href={file.url || file.secure_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all bg-white"
                                            >
                                                <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                                                    <MdDownload className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                                        {file.original_filename || `Attachment ${idx + 1}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5 uppercase font-medium tracking-wider">
                                                        {file.format || 'FILE'} • {(file.bytes / 1024).toFixed(0)} KB
                                                    </p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400 italic">No files were attached to this submission.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area (Right Column) */}
                    <div className="w-full lg:w-80 space-y-6">
                        
                        {/* Grades Card */}
                        {status === 'graded' && (
                            <div className="bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-200 p-6 text-white relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 opacity-20">
                                    <MdGrade className="w-32 h-32" />
                                </div>
                                <h3 className="font-semibold text-emerald-50 mb-2 relative z-10 text-sm uppercase tracking-wider">Score Achieved</h3>
                                <div className="flex items-baseline gap-2 relative z-10 mb-6">
                                    <span className="text-5xl font-black">{grade}</span>
                                    <span className="text-xl font-medium text-emerald-100">/ {assignment?.maxMarks}</span>
                                </div>
                                
                                {feedback && (
                                    <div className="relative z-10 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                                        <h4 className="flex items-center gap-2 text-sm font-bold mb-2 text-emerald-50">
                                            <MdOutlineFeedback className="w-4 h-4" />
                                            Teacher's Feedback
                                        </h4>
                                        <p className="text-sm text-emerald-50 leading-relaxed">
                                            {feedback}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Metadata Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 text-lg mb-5">Timeline</h3>
                            
                            <div className="space-y-5 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                
                                <div className="flex gap-4 relative z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-[3px] border-white shadow-sm ${submitDate > dueDate ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        <MdCheckCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Submitted</p>
                                        <p className="text-xs text-gray-500 mt-1">{submitDate.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 relative z-10">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-[3px] border-white shadow-sm bg-blue-100 text-blue-600">
                                        <MdCalendarToday className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Due Date</p>
                                        <p className="text-xs text-gray-500 mt-1">{dueDate.toLocaleString()}</p>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
};

export default SubmissionDetail;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSingleSubmission } from '../../API/submission.api';
import { MdArrowBack, MdDownload, MdGrade, MdAccessTime, MdCheckCircle, MdNotes, MdOutlineFeedback } from 'react-icons/md';

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
                return { color: 'text-green-700', bg: 'bg-green-100', label: 'Graded', icon: MdGrade };
            case 'late':
                return { color: 'text-red-700', bg: 'bg-red-100', label: 'Late Submission', icon: MdAccessTime };
            case 'submitted':
            default:
                return { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Submitted', icon: MdCheckCircle };
        }
    };

    if (loading) {
        return (
            <div className="h-full w-full bg-white rounded-xl shadow-sm p-6 flex flex-col animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                <div className="h-32 bg-gray-100 rounded-xl mb-6"></div>
                <div className="h-64 bg-gray-50 rounded-xl"></div>
            </div>
        );
    }

    if (error || !submission) {
        return (
            <div className="h-full w-full bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center">
                <div className="text-red-500 mb-4 text-4xl">⚠️</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong.</h2>
                <p className="text-gray-600 mb-6">{error || "Submission not found."}</p>
                <button 
                    onClick={() => navigate('/submissions')}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Back to Submissions
                </button>
            </div>
        );
    }

    const { assignment, textAnswer, files, submittedAt, status, grade, feedback } = submission;
    const statusStyle = getStatusStyle(status);
    const StatusIcon = statusStyle.icon;

    return (
        <div className="h-full w-full bg-gray-50/50 rounded-xl shadow-sm flex flex-col overflow-hidden">
            
            {/* Header Area */}
            <div className="bg-white border-b border-gray-100 p-6">
                <button 
                    onClick={() => navigate('/submissions')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium mb-6 transition-colors w-fit"
                >
                    <MdArrowBack className="w-4 h-4" />
                    Back to My Submissions
                </button>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${statusStyle.bg} ${statusStyle.color}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {statusStyle.label}
                            </span>
                            <span className="text-sm text-gray-500">
                                Submitted on {new Date(submittedAt).toLocaleString()}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">{assignment?.title}</h1>
                        <p className="text-sm text-gray-600">{assignment?.course?.title} • {assignment?.course?.department?.name}</p>
                    </div>

                    {status === 'graded' && (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 min-w-[140px] text-center shrink-0">
                            <p className="text-xs text-green-700 font-semibold mb-1 uppercase tracking-wider">Score</p>
                            <div className="text-2xl font-black text-green-700">
                                {grade} <span className="text-base font-medium text-green-600/70">/ {assignment?.maxMarks}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-6">
                    
                    {/* Grader Feedback (If graded) */}
                    {status === 'graded' && feedback && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                                <MdOutlineFeedback className="w-5 h-5 text-purple-500" />
                                Teacher's Feedback
                            </h3>
                            <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100 text-gray-800 text-sm whitespace-pre-wrap">
                                {feedback}
                            </div>
                        </div>
                    )}

                    {/* Text Answer */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                            <MdNotes className="w-5 h-5 text-blue-500" />
                            Submitted Text Answer
                        </h3>
                        {textAnswer ? (
                            <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50/50 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap min-h-[100px]">
                                {textAnswer}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No text answer provided.</p>
                        )}
                    </div>

                    {/* Attached Files */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                            <MdDownload className="w-5 h-5 text-orange-500" />
                            Attached Files
                        </h3>
                        
                        {files && files.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {files.map((file, idx) => (
                                    <a 
                                        key={idx}
                                        href={file.url || file.secure_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 group transition-all"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2 bg-gray-100 group-hover:bg-blue-100 text-gray-600 group-hover:text-blue-600 rounded-md transition-colors shrink-0">
                                                <MdDownload className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 truncate">
                                                {file.original_filename || `Attachment ${idx + 1}`}
                                            </span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No files attached.</p>
                        )}
                    </div>

                </div>
            </div>

        </div>
    );
};

export default SubmissionDetail;

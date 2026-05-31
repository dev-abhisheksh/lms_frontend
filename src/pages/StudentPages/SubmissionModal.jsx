import React, { useState } from 'react';
import { MdClose, MdUploadFile, MdCloudUpload, MdSend } from 'react-icons/md';
import { createSubmission } from '../../API/submission.api';

const SubmissionModal = ({ isOpen, onClose, assignment, onSuccess }) => {
    const [textAnswer, setTextAnswer] = useState('');
    const [files, setFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !assignment) return null;

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length + files.length > 5) {
            setError("You can only upload a maximum of 5 files.");
            return;
        }
        setFiles(prev => [...prev, ...selectedFiles]);
        setError('');
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!textAnswer.trim() && files.length === 0) {
            setError('Please provide a text answer or attach at least one file.');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('textAnswer', textAnswer);
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            await createSubmission(assignment._id, formData);
            onSuccess(); 
        } catch (err) {
            console.error("Submission error:", err);
            setError(err.response?.data?.message || 'Failed to submit assignment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Hand In Work</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">{assignment.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-2xl transition-all"
                    >
                        <MdClose className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 overflow-y-auto scrollbar-hide">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-2xl text-sm font-bold border border-rose-100 flex items-center gap-3">
                            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                            {error}
                        </div>
                    )}

                    <form id="submission-form" onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">
                                Written Response
                            </label>
                            <textarea
                                value={textAnswer}
                                onChange={(e) => setTextAnswer(e.target.value)}
                                rows={6}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all resize-none text-sm font-medium"
                                placeholder="Type your answer here..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">
                                Attachments <span className="text-gray-300 font-bold ml-1">(Up to 5 files)</span>
                            </label>
                            
                            <div className="border-2 border-dashed border-gray-100 rounded-[32px] p-10 bg-gray-50/50 hover:bg-gray-50 hover:border-indigo-300 transition-all text-center cursor-pointer relative group">
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <MdCloudUpload className="w-8 h-8 text-indigo-600" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">
                                        Drag & drop or click to upload
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                                        PDF, DOCX, ZIP, IMAGES
                                    </p>
                                </div>
                            </div>

                            {files.length > 0 && (
                                <div className="mt-6 space-y-3">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                                                    <MdUploadFile className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700 truncate">
                                                    {file.name}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all shrink-0"
                                            >
                                                <MdClose className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 md:p-8 border-t border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-3 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-2xl hover:bg-gray-100 transition-all"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        form="submission-form"
                        type="submit"
                        disabled={isSubmitting}
                        className="px-10 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-indigo-500/20"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Submitting...</span>
                            </div>
                        ) : (
                            <>
                                <MdSend />
                                <span>Confirm Submission</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmissionModal;

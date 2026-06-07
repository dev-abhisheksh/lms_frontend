import React, { useState, useEffect } from 'react';
import { getCourseAnnouncements, createAnnouncement, deleteAnnouncement } from '../API/announcement.api';
import { MdCampaign, MdAdd, MdDelete, MdPushPin, MdAttachFile, MdClose, MdOutlineInfo } from 'react-icons/md';
import { toast } from 'react-hot-toast';

const Announcements = ({ courseId, role }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        isPinned: false
    });
    const [files, setFiles] = useState([]);

    const isTeacher = role === 'teacher' || role === 'admin';

    useEffect(() => {
        fetchAnnouncements();
    }, [courseId]);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const data = await getCourseAnnouncements(courseId);
            setAnnouncements(data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            toast.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            toast.error('Title and content are required');
            return;
        }

        try {
            setSubmitting(true);
            const data = new FormData();
            data.append('title', formData.title);
            data.append('content', formData.content);
            data.append('isPinned', formData.isPinned);
            files.forEach(file => {
                data.append('attachments', file);
            });

            await createAnnouncement(courseId, data);
            toast.success('Announcement posted successfully');
            setIsModalOpen(false);
            setFormData({ title: '', content: '', isPinned: false });
            setFiles([]);
            fetchAnnouncements();
        } catch (error) {
            console.error('Error creating announcement:', error);
            toast.error('Failed to post announcement');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await deleteAnnouncement(id);
            toast.success('Announcement deleted');
            setAnnouncements(prev => prev.filter(a => a._id !== id));
        } catch (error) {
            toast.error('Failed to delete announcement');
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-gray-500">Loading announcements...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MdCampaign className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-bold text-gray-900">Course Announcements</h2>
                </div>
                {isTeacher && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
                    >
                        <MdAdd className="w-5 h-5" />
                        Post Announcement
                    </button>
                )}
            </div>

            {announcements.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MdCampaign className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No Announcements Yet</h3>
                    <p className="text-sm text-gray-500 mt-1">There are no announcements for this course at the moment.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((ann) => (
                        <div key={ann._id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative group transition-all hover:border-indigo-100 ${ann.isPinned ? 'ring-2 ring-indigo-50 border-indigo-100' : ''}`}>
                            {ann.isPinned && (
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    <MdPushPin className="w-3 h-3" /> Pinned
                                </div>
                            )}
                            
                            <div className="flex items-start gap-4">
                                <img 
                                    src={ann.author?.profilePicture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                    alt="Author" 
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900">{ann.title}</h4>
                                            <p className="text-xs text-gray-500 font-medium">
                                                {ann.author?.firstName} {ann.author?.lastName} • {new Date(ann.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        {isTeacher && (
                                            <button 
                                                onClick={() => handleDelete(ann._id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <MdDelete className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-4 text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                                        {ann.content}
                                    </div>

                                    {ann.attachments?.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {ann.attachments.map((file, idx) => (
                                                <a 
                                                    key={idx} 
                                                    href={file.secure_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-lg text-xs font-medium transition border border-gray-100"
                                                >
                                                    <MdAttachFile className="w-3.5 h-3.5" />
                                                    {file.original_filename || 'Attachment'}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                                    <MdCampaign className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Post New Announcement</h3>
                                    <p className="text-sm text-gray-500 font-medium">Notify all students in this course</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition shadow-sm border border-transparent hover:border-gray-100">
                                <MdClose className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Announcement Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Enter a catchy title..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Content / Message</label>
                                <textarea
                                    required
                                    rows="6"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 resize-none"
                                    placeholder="Write your detailed message here..."
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1 block">Attachments</label>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => setFiles([...e.target.files])}
                                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all cursor-pointer"
                                    />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer group mt-6">
                                    <div className={`w-10 h-6 rounded-full transition-all relative ${formData.isPinned ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isPinned ? 'left-5' : 'left-1'}`} />
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.isPinned}
                                        onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                                    />
                                    <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition">Pin Announcement</span>
                                </label>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? 'Posting...' : 'Post Announcement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Announcements;

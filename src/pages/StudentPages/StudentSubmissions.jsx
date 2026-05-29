import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mySubmissions } from '../../API/submission.api';
import { MdOutlineUploadFile, MdGrade, MdAccessTime, MdCheckCircle, MdSearch } from 'react-icons/md';

const StudentSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMySubmissions = async () => {
            try {
                setLoading(true);
                const res = await mySubmissions();
                setSubmissions(res.data?.submissions || []);
            } catch (err) {
                console.error("Failed to fetch submissions:", err);
                setError("Failed to load submissions. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchMySubmissions();
    }, []);

    const filteredSubmissions = submissions.filter(sub => 
        sub.assignment?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.assignment?.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    return (
        <div className="h-full w-full bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Review your submitted assignments and grades
                        </p>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MdSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search submissions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 h-40 animate-pulse flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                </div>
                                <div className="h-8 bg-gray-50 rounded w-full mt-4"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <div className="text-red-500 mb-2">⚠️</div>
                        <p className="text-gray-600">{error}</p>
                    </div>
                ) : filteredSubmissions.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MdOutlineUploadFile className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No submissions yet</h3>
                        <p className="text-gray-500 text-sm">
                            {searchTerm ? "No submissions match your search" : "When you submit assignments, they will appear here"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSubmissions.map((sub) => {
                            const statusStyle = getStatusStyle(sub.status);
                            const StatusIcon = statusStyle.icon;

                            return (
                                <div 
                                    key={sub._id} 
                                    className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all group flex flex-col"
                                >
                                    <div className="p-5 flex-1">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${statusStyle.bg} ${statusStyle.color}`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {statusStyle.label}
                                            </span>
                                            {sub.status === 'graded' && (
                                                <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                                                    {sub.grade} / {sub.assignment?.maxMarks}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                                            {sub.assignment?.title || 'Unknown Assignment'}
                                        </h3>
                                        
                                        <p className="text-sm text-gray-500 mb-4 line-clamp-1">
                                            {sub.assignment?.course?.title || 'Unknown Course'}
                                        </p>

                                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-auto">
                                            <span>Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                                            {sub.files?.length > 0 && (
                                                <span className="flex items-center gap-1 before:content-['•'] before:mr-2 before:text-gray-300">
                                                    <MdOutlineUploadFile className="w-3.5 h-3.5" /> 
                                                    {sub.files.length} {sub.files.length === 1 ? 'file' : 'files'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-gray-100 p-3 bg-gray-50 rounded-b-xl flex justify-end">
                                        <button 
                                            onClick={() => navigate(`/submissions/${sub._id}`)}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors w-full text-center"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentSubmissions;

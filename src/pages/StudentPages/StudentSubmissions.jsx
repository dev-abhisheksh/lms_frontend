import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mySubmissions } from '../../API/submission.api';
import { 
    MdOutlineUploadFile, 
    MdGrade, 
    MdAccessTime, 
    MdCheckCircle, 
    MdSearch, 
    MdOutlineHistory,
    MdFilterList,
    MdArrowForward,
    MdCalendarToday,
    MdOutlineSchool,
    MdTimer,
    MdOutlineAssignmentTurnedIn
} from 'react-icons/md';

const StudentSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, graded, submitted, late
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

    const filteredSubmissions = submissions.filter(sub => {
        const matchesSearch = (sub.assignment?.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                             (sub.assignment?.course?.title?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        
        const matchesFilter = filter === 'all' || sub.status === filter;
        
        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'graded':
                return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', label: 'Graded', icon: MdGrade };
            case 'late':
                return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', label: 'Late', icon: MdTimer };
            case 'submitted':
            default:
                return { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', label: 'Submitted', icon: MdCheckCircle };
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] p-3 sm:p-6 antialiased font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* ── Page Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
                            <MdOutlineHistory className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">Submission Archive</h1>
                            <p className="text-xs sm:text-sm font-medium text-slate-500">
                                History of your academic work and evaluations
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 bg-white border border-slate-100 rounded-xl shadow-sm h-12 shrink-0">
                        <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                            <MdOutlineAssignmentTurnedIn className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Total Turned In</p>
                            <p className="text-sm font-bold text-slate-900 leading-none">{submissions.length} Tasks</p>
                        </div>
                    </div>
                </div>

                {/* ── Filters & Search ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-8 bg-white p-2 px-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <MdSearch className="w-5 h-5 text-slate-300" />
                        <input 
                            type="text" 
                            placeholder="Search by assignment or course..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 bg-transparent text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-300 placeholder:font-medium"
                        />
                    </div>

                    <div className="lg:col-span-4 bg-white p-2 px-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <MdFilterList className="w-5 h-5 text-slate-300" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="flex-1 bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer appearance-none"
                        >
                            <option value="all">All Submissions</option>
                            <option value="submitted">Processing</option>
                            <option value="graded">Graded</option>
                            <option value="late">Submitted Late</option>
                        </select>
                    </div>
                </div>

                {/* ── Main Content ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 h-48 animate-pulse space-y-4">
                                <div className="flex justify-between">
                                    <div className="w-20 h-5 bg-slate-50 rounded-full"></div>
                                    <div className="w-12 h-5 bg-slate-50 rounded-full"></div>
                                </div>
                                <div className="w-full h-6 bg-slate-50 rounded-lg"></div>
                                <div className="w-3/4 h-4 bg-slate-50 rounded-lg"></div>
                                <div className="pt-4 border-t border-slate-50 w-full h-8 mt-auto"></div>
                            </div>
                        ))
                    ) : error ? (
                        <div className="col-span-full bg-rose-50 border border-rose-100 rounded-2xl p-10 text-center">
                            <p className="text-rose-900 font-bold text-base mb-2">{error}</p>
                            <button onClick={() => window.location.reload()} className="text-rose-600 font-black text-[10px] uppercase tracking-widest hover:underline">
                                Reload Page
                            </button>
                        </div>
                    ) : filteredSubmissions.length === 0 ? (
                        <div className="col-span-full bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-6">
                                <MdOutlineUploadFile className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">No Submissions Located</h3>
                            <p className="text-xs font-medium text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
                                {searchTerm || filter !== 'all' 
                                    ? "Adjust your filters or search terms to find specific submissions." 
                                    : "You haven't submitted any assignments yet."}
                            </p>
                        </div>
                    ) : (
                        filteredSubmissions.map((sub) => {
                            const status = getStatusStyle(sub.status);
                            const StatusIcon = status.icon;

                            return (
                                <div 
                                    key={sub._id} 
                                    onClick={() => navigate(`/submissions/${sub._id}`)}
                                    className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group cursor-pointer flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border ${status.bg} ${status.color} ${status.border}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {status.label}
                                        </span>
                                        {sub.status === 'graded' && (
                                            <div className="flex items-baseline gap-0.5">
                                                <span className="text-base font-black text-slate-900">{sub.grade}</span>
                                                <span className="text-[10px] font-bold text-slate-300">/ {sub.assignment?.maxMarks}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 space-y-1">
                                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
                                            {sub.assignment?.title || 'Unknown Assignment'}
                                        </h3>
                                        
                                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <MdOutlineSchool className="w-3 h-3 shrink-0" />
                                            <span className="truncate">{sub.assignment?.course?.title || 'Unknown Course'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Date</p>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                                                <MdCalendarToday className="w-3 h-3 text-slate-300" />
                                                {new Date(sub.submittedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <MdArrowForward className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentSubmissions;

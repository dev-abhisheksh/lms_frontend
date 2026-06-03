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
                return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', label: 'Late Submission', icon: MdTimer };
            case 'submitted':
            default:
                return { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', label: 'Submitted', icon: MdCheckCircle };
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* ── Page Header ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[20px] bg-white border border-slate-100 shadow-sm flex items-center justify-center text-indigo-600">
                            <MdOutlineHistory className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Submission Archive</h1>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                A comprehensive history of your academic work and evaluations
                            </p>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-3 px-6 bg-white border border-slate-200 rounded-2xl shadow-sm h-14">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                            <MdOutlineAssignmentTurnedIn className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Turned In</p>
                            <p className="text-sm font-bold text-slate-900">{submissions.length} Tasks</p>
                        </div>
                    </div>
                </div>

                {/* ── Filters & Search ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-8 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                        <MdSearch className="w-5 h-5 text-slate-300 ml-2" />
                        <input 
                            type="text" 
                            placeholder="Search by assignment or course title..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 bg-transparent text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-300 placeholder:font-medium"
                        />
                    </div>

                    <div className="lg:col-span-4 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                        <MdFilterList className="w-5 h-5 text-slate-300 ml-2" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="flex-1 bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                        >
                            <option value="all">All Submissions</option>
                            <option value="submitted">Processing</option>
                            <option value="graded">Graded</option>
                            <option value="late">Submitted Late</option>
                        </select>
                    </div>
                </div>

                {/* ── Main Content ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-[40px] border border-slate-100 p-8 h-64 animate-pulse space-y-4">
                                <div className="flex justify-between">
                                    <div className="w-24 h-6 bg-slate-50 rounded-full"></div>
                                    <div className="w-16 h-6 bg-slate-50 rounded-full"></div>
                                </div>
                                <div className="w-full h-8 bg-slate-50 rounded-xl"></div>
                                <div className="w-3/4 h-6 bg-slate-50 rounded-lg"></div>
                                <div className="pt-4 border-t border-slate-50 w-full h-12 mt-auto"></div>
                            </div>
                        ))
                    ) : error ? (
                        <div className="col-span-full bg-rose-50 border border-rose-100 rounded-[32px] p-12 text-center">
                            <p className="text-rose-900 font-bold text-lg mb-2">{error}</p>
                            <button onClick={() => window.location.reload()} className="text-rose-600 font-black text-[10px] uppercase tracking-widest hover:underline">
                                Reload Page
                            </button>
                        </div>
                    ) : filteredSubmissions.length === 0 ? (
                        <div className="col-span-full bg-white rounded-[40px] border border-slate-100 p-20 text-center shadow-sm flex flex-col items-center justify-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 mb-8">
                                <MdOutlineUploadFile className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">No Submissions Located</h3>
                            <p className="text-sm font-medium text-slate-500 mt-3 max-w-sm mx-auto leading-relaxed">
                                {searchTerm || filter !== 'all' 
                                    ? "Adjust your filters or search terms to find specific submissions." 
                                    : "You haven't submitted any assignments yet. Once you do, your work will be archived here."}
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
                                    className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:scale-[1.02] transition-all group cursor-pointer flex flex-col"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.bg} ${status.color} ${status.border}`}>
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {status.label}
                                        </span>
                                        {sub.status === 'graded' && (
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-black text-slate-900">{sub.grade}</span>
                                                <span className="text-[10px] font-bold text-slate-300">/ {sub.assignment?.maxMarks}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 space-y-2">
                                        <h3 className="text-lg font-black text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
                                            {sub.assignment?.title || 'Unknown Assignment'}
                                        </h3>
                                        
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <MdOutlineSchool className="w-3.5 h-3.5" />
                                            <span className="truncate max-w-[200px]">{sub.assignment?.course?.title || 'Unknown Course'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Timestamp</p>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                <MdCalendarToday className="w-3.5 h-3.5 text-slate-300" />
                                                {new Date(sub.submittedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                            <MdArrowForward className="w-5 h-5" />
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

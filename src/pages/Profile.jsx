import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
    MdPerson, 
    MdEmail, 
    MdBadge, 
    MdOutlineSchool, 
    MdOutlineClass, 
    MdOutlineLayers,
    MdSecurity,
    MdOutlineInsights,
    MdOutlineEdit,
    MdSave,
    MdOutlineLock,
    MdOutlineVerifiedUser,
    MdOutlineCalendarToday,
    MdOutlineAccountCircle,
    MdLogout
} from 'react-icons/md';
import { getCurrentUser, updateProfile, changePassword, logoutUser } from '../API/auth.api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info'); // info, stats, security
    
    const [profileData, setProfileData] = useState({
        fullName: '',
        username: '',
        email: ''
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const res = await getCurrentUser();
            const userData = res.data.user;
            setUser(userData);
            setProfileData({
                fullName: userData.fullName || '',
                username: userData.username || '',
                email: userData.email || ''
            });
        } catch (error) {
            toast.error("Failed to load profile details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setIsUpdating(true);
            const res = await updateProfile(profileData);
            setUser({ ...user, ...res.data.user });
            setIsEditing(false);
            toast.success("Profile updated!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("Passwords mismatch.");
        }
        try {
            setIsUpdating(true);
            await changePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            toast.success("Password updated!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Change failed.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
            localStorage.clear();
            navigate('/login');
            toast.success("Logged out");
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] p-4 sm:p-6 animate-pulse space-y-4">
                <div className="h-32 bg-white rounded-2xl w-full"></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-4 h-48 bg-white rounded-2xl"></div>
                    <div className="lg:col-span-8 h-64 bg-white rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (!user) return <div className="p-10 text-center font-bold text-slate-400">Session expired.</div>;

    return (
        <div className="min-h-screen bg-[#F9FAFB] p-3 sm:p-6">
            <div className="max-w-5xl mx-auto space-y-4">
                
                {/* ── Compact Profile Hero ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="h-20 sm:h-28 bg-gradient-to-r from-indigo-600 to-indigo-400 relative">
                        <div className="absolute inset-0 opacity-10 pattern-grid-sm"></div>
                    </div>
                    <div className="px-5 pb-5 relative">
                        <div className="absolute -top-10 sm:-top-12 left-5">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1 shadow-lg border border-slate-50">
                                <div className="w-full h-full rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-2xl sm:text-4xl">
                                    {user.fullName?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-12 sm:pt-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{user.fullName}</h1>
                                    <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded-full text-[9px] font-black uppercase">
                                        Active
                                    </span>
                                </div>
                                <p className="text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest mt-0.5 flex items-center gap-2">
                                    <MdBadge className="text-indigo-500" /> {user.role} • @{user.username}
                                </p>
                            </div>
                            
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all w-fit"
                            >
                                <MdLogout className="w-3.5 h-3.5" /> Logout
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    
                    {/* ── Tab Navigation ── */}
                    <aside className="lg:col-span-4 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex lg:flex-col overflow-x-auto scrollbar-hide gap-1">
                            {[
                                {id: 'info', label: 'Identity', icon: MdOutlineAccountCircle},
                                {id: 'stats', label: 'Progress', icon: MdOutlineInsights},
                                {id: 'security', label: 'Access', icon: MdSecurity}
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 lg:flex-none p-3 rounded-xl transition-all flex items-center justify-center lg:justify-start gap-3 shrink-0 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-500'}`}
                                >
                                    <tab.icon size={18} />
                                    <span className="font-bold text-[10px] uppercase tracking-widest">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                    <MdOutlineVerifiedUser size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[8px] font-black text-slate-400 uppercase">System ID</p>
                                    <p className="text-[10px] font-mono font-bold text-slate-900 truncate">#{user._id.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                    <MdOutlineCalendarToday size={16} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase">Registration</p>
                                    <p className="text-[10px] font-bold text-slate-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* ── Main Detail Area ── */}
                    <main className="lg:col-span-8">
                        
                        {activeTab === 'info' && (
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Public Details</h2>
                                    <button 
                                        onClick={() => setIsEditing(!isEditing)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                                    >
                                        {isEditing ? 'Cancel' : <><MdOutlineEdit size={14} /> Edit</>}
                                    </button>
                                </div>
                                
                                <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Full Name</label>
                                            <div className="relative">
                                                <MdPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    value={profileData.fullName}
                                                    disabled={!isEditing}
                                                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                                                    className="w-full bg-slate-50 border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white rounded-xl p-3 pl-10 text-xs font-bold text-slate-900 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Username</label>
                                            <div className="relative">
                                                <MdBadge className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    value={profileData.username}
                                                    disabled={!isEditing}
                                                    onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                                                    className="w-full bg-slate-50 border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white rounded-xl p-3 pl-10 text-xs font-bold text-slate-900 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2 space-y-1.5">
                                            <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Email</label>
                                            <div className="relative">
                                                <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    disabled={!isEditing}
                                                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                                    className="w-full bg-slate-50 border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white rounded-xl p-3 pl-10 text-xs font-bold text-slate-900 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-50">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                                <MdOutlineSchool className="text-indigo-500 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase">Department</p>
                                                    <p className="text-[10px] font-bold text-slate-900 truncate">{user.department?.name || "None"}</p>
                                                </div>
                                            </div>
                                            {user.role === 'student' && (
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                                    <MdOutlineLayers className="text-indigo-500 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase">Year</p>
                                                        <p className="text-[10px] font-bold text-slate-900 truncate">{user.year || "N/A"}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="pt-2 flex justify-end">
                                            <button 
                                                type="submit" 
                                                disabled={isUpdating}
                                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:scale-105 transition-all disabled:opacity-50"
                                            >
                                                {isUpdating ? "Saving..." : "Save Profile"}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {activeTab === 'stats' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-2">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            <MdOutlineSchool size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase">Courses</p>
                                            <p className="text-2xl font-black text-slate-900">{user.stats?.courses || 0}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-2">
                                        <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                                            <MdOutlineLayers size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase">Finished</p>
                                            <p className="text-2xl font-black text-slate-900">{user.stats?.submissions || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-indigo-600 rounded-2xl p-8 text-center text-white relative overflow-hidden shadow-lg">
                                    <div className="relative z-10 space-y-4">
                                        <h3 className="text-lg font-black">Performance Pulse</h3>
                                        <p className="text-indigo-100 text-[10px] font-medium leading-relaxed max-w-xs mx-auto">
                                            Keep engaging with your coursework to maintain your academic momentum.
                                        </p>
                                        <button 
                                            onClick={() => navigate('/student')}
                                            className="px-6 py-2 bg-white text-indigo-600 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                                        >
                                            Go to Courses →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30">
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Security Desk</h2>
                                </div>
                                
                                <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Current Password</label>
                                        <div className="relative">
                                            <MdOutlineLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.oldPassword}
                                                onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                                                placeholder="••••••••"
                                                className="w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-indigo-500/10 focus:bg-white rounded-xl p-3 pl-10 text-xs font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-400 ml-1">New Key</label>
                                            <div className="relative">
                                                <MdSecurity className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                                    placeholder="••••••••"
                                                    className="w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-indigo-500/10 rounded-xl p-3 pl-10 text-xs font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Verify Key</label>
                                            <div className="relative">
                                                <MdOutlineLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                                    placeholder="••••••••"
                                                    className="w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-indigo-500/10 rounded-xl p-3 pl-10 text-xs font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex justify-end">
                                        <button 
                                            type="submit" 
                                            disabled={isUpdating}
                                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:scale-105 transition-all"
                                        >
                                            {isUpdating ? "Updating..." : "Update Security"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Profile;

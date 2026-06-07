import React, { useEffect, useState } from 'react'
import { getCourseById } from '../API/course.api'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { allModules } from '../API/module.api'
import { getNotesByCourse } from '../API/note.api'
import { 
    MdMenuBook, 
    MdDescription, 
    MdChevronRight, 
    MdOutlineLibraryBooks,
    MdOutlineAttachFile,
    MdOutlinePlayCircleOutline,
    MdOpenInNew,
    MdArrowBack,
    MdOutlineCollectionsBookmark,
    MdOutlineClass,
    MdOutlineLayers,
    MdCampaign
} from 'react-icons/md'
import Announcements from '../components/Announcements'

const CourseSingle = () => {
    const { courseID } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [course, setCourse] = useState("")
    const [modules, setModules] = useState([])
    const [materials, setMaterials] = useState([])
    const [activeTab, setActiveTab] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get('tab') || 'description';
    })
    const [loading, setLoading] = useState(true)
    const role = localStorage.getItem("role")

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && tab !== activeTab) setActiveTab(tab);
    }, [location.search]);

    useEffect(() => {
        // ... rest of useEffect
    }, [courseID])

    const formattedDate = course.createdAt ? new Date(course.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }) : "";

    const tabs = [
        { id: "description", label: "Overview", icon: MdDescription },
        { id: "modules", label: "Curriculum", icon: MdOutlineLayers },
        { id: "materials", label: "Resources", icon: MdOutlineLibraryBooks },
        { id: "announcements", label: "Announcements", icon: MdCampaign }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] p-4 sm:p-6 lg:p-8 animate-pulse space-y-8">
                <div className="h-24 bg-white rounded-[32px] w-full"></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        <div className="h-64 bg-white rounded-[32px]"></div>
                        <div className="h-96 bg-white rounded-[32px]"></div>
                    </div>
                    <div className="lg:col-span-4 h-80 bg-white rounded-[32px]"></div>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-[#F9FAFB] flex flex-col'>
            
            {/* ── Enhanced Course Header ── */}
            <div className='bg-white border-b border-slate-100 px-4 py-6 sm:px-6 sm:py-8 md:px-10'>
                <div className='max-w-7xl mx-auto'>
                    <div className='flex flex-col gap-6 sm:gap-8'>
                        <button 
                            onClick={() => navigate('/student')}
                            className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors w-fit"
                        >
                            <MdArrowBack className="w-3.5 h-3.5 sm:w-4 h-4" /> Back to My Learning
                        </button>
                        
                        <div className="space-y-4 sm:space-y-6">
                            <h1 className='text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight'>
                                {course.title}
                            </h1>
                            
                            <div className='flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest'>
                                <span className='flex items-center gap-2'>
                                    <div className='w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0'>
                                        <MdMenuBook className="w-3 h-3 sm:w-3.5 h-3.5" />
                                    </div>
                                    ID: {course.courseCode || "N/A"}
                                </span>
                                <span className='hidden sm:block w-1 h-1 bg-slate-200 rounded-full'></span>
                                <span className='flex items-center gap-2'>
                                    <div className='w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0'>
                                        <MdOutlineClass className="w-3 h-3 sm:w-3.5 h-3.5" />
                                    </div>
                                    {modules.length} Modules
                                </span>
                                <span className='hidden sm:block w-1 h-1 bg-slate-200 rounded-full'></span>
                                <span className="flex items-center gap-2">
                                   Added {formattedDate}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Modern Tabs Navigation (Responsive Scroll) ── */}
            <div className='bg-white border-b border-slate-100 sticky top-0 z-20'>
                <div className='max-w-7xl mx-auto overflow-x-auto scrollbar-hide flex px-4 sm:px-6 md:px-10 gap-6 sm:gap-10'>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-5 sm:py-6 px-1 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] transition-all relative flex items-center gap-2 shrink-0 group
                                ${activeTab === tab.id
                                    ? "text-indigo-600"
                                    : "text-slate-400 hover:text-slate-600"
                                }
                            `}
                        >
                            <tab.icon className={`w-3.5 h-3.5 sm:w-4 h-4 ${activeTab === tab.id ? "text-indigo-600" : "text-slate-300 group-hover:text-slate-400"}`} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full shadow-[0_-4px_10px_rgba(79,70,229,0.3)]"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab Content Area ── */}
            <div className='flex-1 p-4 sm:p-8 md:p-10'>
                <div className='max-w-7xl mx-auto'>
                    
                    {/* Overview Tab */}
                    {activeTab === "description" && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                            <div className='lg:col-span-8 bg-white rounded-3xl sm:rounded-[32px] p-6 sm:p-10 border border-slate-100 shadow-sm'>
                                <div className='flex items-center gap-4 mb-6 sm:mb-8'>
                                    <div className='w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0'>
                                        <MdDescription className="w-5 h-5 sm:w-6 h-6" />
                                    </div>
                                    <h2 className='text-xl sm:text-2xl font-black text-slate-900 tracking-tight'>Academic Syllabus</h2>
                                </div>
                                <div className='text-slate-600 leading-relaxed font-medium text-base sm:text-lg whitespace-pre-wrap'>
                                    {course.description || "Comprehensive course details have not been finalized for this academic track."}
                                </div>
                            </div>
                            
                            <aside className="lg:col-span-4 space-y-6">
                                <div className="bg-indigo-600 rounded-3xl sm:rounded-[32px] p-6 sm:p-8 text-white shadow-xl shadow-indigo-100">
                                    <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-indigo-200 mb-6">Course Stats</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] sm:text-xs font-bold opacity-80 uppercase tracking-wider">Total Modules</span>
                                            <span className="text-xl sm:text-2xl font-black">{modules.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] sm:text-xs font-bold opacity-80 uppercase tracking-wider">Resource Assets</span>
                                            <span className="text-xl sm:text-2xl font-black">{materials.length}</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-indigo-500/50">
                                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">Instructor Note</p>
                                        <p className="text-[11px] sm:text-xs font-medium leading-relaxed italic">
                                            "Welcome to your professional learning journey. Progress through modules sequentially for optimal results."
                                        </p>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    )}

                    {/* Curriculum Tab */}
                    {activeTab === "modules" && (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
                            {modules.length === 0 ? (
                                <div className="col-span-full bg-white rounded-3xl sm:rounded-[40px] border border-slate-100 p-12 sm:p-20 text-center shadow-sm flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-3xl sm:rounded-[40px] flex items-center justify-center text-slate-200 mb-8">
                                        <MdOutlineLayers className="w-10 h-10 sm:w-12 h-12" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">No Content Released</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-3 max-w-sm mx-auto">The curriculum for this course is currently under development.</p>
                                </div>
                            ) : modules.map((module, index) => (
                                <Link
                                    to={`/module/${module._id}`}
                                    key={module._id}
                                    className='bg-white border border-slate-100 rounded-3xl sm:rounded-[32px] p-5 sm:p-8 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group flex items-center gap-4 sm:gap-6'
                                >
                                    <div className='w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 text-slate-400 rounded-2xl sm:rounded-[22px] flex items-center justify-center font-black text-base sm:text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm shrink-0'>
                                        {String(index + 1).padStart(2, '0')}
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <h3 className='text-base sm:text-lg font-extrabold text-slate-900 truncate group-hover:text-indigo-600 transition-colors leading-tight'>{module.title}</h3>
                                        <div className='flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2'>
                                            <span className='px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-indigo-100 shrink-0'>
                                                Module
                                            </span>
                                            <span className='text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate'>
                                                {module.lessons?.length || 0} Lessons
                                            </span>
                                        </div>
                                    </div>
                                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0'>
                                        <MdChevronRight size={20} className="sm:w-6 sm:h-6" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Resources Tab */}
                    {activeTab === "materials" && (
                        <div className='space-y-6'>
                            {materials.length === 0 ? (
                                <div className="bg-white rounded-3xl sm:rounded-[40px] border border-slate-100 p-12 sm:p-20 text-center shadow-sm flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-3xl sm:rounded-[40px] flex items-center justify-center text-slate-200 mb-8">
                                        <MdOutlineCollectionsBookmark className="w-10 h-10 sm:w-12 h-12" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">Knowledge Repository</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-3 max-w-sm mx-auto">Supplemental learning materials and assets will appear here.</p>
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
                                    {materials.map((material) => (
                                        <div 
                                            key={material._id}
                                            className='bg-white border border-slate-100 rounded-3xl sm:rounded-[32px] p-6 sm:p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:scale-[1.01] transition-all group'
                                        >
                                            <div className='flex items-start gap-4 sm:gap-6'>
                                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                                                    material.type === 'link' ? 'bg-rose-50 text-rose-600' : 
                                                    material.type === 'resource' ? 'bg-blue-50 text-blue-600' : 
                                                    'bg-indigo-50 text-indigo-600'
                                                }`}>
                                                    {material.type === 'link' ? <MdOutlinePlayCircleOutline className="w-6 h-6 sm:w-7 sm:h-7" /> : 
                                                     material.type === 'resource' ? <MdOutlineAttachFile className="w-6 h-6 sm:w-7 sm:h-7" /> : 
                                                     <MdOutlineDescription className="w-6 h-6 sm:w-7 sm:h-7" />}
                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <div className='flex items-center gap-2 sm:gap-3 flex-wrap'>
                                                        <h3 className='text-base sm:text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate'>{material.title}</h3>
                                                        <span className='text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 bg-slate-50 text-slate-400 rounded-full border border-slate-100'>
                                                            {material.type}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className='flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 shrink-0'>
                                                        {material.chapter && <span className='text-slate-400'>{material.chapter}</span>}
                                                        {material.chapter && material.lessonName && <span className='w-1 h-1 bg-slate-200 rounded-full'></span>}
                                                        {material.lessonName && <span className='text-slate-400'>{material.lessonName}</span>}
                                                    </div>
                                                    
                                                    {material.content && (
                                                        <p className='text-xs sm:text-sm text-slate-500 font-medium mt-3 sm:mt-4 line-clamp-2 leading-relaxed'>
                                                            {material.content}
                                                        </p>
                                                    )}

                                                    <div className='mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-slate-50 flex items-center justify-between'>
                                                        <div className='flex -space-x-2 sm:-space-x-3'>
                                                            {material.attachments?.slice(0, 4).map((_, i) => (
                                                                <div key={i} className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm'>
                                                                    <MdOutlineAttachFile className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {material.type === 'link' && material.youtubeUrl ? (
                                                            <a 
                                                                href={material.youtubeUrl} 
                                                                target="_blank" 
                                                                rel="noreferrer"
                                                                className='flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-rose-50 text-rose-600 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] hover:bg-rose-600 hover:text-white transition-all shadow-sm'
                                                            >
                                                                Stream <MdOpenInNew className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                            </a>
                                                        ) : material.attachments?.length > 0 ? (
                                                            <div className='flex gap-2'>
                                                                {material.attachments.map((file, idx) => (
                                                                    <a 
                                                                        key={idx}
                                                                        href={file.secure_url} 
                                                                        target="_blank" 
                                                                        rel="noreferrer"
                                                                        className='w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm'
                                                                        title={file.original_filename}
                                                                    >
                                                                        <MdOutlineAttachFile className="w-4 h-4 sm:w-5 sm:h-5" />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Announcements Tab */}
                    {activeTab === "announcements" && (
                        <Announcements courseId={courseID} role={role} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default CourseSingle;

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
    MdCampaign,
    MdOutlineSchool
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
        const fetchCourseData = async () => {
            try {
                setLoading(true)
                const [courseRes, modulesRes, materialsRes] = await Promise.all([
                    getCourseById(courseID),
                    allModules(courseID),
                    getNotesByCourse(courseID)
                ])
                setCourse(courseRes.data.course)
                setModules(modulesRes.data.modules)
                setMaterials(materialsRes.data.notes)
            } catch (error) {
                console.error("COURSE DETAIL FETCH ERROR:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCourseData()
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
            <div className="min-h-screen bg-[#F9FAFB] p-4 sm:p-6 animate-pulse space-y-6">
                <div className="h-20 bg-white rounded-2xl w-full border border-slate-100"></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="h-64 bg-white rounded-2xl border border-slate-100"></div>
                        <div className="h-96 bg-white rounded-2xl border border-slate-100"></div>
                    </div>
                    <div className="lg:col-span-4 h-80 bg-white rounded-2xl border border-slate-100"></div>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-[#F9FAFB] flex flex-col'>
            
            {/* ── Compact Course Header ── */}
            <div className='bg-white border-b border-slate-100 px-4 py-6 sm:px-6 md:px-8'>
                <div className='max-w-7xl mx-auto'>
                    <div className='flex flex-col gap-4'>
                        <button 
                            onClick={() => navigate('/student')}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors w-fit"
                        >
                            <MdArrowBack className="w-4 h-4" /> Back to Courses
                        </button>
                        
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                                        {course.courseCode || "CRS-101"}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Enrolled: {formattedDate}
                                    </span>
                                </div>
                                <h1 className='text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight'>
                                    {course.title}
                                </h1>
                            </div>
                            
                            <div className='flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100'>
                                <div className="text-center px-3 border-r border-slate-200">
                                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Modules</p>
                                    <p className="text-lg font-black text-slate-900 leading-none">{modules.length}</p>
                                </div>
                                <div className="text-center px-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Resources</p>
                                    <p className="text-lg font-black text-slate-900 leading-none">{materials.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Navigation Tabs ── */}
            <div className='bg-white border-b border-slate-100 sticky top-0 z-20'>
                <div className='max-w-7xl mx-auto overflow-x-auto scrollbar-hide flex px-4 sm:px-6 md:px-8 gap-8'>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 font-black text-[10px] uppercase tracking-widest transition-all relative flex items-center gap-2 shrink-0 group
                                ${activeTab === tab.id
                                    ? "text-indigo-600"
                                    : "text-slate-400 hover:text-slate-600"
                                }
                            `}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-indigo-600" : "text-slate-300 group-hover:text-slate-400"}`} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Content Area ── */}
            <div className='flex-1 p-4 sm:p-6 md:p-8'>
                <div className='max-w-7xl mx-auto'>
                    
                    {/* Overview Tab */}
                    {activeTab === "description" && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className='lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm'>
                                <div className='flex items-center gap-3 mb-6'>
                                    <div className='w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0'>
                                        <MdDescription size={20} />
                                    </div>
                                    <h2 className='text-lg sm:text-xl font-black text-slate-900 tracking-tight'>Academic Syllabus</h2>
                                </div>
                                <div className='text-slate-600 font-medium text-sm sm:text-base leading-relaxed whitespace-pre-wrap'>
                                    {course.description || "Course details have not been finalized for this academic track."}
                                </div>
                            </div>
                            
                            <aside className="lg:col-span-4 space-y-6">
                                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Instructor Note</h3>
                                    <p className="text-xs font-medium text-slate-600 leading-relaxed italic border-l-4 border-indigo-100 pl-4">
                                        "Welcome to your professional learning journey. Progress through modules sequentially for optimal results."
                                    </p>
                                </div>
                                <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                                        <MdOutlineSchool size={120} />
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-4 relative z-10">Quick Action</h3>
                                    <button 
                                        onClick={() => setActiveTab('modules')}
                                        className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors relative z-10"
                                    >
                                        Start Learning
                                    </button>
                                </div>
                            </aside>
                        </div>
                    )}

                    {/* Curriculum Tab (List Item Compact Standard) */}
                    {activeTab === "modules" && (
                        <div className='space-y-3'>
                            {modules.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                                        <MdOutlineLayers size={32} />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900">No Content Released</h3>
                                    <p className="text-xs font-medium text-slate-500 mt-2">The curriculum is currently under development.</p>
                                </div>
                            ) : modules.map((module, index) => (
                                <Link
                                    to={`/module/${module._id}`}
                                    key={module._id}
                                    className='bg-white border border-slate-100 rounded-xl h-16 px-4 hover:shadow-md hover:border-indigo-100 transition-all group flex items-center gap-4'
                                >
                                    <div className='w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0'>
                                        {String(index + 1).padStart(2, '0')}
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <h3 className='text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors'>{module.title}</h3>
                                        <p className='text-[10px] text-slate-400 font-medium uppercase tracking-widest'>
                                            {module.lessons?.length || 0} Lessons
                                        </p>
                                    </div>
                                    <div className='w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0'>
                                        <MdChevronRight size={18} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Resources Tab */}
                    {activeTab === "materials" && (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {materials.length === 0 ? (
                                <div className="col-span-full bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                                        <MdOutlineCollectionsBookmark size={32} />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900">No Resources</h3>
                                    <p className="text-xs font-medium text-slate-500 mt-2">Supplemental materials will appear here.</p>
                                </div>
                            ) : materials.map((material) => (
                                <div 
                                    key={material._id}
                                    className='bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col gap-4'
                                >
                                    <div className='flex items-center gap-4'>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                                            material.type === 'link' ? 'bg-rose-50 text-rose-600' : 
                                            material.type === 'resource' ? 'bg-blue-50 text-blue-600' : 
                                            'bg-indigo-50 text-indigo-600'
                                        }`}>
                                            {material.type === 'link' ? <MdOutlinePlayCircleOutline size={20} /> : 
                                             material.type === 'resource' ? <MdOutlineAttachFile size={20} /> : 
                                             <MdOutlineDescription size={20} />}
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <div className="flex items-center gap-2">
                                                <h3 className='text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors'>{material.title}</h3>
                                                <span className='text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded-md border border-slate-100'>
                                                    {material.type}
                                                </span>
                                            </div>
                                            <p className='text-[10px] text-slate-400 font-medium truncate uppercase tracking-widest mt-0.5'>
                                                {material.lessonName || "Course Resource"}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {material.content && (
                                        <p className='text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed'>
                                            {material.content}
                                        </p>
                                    )}

                                    <div className='flex items-center justify-between mt-auto pt-4 border-t border-slate-50'>
                                        <div className='flex -space-x-2'>
                                            {material.attachments?.slice(0, 3).map((_, i) => (
                                                <div key={i} className='w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm'>
                                                    <MdOutlineAttachFile size={12} />
                                                </div>
                                            ))}
                                        </div>

                                        {material.type === 'link' && material.youtubeUrl ? (
                                            <a 
                                                href={material.youtubeUrl} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className='flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm'
                                            >
                                                Watch <MdOpenInNew size={14} />
                                            </a>
                                        ) : material.attachments?.length > 0 ? (
                                            <a 
                                                href={material.attachments[0].secure_url} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className='px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm'
                                            >
                                                Download
                                            </a>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Announcements Tab */}
                    {activeTab === "announcements" && (
                        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-sm">
                            <Announcements courseId={courseID} role={role} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CourseSingle;
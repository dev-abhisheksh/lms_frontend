import React, { useEffect, useState } from 'react'
import { getCourseById } from '../API/course.api'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { allModules } from '../API/module.api'
import { getAssignmentsByCourse } from '../API/assignment.api'
import { getTestsByCourse } from '../API/test.api'
import { getMyAttendance } from '../API/attendance.api'
import { MdAssignment, MdQuiz, MdMenuBook, MdDescription, MdChevronRight, MdAccessTime, MdGrade, MdCheckCircle, MdCancel, MdAccessAlarms } from 'react-icons/md'

const CourseSingle = () => {
    const { courseID } = useParams()
    const navigate = useNavigate()
    const [course, setCourse] = useState("")
    const [modules, setModules] = useState([])
    const [assignments, setAssignments] = useState([])
    const [tests, setTests] = useState([])
    const [attendance, setAttendance] = useState([])
    const [activeTab, setActiveTab] = useState('description')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true)
                const [courseRes, modulesRes, assignmentsRes, testsRes, attendanceRes] = await Promise.all([
                    getCourseById(courseID),
                    allModules(courseID).catch(() => ({ data: { modules: [] } })),
                    getAssignmentsByCourse(courseID).catch(() => ({ data: { assignments: [] } })),
                    getTestsByCourse(courseID).catch(() => ({ data: { tests: [] } })),
                    getMyAttendance(courseID).catch(() => ({ attendance: [] }))
                ]);

                setCourse(courseRes.data.course);
                
                if (Array.isArray(modulesRes.data.modules)) {
                    setModules(modulesRes.data.modules);
                }
                
                if (Array.isArray(assignmentsRes.data.assignments)) {
                    setAssignments(assignmentsRes.data.assignments);
                }

                if (Array.isArray(testsRes.data.tests)) {
                    setTests(testsRes.data.tests);
                }

                if (attendanceRes && attendanceRes.attendance) {
                    setAttendance(attendanceRes.attendance);
                }
            } catch (error) {
                console.error("Failed to fetch course data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCourseData()
    }, [courseID])

    // Converting Date into proper format
    const formattedDate = course.createdAt ? new Date(course.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) : "";

    const tabs = ["description", "modules", "assignments", "tests", "attendance"]

    if (loading) {
        return (
            <div className="h-full w-full bg-white rounded-xl p-8 animate-pulse space-y-8">
                <div className="h-32 bg-gray-100 rounded-2xl w-full"></div>
                <div className="h-10 bg-gray-50 rounded-lg w-1/2"></div>
                <div className="space-y-4">
                    <div className="h-20 bg-gray-50 rounded-xl w-full"></div>
                    <div className="h-20 bg-gray-50 rounded-xl w-full"></div>
                </div>
            </div>
        )
    }

    return (
        <div className='h-full w-full bg-gray-50/50 rounded-xl flex flex-col overflow-hidden'>
            
            {/* Course Header */}
            <div className='bg-white border-b border-gray-100 px-6 py-8 md:px-10'>
                <div className='max-w-7xl mx-auto'>
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
                        <div className='space-y-2'>
                            <h1 className='text-3xl font-black text-gray-900 tracking-tight'>{course.title}</h1>
                            <div className='flex items-center gap-4 text-sm text-gray-500 font-medium'>
                                <span className='flex items-center gap-1.5'>
                                    <MdMenuBook className="text-indigo-600" /> Course Code: {course.courseCode || "N/A"}
                                </span>
                                <span className='w-1 h-1 bg-gray-300 rounded-full'></span>
                                <span>Published on {formattedDate}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className='bg-white px-6 md:px-10 border-b border-gray-100'>
                <div className='max-w-7xl mx-auto flex gap-8'>
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-2 font-bold text-sm capitalize transition-all relative
                                ${activeTab === tab
                                    ? "text-indigo-600"
                                    : "text-gray-400 hover:text-gray-600"
                                }
                            `}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className='flex-1 overflow-y-auto p-6 md:p-10'>
                <div className='max-w-7xl mx-auto'>
                    
                    {activeTab === "description" && (
                        <div className='bg-white rounded-2xl p-8 border border-gray-100 shadow-sm'>
                            <div className='flex items-center gap-3 mb-6'>
                                <div className='w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600'>
                                    <MdDescription className="w-6 h-6" />
                                </div>
                                <h2 className='text-xl font-bold text-gray-900'>About this Course</h2>
                            </div>
                            <p className='text-gray-700 leading-relaxed font-medium whitespace-pre-wrap'>
                                {course.description || "No description available for this course."}
                            </p>
                        </div>
                    )}

                    {activeTab === "modules" && (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {modules.length === 0 ? (
                                <div className="col-span-full bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                                    <p className="text-gray-400 font-medium italic">No modules have been added to this course yet.</p>
                                </div>
                            ) : modules.map((module, index) => (
                                <Link
                                    to={`/module/${module._id}`}
                                    key={module._id}
                                    className='bg-white border border-gray-100 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group flex items-center gap-5'
                                >
                                    <div className='w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all'>
                                        {String(index + 1).padStart(2, '0')}
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <h3 className='font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors'>{module.title}</h3>
                                        <p className='text-xs text-gray-400 font-bold uppercase tracking-wider mt-1'>
                                            {module.lessons?.length || 0} Lessons
                                        </p>
                                    </div>
                                    <MdChevronRight className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all w-6 h-6" />
                                </Link>
                            ))}
                        </div>
                    )}

                    {activeTab === "assignments" && (
                        <div className='space-y-4'>
                            {assignments.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                                    <p className="text-gray-400 font-medium italic">No assignments for this course.</p>
                                </div>
                            ) : assignments.map((assignment) => (
                                <Link
                                    to={`/assignments/${assignment._id}`}
                                    key={assignment._id}
                                    className='bg-white border border-gray-100 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6'
                                >
                                    <div className='flex items-center gap-5'>
                                        <div className='w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center'>
                                            <MdAssignment className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className='font-bold text-gray-900 group-hover:text-indigo-600 transition-colors'>{assignment.title}</h3>
                                            <div className='flex items-center gap-4 mt-1'>
                                                <span className='flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                                    <MdAccessTime className="w-3.5 h-3.5" /> Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                </span>
                                                <span className='flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                                    <MdGrade className="w-3.5 h-3.5" /> {assignment.maxMarks} Pts
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className='px-6 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all'>
                                        View & Submit
                                    </button>
                                </Link>
                            ))}
                        </div>
                    )}

                    {activeTab === "tests" && (
                        <div className='space-y-4'>
                            {tests.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                                    <p className="text-gray-400 font-medium italic">No tests available for this course.</p>
                                </div>
                            ) : tests.filter(t => t.isPublished).map((test) => (
                                <Link
                                    to={`/student/take-test/${test._id}`}
                                    key={test._id}
                                    className='bg-white border border-gray-100 rounded-2xl p-6 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/5 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6'
                                >
                                    <div className='flex items-center gap-5'>
                                        <div className='w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center'>
                                            <MdQuiz className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className='font-bold text-gray-900 group-hover:text-rose-600 transition-colors'>{test.title}</h3>
                                            <div className='flex items-center gap-4 mt-1'>
                                                <span className='flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                                    <MdAccessTime className="w-3.5 h-3.5" /> {test.duration} Minutes
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className='px-6 py-2 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold group-hover:bg-rose-600 group-hover:text-white transition-all'>
                                        Take Test
                                    </button>
                                </Link>
                            ))}
                        </div>
                    )}

                    {activeTab === "attendance" && (
                        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
                            <div className='p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50'>
                                <h3 className='font-bold text-gray-900'>My Attendance History</h3>
                                <div className='flex gap-4'>
                                    <div className='flex items-center gap-2'>
                                        <div className='w-3 h-3 rounded-full bg-green-500'></div>
                                        <span className='text-xs font-bold text-gray-600'>
                                            Present: {attendance.filter(a => a.status === 'present').length}
                                        </span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <div className='w-3 h-3 rounded-full bg-red-500'></div>
                                        <span className='text-xs font-bold text-gray-600'>
                                            Absent: {attendance.filter(a => a.status === 'absent').length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className='overflow-x-auto'>
                                <table className='w-full text-left'>
                                    <thead>
                                        <tr className='bg-gray-50/30 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50'>
                                            <th className='p-6'>Date</th>
                                            <th className='p-6'>Status</th>
                                            <th className='p-6'>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-50'>
                                        {attendance.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className='p-12 text-center text-gray-400 font-medium italic'>
                                                    No attendance records found for this course.
                                                </td>
                                            </tr>
                                        ) : (
                                            attendance.map((record, idx) => (
                                                <tr key={idx} className='hover:bg-gray-50/50 transition-colors'>
                                                    <td className='p-6 text-sm font-bold text-gray-900'>
                                                        {new Date(record.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className='p-6'>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border
                                                            ${record.status === 'present' ? 'bg-green-50 text-green-600 border-green-100' : 
                                                              record.status === 'absent' ? 'bg-red-50 text-red-600 border-red-100' : 
                                                              'bg-amber-50 text-amber-600 border-amber-100'}
                                                        `}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td className='p-6 text-sm text-gray-500 font-medium'>
                                                        {record.remarks || '-'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

export default CourseSingle
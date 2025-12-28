import React, { useEffect, useState } from 'react'
import { getCourseById } from '../API/course.api'
import { Link, useParams } from 'react-router-dom'
import { allModules } from '../API/module.api'

const CourseSingle = () => {
    const { courseID } = useParams()
    const [course, setCourse] = useState("")
    const [modules, setModules] = useState([])
    const [activeTab, setActiveTab] = useState('description')

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const res = await getCourseById(courseID)
                setCourse(res.data.course)
                console.log(res.data.course)
            } catch (error) {
                console.error("Failed to fetch course data", error)
            }
        }
        fetchCourseDetails()
    }, [])

    useEffect(() => {
        const fetchAllModules = async () => {
            try {
                const res = await allModules(courseID)
                console.log(res.data.modules)
                // Handle case where API returns {message: 'No modules'} instead of array
                if (Array.isArray(res.data.modules)) {
                    setModules(res.data.modules)
                } else {
                    setModules([])
                }
            } catch (error) {
                console.error("Failed to fetch modules", error)
                setModules([])
            }
        }

        fetchAllModules()
    }, [])

    // Converting Date into proper format
    const dateString = course.createdAt
    const date = new Date(dateString)

    const formattedDate = date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const tabs = ["description", "modules"]

    return (
        <div className='h-full w-full bg-gray-50 rounded-xl p-3 sm:p-4 md:p-6 overflow-y-scroll scrollbar-hide flex flex-col gap-4 sm:gap-6 md:gap-8'>
            {/* Course Header */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6'>
                <div className='flex flex-col gap-2'>
                    <h1 className='font-bold text-xl sm:text-2xl md:text-3xl text-gray-900'>{course.title}</h1>
                    <p className='text-xs sm:text-sm text-gray-500'>{formattedDate}</p>
                </div>
            </div>

            {/* Tabs and Content Section */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                {/* Tab Navigation */}
                <div className='flex gap-4 sm:gap-6 md:gap-8 px-4 sm:px-5 md:px-6 pt-3 sm:pt-4 border-b border-gray-200'>
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 sm:pb-3 px-2 font-medium text-xs sm:text-sm capitalize transition-all
                                ${activeTab === tab
                                    ? "text-[#7034FF] border-b-2 border-[#7034FF]"
                                    : "text-gray-600 hover:text-gray-900"
                                }
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className='p-4 sm:p-5 md:p-6 max-h-[60vh] overflow-y-auto'>
                    {activeTab === "description" && (
                        <div>
                            <p className='text-sm sm:text-base text-gray-700 leading-relaxed'>
                                {course.description || "No description available"}
                            </p>
                        </div>
                    )}

                    {activeTab === "modules" && (
                        <div className='flex flex-col gap-3 sm:gap-4'>
                            {modules.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Modules Available</h3>
                                    <p className="text-sm text-gray-500">There are no modules in this course yet.</p>
                                </div>
                            ) : modules.map((module, index) => (
                                <Link
                                    to={`/module/${module._id}`}
                                    key={module._id}
                                    className='bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-all'
                                >
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3 flex-1 min-w-0'>
                                            {/* Module Number Badge */}
                                            <div className='bg-[#7034FF] text-white rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-sm flex-shrink-0'>
                                                {index + 1}
                                            </div>

                                            {/* Module Info */}
                                            <div className='flex-1 min-w-0'>
                                                <h3 className='font-semibold text-sm sm:text-base text-gray-900'>
                                                    {module.title}
                                                </h3>
                                                <p className='text-xs text-gray-500 mt-1'>
                                                    {module.lessons?.length || 0} {module.lessons?.length === 1 ? 'lesson' : 'lessons'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Arrow Icon */}
                                        <svg
                                            className='w-5 h-5 text-gray-400 flex-shrink-0 ml-2'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M9 5l7 7-7 7'
                                            />
                                        </svg>
                                    </div>

                                    {/* Module Description */}
                                    {module.description && (
                                        <p className='text-gray-600 text-xs mt-2 line-clamp-2 pl-0 sm:pl-12'>
                                            {module.description}
                                        </p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CourseSingle
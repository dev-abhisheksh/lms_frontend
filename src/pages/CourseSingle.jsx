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
                setModules(res.data.modules)
            } catch (error) {

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
        <div className='h-full w-full bg-white rounded-lg p-4 overflow-y-scroll scrollbar-hide flex flex-col gap-7'>
            <div className='min-h-[45%] w-full bg-white rounded-lg flex flex-col gap-3'>
                <div className='h-[80%] bg-violet-100 rounded-lg'>

                </div>
                <div className='flex flex-col pl-2'>
                    <h1 className='font-bold text-2xl'>{course.title}</h1>
                    <p className='text-gray-600'>{formattedDate}</p>
                </div>
            </div>


            <div className='w-full bg-white h-fit rounded-lg px-3 flex flex-col'>

                <div className='flex gap-7'>
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`cursor-pointer
                                ${activeTab === tab
                                    ? "border-b-4 border-[#7034FF]"
                                    : ""
                                }
                                `}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className='border-b-1'>

                </div>

                {activeTab === "description" && (
                    <div className='py-5'>
                        <p className='text-gray-700'>{course.description || "No description available"}</p>
                    </div>
                )}

                {activeTab === "modules" && (
                    <div className='flex flex-col gap-4 p-4'>
                        {modules.map((module, index) => (
                            <Link
                                to={`/modules/${module._id}`}
                                key={module._id}
                                className='bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer'
                            >
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-4'>
                                        {/* Module Number Badge */}
                                        <div className='bg-violet-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold'>
                                            {index + 1}
                                        </div>

                                        {/* Module Info */}
                                        <div>
                                            <h3 className='font-semibold text-lg text-gray-800'>
                                                {module.title}
                                            </h3>
                                            <p className='text-sm text-gray-500'>
                                                {module.lessons?.length || 0} lessons
                                            </p>
                                        </div>
                                    </div>

                                    {/* Arrow Icon */}
                                    <svg
                                        className='w-6 h-6 text-gray-400'
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

                                {/* Optional: Module Description */}
                                {module.description && (
                                    <p className='text-gray-600 text-sm mt-3 line-clamp-2'>
                                        {module.description}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CourseSingle
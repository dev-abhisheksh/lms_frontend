import React, { act, useEffect, useState } from 'react'
import { getModuleById } from '../API/module.api'
import { useParams } from 'react-router-dom'
import { allLessons } from '../API/lesson.api'
import { MdInfoOutline } from "react-icons/md";
import { FiLink } from "react-icons/fi";
import { BsPlayCircle } from "react-icons/bs";

const Modules = () => {
    const [activeTab, setActiveTab] = useState("description")
    const tabs = ["description", "lessons"]
    const [module, setModule] = useState("")
    const [lessons, setLessons] = useState([])
    const [activeLessontabs, setactiveLessontabs] = useState({})
    const { moduleID } = useParams()

    useEffect(() => {
        const fetchModule = async () => {
            try {
                const res = await getModuleById(moduleID)
                console.log(res.data)
                setModule(res.data.module)
            } catch (error) {
                console.error("Failed to fetch module")
            }
        }
        fetchModule()
    }, [])

    useEffect(() => {
        const fetchAllLessons = async () => {
            try {
                const res = await allLessons(moduleID)
                // Handle case where API returns {message: 'No lessons'} instead of array
                if (Array.isArray(res.data.lessons)) {
                    setLessons(res.data.lessons)
                    // Initialize all lessons with "Instructions" as default active tab
                    const initialTabs = {}
                    res.data.lessons.forEach(lesson => {
                        initialTabs[lesson._id] = "Instructions"
                    })
                    setactiveLessontabs(initialTabs)
                } else {
                    setLessons([])
                }
                console.log("Lessons", res.data)
            } catch (error) {
                console.error("Failed to fetch lessons", error)
                setLessons([])
            }
        }
        fetchAllLessons()
    }, [])

    const items = [
        { label: "Instructions", icon: <MdInfoOutline size={20} /> },
        { label: "Resource", icon: <FiLink size={20} /> },
        { label: "Video", icon: <BsPlayCircle size={20} /> },
    ];

    const dateString = module.createdAt;
    const date = new Date(dateString)

    const formattedDate = date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className='h-full w-full bg-gray-50 rounded-xl p-3 sm:p-4 md:p-6 overflow-y-scroll scrollbar-hide flex flex-col gap-4 sm:gap-6 md:gap-8'>
            {/* Module Header */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6'>
                <div className='flex flex-col gap-2'>
                    <h1 className='font-bold text-xl sm:text-2xl md:text-3xl text-gray-900'>{module.title}</h1>
                    <p className='text-xs sm:text-sm text-gray-500'>{formattedDate}</p>
                </div>
            </div>

            {/* Tabs and Content Section */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                {/* Tab Navigation */}
                <div className='flex gap-4 sm:gap-6 md:gap-8 px-4 sm:px-5 md:px-6 pt-3 sm:pt-4 border-b border-gray-200 overflow-x-auto scrollbar-hide'>
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 sm:pb-3 px-2 font-medium text-xs sm:text-sm capitalize transition-all whitespace-nowrap
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
                <div className='p-4 sm:p-5 md:p-6'>
                    {activeTab === "description" && (
                        <div>
                            <p className='text-sm sm:text-base text-gray-700 leading-relaxed'>
                                {module.description || "No description available"}
                            </p>
                        </div>
                    )}

                    {activeTab === "lessons" && (
                        <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
                            {lessons.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                        <BsPlayCircle size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lessons Available</h3>
                                    <p className="text-sm text-gray-500">There are no lessons in this module yet.</p>
                                </div>
                            ) : lessons.map((lesson) => {
                                const videoId = lesson.videoLink?.split("/").pop();

                                return (
                                    <div
                                        key={lesson._id}
                                        className="rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 overflow-hidden"
                                    >
                                        {/* Lesson Header */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 md:px-6 py-3 sm:py-4 bg-white border-b border-gray-200">
                                            <h2 className='font-semibold text-base sm:text-lg text-gray-900'>
                                                {lesson.title || "Lesson Title"}
                                            </h2>

                                            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                                                {items.map((item) => (
                                                    <button
                                                        key={item.label}
                                                        onClick={() =>
                                                            setactiveLessontabs((prev) => ({
                                                                ...prev,
                                                                [lesson._id]: item.label,
                                                            }))
                                                        }
                                                        className={`flex items-center justify-center gap-2 px-2 sm:px-3 py-2 rounded-md transition-all flex-1 sm:flex-initial
                                                            ${activeLessontabs[lesson._id] === item.label
                                                                ? "bg-[#7034FF] text-white shadow-sm"
                                                                : "text-gray-600 hover:bg-gray-200"
                                                            }
                                                        `}
                                                    >
                                                        <span className="text-base sm:text-lg">{item.icon}</span>
                                                        <span className="text-xs sm:text-sm font-medium hidden min-[400px]:block">
                                                            {item.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Lesson Content */}
                                        <div className="p-4 sm:p-5 md:p-6 flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6">
                                            {/* Left Side - Description (Always Visible) */}
                                            <div className="w-full lg:w-1/2">
                                                <div className="bg-white rounded-lg p-3 sm:p-4 h-full min-h-[180px] max-h-[300px] overflow-y-auto border border-gray-200">
                                                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 sm:mb-3 sticky top-0 bg-white pb-2">Description</h3>
                                                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                                        {lesson.description || "No description available for this lesson"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right Side - Tab Content */}
                                            <div className="w-full lg:w-1/2">
                                                {activeLessontabs[lesson._id] === "Video" && videoId ? (
                                                    <a
                                                        href={lesson.videoLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block w-full"
                                                    >
                                                        <div className="relative aspect-video rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-black">
                                                            <img
                                                                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                                                alt="Video thumbnail"
                                                                className="w-full h-full object-contain"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                                                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                                    <span className="text-[#7034FF] text-xl sm:text-2xl ml-1">▶</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </a>
                                                ) : (
                                                    <div className="bg-white rounded-lg p-3 sm:p-4 h-full min-h-[180px] max-h-[300px] border border-gray-200 flex items-center justify-center">
                                                        <div className="text-center text-gray-500">
                                                            {activeLessontabs[lesson._id] === "Instructions" && (
                                                                <div>
                                                                    <MdInfoOutline size={40} className="mx-auto mb-2 text-gray-400 sm:w-12 sm:h-12" />
                                                                    <p className="text-xs sm:text-sm">Instructions content will appear here</p>
                                                                </div>
                                                            )}
                                                            {activeLessontabs[lesson._id] === "Resource" && (
                                                                <div>
                                                                    <FiLink size={40} className="mx-auto mb-2 text-gray-400 sm:w-12 sm:h-12" />
                                                                    <p className="text-xs sm:text-sm">Resource content will appear here</p>
                                                                </div>
                                                            )}
                                                            {activeLessontabs[lesson._id] === "Video" && !videoId && (
                                                                <div>
                                                                    <BsPlayCircle size={40} className="mx-auto mb-2 text-gray-400 sm:w-12 sm:h-12" />
                                                                    <p className="text-xs sm:text-sm">No video available</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Modules
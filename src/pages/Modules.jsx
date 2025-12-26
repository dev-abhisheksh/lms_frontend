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
                setLessons(res.data.lessons)
                console.log("Lessons", res.data)
            } catch (error) {
                console.error("Failed to fetch lessons", error)
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
        <div className='h-full w-full bg-white rounded-lg p-4 overflow-y-scroll scrollbar-hide flex flex-col gap-7'>
            <div className='min-h-[45%] w-full bg-white rounded-lg flex flex-col gap-3'>
                <div className="h-50 md:max-h-70 lg:min-h-45 bg-violet-100 rounded-lg overflow-hidden">
                    <img className='h-full w-full object-cover' src="https://imgs.search.brave.com/LIzjRQ4gro7MrCDRnjyXcOdTqeoA4H4Lq7crMqmuNf4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ibG9n/LmJhY2s0YXBwLmNv/bS93cC1jb250ZW50/L3VwbG9hZHMvMjAy/Mi8wOS9CdWlsZGlu/Zy1hLW1vYmlsZS1h/cHAtYmFja2VuZC1h/cmNoaXRlY3R1cmUt/MTE0MHg1MDAucG5n" alt="" />
                </div>
                <div className='flex flex-col pl-2'>
                    <h1 className='font-bold text-2xl'>{module.title}</h1>
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

                <div className='flex flex-col gap-5'>
                    <div className='border-b-1'>

                    </div>

                    {activeTab === "description" && (
                        <div className='py-5'>
                            <p className='text-gray-700'>{module.description || "No description available"}</p>
                        </div>
                    )}

                    {activeTab === "lessons" && (
                        lessons.map((lesson) => (
                            <div key={lesson._id}
                                className="min-h-[35vh] lg:max-h-[45vh] w-full rounded-lg bg-gray-100 overflow-y-auto px-0 lg:px-3"

                            >
                                <div className='flex justify-between px-5 pt-4 pb-1'>
                                    <div>
                                        <h1>Title</h1>
                                    </div>

                                    <div className="flex gap-3 items-center">
                                        {items.map((item) => (
                                            <div
                                                key={item.label}
                                                className="flex items-center justify-center"
                                            >
                                                <span className="block sm:hidden">{item.icon}</span>

                                                <span className="hidden sm:block text-sm font-medium">
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                </div>


                                <div className='border-b-1 '>

                                </div>


                                yt video preview link


                            </div>
                        ))
                    )}

                </div>
            </div>
        </div>
    )
}

export default Modules
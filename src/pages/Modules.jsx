import React, { useState } from 'react'

const Modules = () => {
    const [activeTab, setActiveTab] = useState("description")
    const tabs = ["description", "Instruction", "resourses"]

    

    return (
        <div className='h-full w-full bg-white rounded-lg p-4 overflow-y-scroll scrollbar-hide flex flex-col gap-7'>
            <div className='min-h-[45%] w-full bg-white rounded-lg flex flex-col gap-3'>
                <div className='h-[80%] bg-violet-100 rounded-lg'>

                </div>
                <div className='flex flex-col pl-2'>
                    <h1 className='font-bold text-2xl'>Module Title</h1>
                    <p className='text-gray-600'>Date</p>
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

            </div>
        </div>
    )
}

export default Modules
import React from 'react'
import CourseDetails from './CourseDetails'
import AlertAndNoti from '../userDashboard/AlertAndNoti'

const MainCourseContent = () => {
    return (
        <div className='bg-[#F5F7FB] rounded-xl h-full flex justify-between p-3 lg:p-4 lg:gap-4'>
            <CourseDetails/>
            <div>
                <AlertAndNoti />
            </div>
        </div>
    )
}

export default MainCourseContent
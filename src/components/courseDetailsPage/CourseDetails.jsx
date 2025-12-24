import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const CourseDetails = () => {
    const { courseId } = useParams()
    const [courseData, setCourseData] = useState(null)

    useEffect(() => {
        const course = coursesData.find(c => c.id === courseId); // ✅ Find from local array
        setCourseData(course);
    }, [courseId])

    if (!courseId) return <div>Loading...</div>

    return (
        <div className="w-full h-full p-3 sm:p-6 bg-white rounded-lg">

            {/* Section header */}
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {/* Web Development with NodeJS {title} */}
                </h1>

            </div>

            <div>{courseData.title}</div>

        </div>
    );
};

export default CourseDetails;

import React, { useDeferredValue, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { myCourses } from "../API/course.api";

const Grids = () => {

    const navigate = useNavigate()
    const [myCoursez, setMyCoursez] = useState([])
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        const loadCourses = async () => {
            try {
                const res = await myCourses();
                // console.log("API RESPONSE:", res.data.courses);   
                setMyCoursez(res.data.courses);
                // console.log(res.data)
            } catch (error) {
                console.error(
                    "FETCH COURSES ERROR:",
                    error.response?.data || error.message
                );
            }
        };

        loadCourses();
    }, []);



    return (
        <div className="w-full h-full p-3 sm:p-6 bg-white rounded-lg overflow-y-scroll">

            {/* Section header */}
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    My Courses
                </h1>
                <p className="text-sm text-gray-500">
                    Courses you are currently enrolled in
                </p>
            </div>

            {myCoursez.length === 0 && (
                <h1>No Enrollments Found. Contact Admin</h1>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {myCoursez.map((item) => (
                    <Link
                        key={item._id}
                        to={`/course/${item.course._id}`}
                        className="
        flex gap-4 p-4
        border rounded-lg
        bg-white
        hover:bg-gray-50
        transition-colors
        cursor-pointer
        no-underline
      "
                    >
                        <div className="flex flex-col justify-between flex-1">
                            <div>
                                <h2 className="text-base font-medium text-gray-900 leading-snug">
                                    {item.course.title}
                                </h2>

                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {item.course.description || "No description available"}
                                </p>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-gray-500">Enrolled</span>
                                <span className="text-sm text-indigo-600 hover:underline">
                                    Open course →
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>


        </div>
    );
};

export default Grids;

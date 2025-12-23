import React from "react";

const Grids = () => {
    const coursesData = [
        {
            id: "c1",
            title: "Introduction to Web Development",
            description: "HTML, CSS, JavaScript fundamentals",
            thumbnail:
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
        },
        {
            id: "c2",
            title: "React for Beginners",
            description: "Components, hooks, modern UI",
            thumbnail:
                "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
        },
        {
            id: "c3",
            title: "Backend Development with Node.js",
            description: "APIs, databases, scalability",
            thumbnail:
                "https://images.unsplash.com/photo-1555949963-aa79dcee981c",
        },
        {
            id: "c4",
            title: "Data Structures & Algorithms",
            description: "Problem solving & interviews",
            thumbnail:
                "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
        },
        {
            id: "c5",
            title: "Database Design & SQL",
            description: "Schemas, indexing, queries",
            thumbnail:
                "https://images.unsplash.com/photo-1544383835-bda2bc66a55d",
        },
        {
            id: "c6",
            title: "System Design Basics",
            description: "Scalable real-world systems",
            thumbnail:
                "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
        },
    ];

    return (
        <div className="w-full p-3 sm:p-6 bg-white rounded-lg overflow-y-scroll">

            {/* Section header */}
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    My Courses
                </h1>
                <p className="text-sm text-gray-500">
                    Courses you are currently enrolled in
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {coursesData.map(course => (
                    <div
                        key={course.id}
                        className="
              flex gap-4 p-4
              border rounded-lg
              bg-white
              hover:bg-gray-50
              transition-colors
            "
                    >
                        {/* Thumbnail (small, not dominant) */}
                        <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="h-16 w-24 object-cover rounded-md flex-shrink-0"
                        />

                        {/* Content */}
                        <div className="flex flex-col justify-between flex-1">
                            <div>
                                <h2 className="text-base font-medium text-gray-900 leading-snug">
                                    {course.title}
                                </h2>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {course.description}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    Enrolled
                                </span>

                                <button className="text-sm text-indigo-600 hover:underline">
                                    Open course
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Grids;

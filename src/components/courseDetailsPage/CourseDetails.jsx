import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseById } from "../../API/course.api";
import { allModules } from "../../API/module.api";
import { SidebarTabsContext } from "../../contexts/Sidebar";

const CourseDetails = () => {
  const { courseId } = useParams();
  const { activeTab } = useContext(SidebarTabsContext)


  // ---------------- STATE ----------------
  const [courseData, setCourseData] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeSection, setActiveSection] = useState("Description");
  const [loading, setLoading] = useState(true);

  // ---------------- FETCH COURSE ----------------
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await getCourseById(courseId);
        setCourseData(res.data.course);
      } catch (error) {
        console.error("Failed to fetch course", error);
      }
    };

    fetchCourse();
  }, [courseId]);

  // ---------------- FETCH MODULES ----------------
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await allModules(courseId);
        setModules(res.data.modules);
      } catch (error) {
        console.error("Failed to fetch modules", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [courseId]);


  if (!courseData) return <div>Course not found</div>;

  return (
    <div className="w-full h-full sm:p-6 bg-white rounded-lg flex flex-col gap-6 overflow-y-scroll">

      {activeTab === "courses" && (
        <div className="flex flex-col gap-6">

          {/* ---------- HEADER ---------- */}
          <div className="flex flex-col gap-4">
            <div className="h-44 w-full bg-orange-500 rounded-lg" />
            <div className="pl-3">
              <h1 className="text-xl font-bold">{courseData.title}</h1>
              <p className="text-sm text-gray-500">
                {courseData.createdAt || "Created recently"}
              </p>
            </div>
          </div>

          {/* ---------- TABS ---------- */}
          <div className="pl-3 border-b border-gray-300 flex gap-8">
            {["Description", "Modules"].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`
            pb-2 text-sm font-medium transition
            ${activeSection === section
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                  }
          `}
              >
                {section}
              </button>
            ))}
          </div>

          {/* ---------- CONTENT ---------- */}
          <div>
            {activeSection === "Description" && (
              <p className="px-3 text-sm text-gray-700">
                {courseData.description}
              </p>
            )}

            {activeSection === "Modules" && (
              <div className="px-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((module) => (
                  <div
                    key={module._id}
                    className="border rounded-lg p-4"
                  >
                    <h3 className="font-medium">{module.title}</h3>
                    <p className="text-sm text-gray-500">
                      {module.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === "assignments" && (
        <div className="flex flex-col gap-6">

          {/* ---------- HEADER ---------- */}
          <div className="flex flex-col gap-4">
            <div className="h-44 w-full bg-orange-500 rounded-lg" />
            <div className="pl-3">
              <h1 className="text-xl font-bold">{"Assignment Page"}</h1>
              <p className="text-sm text-gray-500">
                {courseData.createdAt || "Created recently"}
              </p>
            </div>
          </div>

          {/* ---------- TABS ---------- */}
          <div className="pl-3 border-b border-gray-300 flex gap-8">
            {["Description", "Modules"].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`
            pb-2 text-sm font-medium transition
            ${activeSection === section
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                  }
          `}
              >
                {section}
              </button>
            ))}
          </div>

          {/* ---------- CONTENT ---------- */}
          <div>
            {activeSection === "Description" && (
              <p className="px-3 text-sm text-gray-700">
                {courseData.description}
              </p>
            )}

            {activeSection === "Modules" && (
              <div className="px-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((module) => (
                  <div
                    key={module._id}
                    className="border rounded-lg p-4"
                  >
                    <h3 className="font-medium">{module.title}</h3>
                    <p className="text-sm text-gray-500">
                      {module.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === "submissions" && (
        <div className="flex flex-col gap-6">

          {/* ---------- HEADER ---------- */}
          <div className="flex flex-col gap-4">
            <div className="h-44 w-full bg-orange-500 rounded-lg" />
            <div className="pl-3">
              <h1 className="text-xl font-bold">{"Submissions Page"}</h1>
              <p className="text-sm text-gray-500">
                {courseData.createdAt || "Created recently"}
              </p>
            </div>
          </div>

          {/* ---------- TABS ---------- */}
          <div className="pl-3 border-b border-gray-300 flex gap-8">
            {["Description", "Modules"].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`
            pb-2 text-sm font-medium transition
            ${activeSection === section
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                  }
          `}
              >
                {section}
              </button>
            ))}
          </div>

          {/* ---------- CONTENT ---------- */}
          <div>
            {activeSection === "Description" && (
              <p className="px-3 text-sm text-gray-700">
                {courseData.description}
              </p>
            )}

            {activeSection === "Modules" && (
              <div className="px-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((module) => (
                  <div
                    key={module._id}
                    className="border rounded-lg p-4"
                  >
                    <h3 className="font-medium">{module.title}</h3>
                    <p className="text-sm text-gray-500">
                      {module.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}


      {activeTab === "ai" && (
        <div className="flex flex-col gap-6">

          {/* ---------- HEADER ---------- */}
          <div className="flex flex-col gap-4">
            <div className="h-44 w-full bg-orange-500 rounded-lg" />
            <div className="pl-3">
              <h1 className="text-xl font-bold">{"AI Page"}</h1>
              <p className="text-sm text-gray-500">
                {courseData.createdAt || "Created recently"}
              </p>
            </div>
          </div>

          {/* ---------- TABS ---------- */}
          <div className="pl-3 border-b border-gray-300 flex gap-8">
            {["Description", "Modules"].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`
            pb-2 text-sm font-medium transition
            ${activeSection === section
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                  }
          `}
              >
                {section}
              </button>
            ))}
          </div>

          {/* ---------- CONTENT ---------- */}
          <div>
            {activeSection === "Description" && (
              <p className="px-3 text-sm text-gray-700">
                {courseData.description}
              </p>
            )}

            {activeSection === "Modules" && (
              <div className="px-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((module) => (
                  <div
                    key={module._id}
                    className="border rounded-lg p-4"
                  >
                    <h3 className="font-medium">{module.title}</h3>
                    <p className="text-sm text-gray-500">
                      {module.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default CourseDetails;

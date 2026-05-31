import React, { useEffect, useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getAllCourses, createCourse, updateCourse, togglePublishCourse } from "../API/course.api";
import { Departments } from "../API/department.api";
import { useNavigate } from "react-router-dom";
import { 
  MdOutlineMenuBook, 
  MdAdd, 
  MdEdit, 
  MdSearch, 
  MdClose, 
  MdOutlineCollectionsBookmark,
  MdNotificationsNone,
} from "react-icons/md";
import { LuBookOpen, LuGraduationCap } from "react-icons/lu";

// ── Components ───────────────────────────────────────────────────────────────

const CourseListItem = ({ course, onEdit, onTogglePublish }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 transition-colors hover:bg-gray-50/50 flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
    {/* Icon Area - Smaller on Mobile */}
    <div className="flex items-center gap-4 shrink-0">
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 ${course.isPublished ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
        <LuBookOpen className="w-6 h-6 md:w-7 md:h-7" />
      </div>
      {/* Mobile Title View */}
      <div className="sm:hidden flex-1 min-w-0">
         <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              {course.courseCode}
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
              STD {course.year}
            </span>
         </div>
         <h3 className="text-base font-bold text-gray-900 leading-tight truncate">{course.title}</h3>
      </div>
    </div>
    
    {/* Desktop/Tablet Info */}
    <div className="hidden sm:block flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
          {course.courseCode}
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
          STD {course.year}
        </span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 leading-none truncate">
        {course.title}
      </h3>
      <p className="text-xs text-gray-500 font-medium mt-1.5 line-clamp-1 max-w-xl">
        {course.description || "No description provided."}
      </p>
    </div>

    {/* Metadata & Actions */}
    <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50 shrink-0">
      {/* Dept Badge */}
      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
        <LuGraduationCap className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">
          {course.department?.code || "UNIT"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] ${course.isPublished ? 'text-green-600' : 'text-gray-400'}`}>
            {course.isPublished ? 'Live' : 'Draft'}
          </span>
          <button
            onClick={() => onTogglePublish(course._id)}
            className={`${course.isPublished ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 focus:outline-none`}
          >
            <span className={`${course.isPublished ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-150`} />
          </button>
        </div>
        
        <div className="w-px h-6 bg-gray-100 hidden md:block" />
        
        <button 
          onClick={() => onEdit(course)}
          className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <MdEdit className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);

// ── Main Page Component ──────────────────────────────────────────────────────

const AdminCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm]     = useState("");
  const [filterDept, setFilterDept]     = useState("all");

  const [formData, setFormData] = useState({ title: "", description: "", courseCode: "", department: "", year: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cRes, dRes] = await Promise.all([getAllCourses(), Departments()]);
        setCourses(cRes.data.courses || []);
        setDepartments(dRes.data.departments || []);
      } catch { toast.error("Failed to load catalog"); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse._id, { ...formData });
        toast.success("Course updated");
      } else {
        await createCourse(formData.department, { ...formData });
        toast.success("Course added");
      }
      const res = await getAllCourses();
      setCourses(res.data.courses || []);
      setShowForm(false);
      setEditingCourse(null);
    } catch (err) { toast.error(err.response?.data?.message || "Save failed"); } finally { setSubmitting(false); }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setFormData({ title: course.title, description: course.description || "", courseCode: course.courseCode, department: course.department?._id || "", year: course.year || "" });
    setShowForm(true);
  };

  const handleTogglePublish = async (id) => {
    try {
      await togglePublishCourse(id);
      const res = await getAllCourses();
      setCourses(res.data.courses || []);
    } catch { toast.error("Toggle failed"); }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const ms = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
      const mf = filterDept === "all" || (c.department && c.department._id === filterDept);
      return ms && mf;
    });
  }, [courses, searchTerm, filterDept]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 sm:p-6 lg:p-10 font-sans text-gray-900 scroll-smooth">
      <Toaster position="bottom-right" reverseOrder={false} />
      
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">Course Catalog</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium">Manage curriculum units across departments.</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => { setEditingCourse(null); setFormData({ title: "", description: "", courseCode: "", department: "", year: "" }); setShowForm(true); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em]">
              <MdAdd className="w-5 h-5" /> New Course
            </button>
            <button className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"><MdNotificationsNone className="w-6 h-6 text-gray-600" /></button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search catalog..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-shadow font-medium" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            <button onClick={() => setFilterDept("all")} className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-colors shrink-0 ${filterDept === "all" ? "bg-indigo-600 text-white" : "bg-white text-gray-400 border border-gray-100"}`}>All Units</button>
            {departments.map(dept => (
              <button key={dept._id} onClick={() => setFilterDept(dept._id)} className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-colors shrink-0 ${filterDept === dept._id ? "bg-indigo-600 text-white" : "bg-white text-gray-400 border border-gray-100"}`}>{dept.code}</button>
            ))}
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          {loading ? [1,2,3,4].map(i => <div key={i} className="h-20 md:h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />) : filteredCourses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center border-dashed border-2">
              <MdOutlineMenuBook className="w-8 h-8 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Empty Catalog</h3>
              <p className="text-sm text-gray-500 font-medium">No courses found matching your criteria.</p>
            </div>
          ) : filteredCourses.map(course => <CourseListItem key={course._id} course={course} onEdit={handleEditCourse} onTogglePublish={handleTogglePublish} />)}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 md:p-10 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full"><MdClose className="w-6 h-6" /></button>
            <div className="mb-8"><h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">{editingCourse ? "Update Course" : "New Curriculum Unit"}</h3><p className="text-gray-500 mt-1 font-medium text-xs md:text-sm">Fill in the parameters for this academic module.</p></div>
            <form onSubmit={handleFormSubmit} className="space-y-5 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 ml-1">Course Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleFormChange} required placeholder="e.g. Data Structures" className="w-full px-4 md:px-5 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 ml-1">Course Code</label>
                  <input type="text" name="courseCode" value={formData.courseCode} onChange={handleFormChange} required placeholder="e.g. CS101" className="w-full px-4 md:px-5 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black tracking-widest uppercase" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 ml-1">Year / Standard</label>
                  <input type="text" name="year" value={formData.year} onChange={handleFormChange} required placeholder="e.g. FY or 10" className="w-full px-4 md:px-5 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 ml-1">Assigned Department</label>
                  <select name="department" value={formData.department} onChange={handleFormChange} required className="w-full px-4 md:px-5 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold appearance-none">
                    <option value="">Select Department...</option>
                    {departments.map(dept => <option key={dept._id} value={dept._id}>{dept.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 ml-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleFormChange} rows={3} className="w-full px-4 md:px-5 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none font-medium leading-relaxed" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-500 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3.5 bg-gray-900 text-white rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl disabled:opacity-50">{submitting ? "Syncing..." : (editingCourse ? "Save Changes" : "Confirm Entry")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
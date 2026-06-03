import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MdAdd,
  MdDelete,
  MdArrowBack,
  MdOutlineLibraryBooks,
  MdOutlineDescription,
  MdOutlineAttachFile,
  MdOutlineFileUpload,
  MdOutlineModeEditOutline,
  MdOutlineSend,
  MdOutlineVisibilityOff,
  MdRefresh,
  MdOutlinePlayCircleOutline,
  MdOutlineLink,
  MdOutlineCollectionsBookmark,
  MdOutlineClass,
  MdOutlineEventNote,
  MdOutlineSchool,
  MdClose,
  MdSearch,
  MdOpenInNew
} from "react-icons/md";

import { getTeacherCourses } from "../../API/course.api";
import {
  createNote,
  getNotesByCourse,
  updateNote,
  deleteNote,
  togglePublishNote,
} from "../../API/note.api";

const TeacherMaterials = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [loading, setLoading] = useState({
    courses: true,
    materials: false
  });
  const [actionLoading, setActionLoading] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "note",
    content: "",
    lessonName: "",
    chapter: "",
    youtubeUrl: "",
    semester: "",
    isPublished: false,
  });

  const [attachmentFiles, setAttachmentFiles] = useState([]);

  // Fetch Courses
  useEffect(() => {
    (async () => {
      setLoading(prev => ({ ...prev, courses: true }));
      try {
        const list = await getTeacherCourses();
        setCourses(list);
        if (list.length > 0 && !selectedCourse) {
          setSelectedCourse(list[0]._id);
        }
      } catch (error) {
        toast.error("Failed to load courses");
      } finally {
        setLoading(prev => ({ ...prev, courses: false }));
      }
    })();
  }, []);

  // Fetch Materials
  const loadMaterials = async () => {
    if (!selectedCourse) return;
    setLoading(prev => ({ ...prev, materials: true }));
    try {
      const response = await getNotesByCourse(selectedCourse);
      const data = response.data.notes || [];
      setMaterials(data);
    } catch (error) {
      toast.error("Failed to load materials");
      setMaterials([]);
    } finally {
      setLoading(prev => ({ ...prev, materials: false }));
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [selectedCourse]);

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setAttachmentFiles(Array.from(e.target.files));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "note",
      content: "",
      lessonName: "",
      chapter: "",
      youtubeUrl: "",
      semester: "",
      isPublished: false,
    });
    setAttachmentFiles([]);
    setSelectedMaterial(null);
  };

  const handleCreateNew = (type = "note") => {
    resetForm();
    setFormData(prev => ({ ...prev, type }));
    setSelectedMaterial({ isNew: true });
  };

  // Submit Material
  const handleSubmitMaterial = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return toast.error("Please select a course");
    
    setIsSubmitting(true);
    const form = new FormData();
    form.append("title", formData.title);
    form.append("type", formData.type);
    form.append("content", formData.content);
    form.append("lessonName", formData.lessonName);
    form.append("chapter", formData.chapter);
    form.append("youtubeUrl", formData.youtubeUrl);
    form.append("semester", formData.semester);
    form.append("isPublished", formData.isPublished);

    attachmentFiles.forEach((file) => {
      form.append("attachments", file);
    });

    try {
      if (selectedMaterial && !selectedMaterial.isNew) {
        await updateNote(selectedMaterial._id, form);
        toast.success("Material updated successfully!");
      } else {
        await createNote(selectedCourse, form);
        toast.success("Material created successfully!");
      }
      resetForm();
      loadMaterials();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save material");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Material
  const handleEditMaterial = (material) => {
    setSelectedMaterial(material);
    setFormData({
      title: material.title || "",
      type: material.type || "note",
      content: material.content || "",
      lessonName: material.lessonName || "",
      chapter: material.chapter || "",
      youtubeUrl: material.youtubeUrl || "",
      semester: material.semester || "",
      isPublished: material.isPublished || false,
    });
    setAttachmentFiles([]);
  };

  const handleDeleteMaterial = async (e, materialId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this material?")) return;

    try {
      setActionLoading(materialId);
      await deleteNote(materialId);
      setMaterials((prev) => prev.filter((m) => m._id !== materialId));
      if (selectedMaterial?._id === materialId) resetForm();
      toast.success("Material deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePublish = async (e, materialId) => {
    e.stopPropagation();
    try {
      setActionLoading(materialId);
      const res = await togglePublishNote(materialId);
      const updated = res.data.note;

      setMaterials((prev) =>
        prev.map((m) =>
          m._id === materialId
            ? { ...m, isPublished: updated.isPublished, publishedAt: updated.publishedAt }
            : m
        )
      );
      
      if (selectedMaterial?._id === materialId) {
        setSelectedMaterial(prev => ({ ...prev, isPublished: updated.isPublished, publishedAt: updated.publishedAt }));
      }
      
      toast.success(`Material ${updated.isPublished ? "published" : "unpublished"}`);
    } catch (error) {
      toast.error("Failed to toggle publish status");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.lessonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.chapter?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMaterialIcon = (type) => {
    switch (type) {
      case "resource": return <MdOutlineAttachFile className="w-5 h-5" />;
      case "link": return <MdOutlinePlayCircleOutline className="w-5 h-5" />;
      default: return <MdOutlineDescription className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
             <button
              onClick={() => navigate("/teacher")}
              className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <MdArrowBack className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Material Lab</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Unified repository for notes, files, and video links</p>
            </div>
          </div>

          <div className="flex gap-3">
             <button
              onClick={() => handleCreateNew("note")}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all"
            >
              <MdOutlineDescription className="w-4 h-4" />
              New Note
            </button>
            <button
              onClick={() => handleCreateNew("resource")}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-all"
            >
              <MdAdd className="w-5 h-5" />
              Add Material
            </button>
          </div>
        </div>

        {/* ── Filter & Search Bar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <MdOutlineSchool className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Course Context</p>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title} ({c.courseCode})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
            <MdSearch className="w-5 h-5 text-slate-300 ml-2" />
            <input 
              type="text" 
              placeholder="Search by title, lesson or chapter..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-300 placeholder:font-medium"
            />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
               <span className="text-[10px] font-black text-slate-400 uppercase">{filteredMaterials.length} Items</span>
            </div>
          </div>
        </div>

        {/* ── Master-Detail Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Master List (lg:col-span-4) */}
          <aside className="lg:col-span-4 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:h-[750px] min-h-[400px]">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Materials</h2>
              <button onClick={loadMaterials} className="p-2 hover:bg-white rounded-xl transition-colors">
                <MdRefresh className={`w-4 h-4 text-slate-400 ${loading.materials ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50 scrollbar-thin scrollbar-thumb-slate-100 scrollbar-track-transparent">
              {loading.materials ? (
                <div className="p-6 space-y-4">
                   {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="p-12 text-center">
                  <MdOutlineLibraryBooks className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <p className="text-sm font-medium text-slate-400">No materials found</p>
                </div>
              ) : (
                filteredMaterials.map((material) => {
                  const isSelected = selectedMaterial?._id === material._id;
                  const isPublished = material.isPublished;
                  const typeIcon = getMaterialIcon(material.type);

                  return (
                    <button
                      key={material._id}
                      onClick={() => handleEditMaterial(material)}
                      className={`w-full p-6 text-left transition-all flex items-center gap-4 group ${
                        isSelected ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                        isSelected ? "bg-white/20" : "bg-slate-100 text-slate-600 group-hover:bg-white"
                      }`}>
                        {typeIcon}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                          {material.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isSelected 
                              ? "bg-white/20 border-white/30 text-white" 
                              : isPublished 
                                ? "bg-green-50 border-green-100 text-green-600" 
                                : "bg-amber-50 border-amber-100 text-amber-600"
                          }`}>
                            {isPublished ? "Published" : "Draft"}
                          </span>
                          {material.lessonName && (
                            <span className={`text-[9px] font-medium truncate max-w-[100px] ${isSelected ? "text-white/70" : "text-slate-400"}`}>
                              {material.lessonName}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {!isSelected && (
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                              onClick={(e) => handleDeleteMaterial(e, material._id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-colors"
                           >
                             <MdDelete className="w-4 h-4" />
                           </button>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Detail Area (lg:col-span-8) */}
          <main className="lg:col-span-8">
            {selectedMaterial ? (
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                      {selectedMaterial.isNew ? `New ${formData.type.toUpperCase()}` : "Refine Content"}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      {selectedMaterial.isNew ? "Define your learning material parameters" : `Editing: ${selectedMaterial.title}`}
                    </p>
                  </div>
                  
                  {!selectedMaterial.isNew && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => handleTogglePublish(e, selectedMaterial._id)}
                        disabled={actionLoading === selectedMaterial._id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                          selectedMaterial.isPublished 
                            ? "bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100" 
                            : "bg-green-50 text-green-600 border border-green-100 hover:bg-green-100"
                        }`}
                      >
                        {selectedMaterial.isPublished ? <MdOutlineVisibilityOff className="w-4 h-4" /> : <MdOutlineSend className="w-4 h-4" />}
                        {selectedMaterial.isPublished ? "Unpublish" : "Publish Now"}
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmitMaterial} className="p-8 space-y-8">
                  {/* Type Selector Toggle */}
                  {selectedMaterial.isNew && (
                    <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 w-fit">
                      {["note", "resource", "link"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, type: t }))}
                          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            formData.type === t ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Title *</label>
                        <input
                          type="text"
                          name="title"
                          required
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="e.g., Quantum Mechanics Overview"
                          className="w-full bg-slate-50 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-900 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Lesson / Chapter</label>
                        <div className="relative">
                           <MdOutlineClass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                           <input
                            type="text"
                            name="lessonName"
                            value={formData.lessonName}
                            onChange={handleInputChange}
                            placeholder="e.g., Chapter 04"
                            className="w-full bg-slate-50 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white rounded-2xl p-4 pl-12 text-sm font-bold text-slate-900 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Semester (Optional)</label>
                        <div className="relative">
                          <MdOutlineEventNote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                          <select
                            name="semester"
                            value={formData.semester}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white rounded-2xl p-4 pl-12 text-sm font-bold text-slate-900 transition-all"
                          >
                            <option value="">Skip</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                              <option key={s} value={s}>Semester {s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Type Specific Fields */}
                    {formData.type === "link" && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">YouTube URL</label>
                        <div className="relative">
                           <MdOutlinePlayCircleOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                           <input
                            type="url"
                            name="youtubeUrl"
                            value={formData.youtubeUrl}
                            onChange={handleInputChange}
                            placeholder="https://youtube.com/watch?v=..."
                            className="w-full bg-slate-50 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white rounded-2xl p-4 pl-12 text-sm font-bold text-slate-900 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Content / Description</label>
                      <textarea
                        name="content"
                        rows="5"
                        value={formData.content}
                        onChange={handleInputChange}
                        placeholder="Detailed instructions or study notes..."
                        className="w-full bg-slate-50 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white rounded-2xl p-4 text-sm font-medium text-slate-600 leading-relaxed transition-all resize-none"
                      />
                    </div>

                    {/* Uploads */}
                    {formData.type !== "link" && (
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Attachments</label>
                        <div className="relative group">
                          <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="bg-slate-50 border-2 border-dashed border-slate-200 group-hover:border-indigo-400 group-hover:bg-indigo-50/30 rounded-3xl p-8 transition-all text-center">
                            <MdOutlineFileUpload className="w-10 h-10 text-slate-300 group-hover:text-indigo-500 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-600">{attachmentFiles.length > 0 ? `${attachmentFiles.length} files selected` : 'Drag or click to upload files'}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-1">PDF, DOCX, ZIP supported</p>
                          </div>
                        </div>

                        {/* Existing Attachments Display (When editing) */}
                        {!selectedMaterial.isNew && selectedMaterial.attachments?.length > 0 && (
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {selectedMaterial.attachments.map((file, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                  <MdOutlineAttachFile className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-600 truncate flex-1">{file.original_filename}</span>
                                <a href={file.secure_url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-slate-50 rounded-lg text-indigo-600">
                                  <MdOpenInNew className="w-4 h-4" />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Publish Toggle */}
                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                          <MdOutlineVisibilityOff className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Visibility</p>
                          <p className="text-[10px] font-medium text-slate-500">Make visible to students</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isPublished"
                          checked={formData.isPublished}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Reset form
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-10 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.05] transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? "Processing..." : selectedMaterial.isNew ? "Launch Material" : "Update Material"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center shadow-sm h-[750px] flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 mb-8">
                  <MdOutlineCollectionsBookmark className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Knowledge Repository</h3>
                <p className="text-sm font-medium text-slate-500 mt-3 max-w-sm mx-auto leading-relaxed">
                  Select a material from the archive or create a new entry to build your course content library.
                </p>
                <div className="mt-10 flex gap-4">
                  <button
                    onClick={() => handleCreateNew("note")}
                    className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    Quick Note
                  </button>
                  <button
                    onClick={() => handleCreateNew("resource")}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-100"
                  >
                    Full Upload
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default TeacherMaterials;

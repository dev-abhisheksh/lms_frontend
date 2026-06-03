import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import {
  MdOutlineHowToReg,
  MdOutlineSchool,
  MdCalendarToday,
  MdSave,
  MdRefresh,
  MdCheckCircle,
  MdCancel,
  MdAccessTime,
  MdInfoOutline,
  MdLeaderboard
} from "react-icons/md";
import { getTeacherCourses } from "../../API/course.api";
import { getCourseEnrollmentSummary } from "../../API/enrollment.api";
import { markAttendance, getAttendanceByDate } from "../../API/attendance.api";

const TeacherAttendance = () => {
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [remarks, setRemarks] = useState({});
  
  const [loading, setLoading] = useState({
    courses: true,
    students: false,
    saving: false
  });

  // Load Courses
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

  // Load Students and Existing Attendance
  const loadData = async () => {
    if (!selectedCourse || !selectedDate) return;
    
    setLoading(prev => ({ ...prev, students: true }));
    try {
      // 1. Fetch all enrolled students
      const enrollmentRes = await getCourseEnrollmentSummary(selectedCourse);
      const enrolledStudents = enrollmentRes.data.participants.students || [];
      setStudents(enrolledStudents);

      // 2. Fetch existing attendance for this date
      try {
        const attendanceRes = await getAttendanceByDate(selectedCourse, selectedDate);
        const existingRecords = attendanceRes.attendance.records || [];
        
        const initialAttendance = {};
        const initialRemarks = {};
        
        existingRecords.forEach(rec => {
          initialAttendance[rec.student._id] = rec.status;
          initialRemarks[rec.student._id] = rec.remarks || "";
        });

        // For students not in existing records, default to "present"
        enrolledStudents.forEach(student => {
          if (!initialAttendance[student._id]) {
            initialAttendance[student._id] = "present";
          }
        });

        setAttendanceRecords(initialAttendance);
        setRemarks(initialRemarks);
      } catch (err) {
        // If 404, just set everyone to present by default
        const defaultAttendance = {};
        enrolledStudents.forEach(s => defaultAttendance[s._id] = "present");
        setAttendanceRecords(defaultAttendance);
        setRemarks({});
      }
    } catch (error) {
      toast.error("Failed to load student list");
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCourse, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleRemarkChange = (studentId, text) => {
    setRemarks(prev => ({
      ...prev,
      [studentId]: text
    }));
  };

  const handleMarkAll = (status) => {
    const newRecords = {};
    students.forEach(s => newRecords[s._id] = status);
    setAttendanceRecords(newRecords);
  };

  const handleSave = async () => {
    if (!selectedCourse || !selectedDate) return;
    
    setLoading(prev => ({ ...prev, saving: true }));
    try {
      const records = students.map(student => ({
        student: student._id,
        status: attendanceRecords[student._id] || "present",
        remarks: remarks[student._id] || ""
      }));

      await markAttendance({
        courseId: selectedCourse,
        date: selectedDate,
        records
      });
      
      toast.success("Attendance saved successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save attendance");
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Attendance Tracker</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage daily student presence and engagement</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleMarkAll("present")}
              className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100 hover:bg-green-100 transition-all"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll("absent")}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <MdOutlineSchool className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Course</p>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none"
              >
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <MdCalendarToday className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Session Date</p>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Attendance List */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
              Students Enrolled ({students.length})
            </h2>
            <div className="flex items-center gap-2">
               <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <MdInfoOutline className="w-3 h-3" />
                  Changes are auto-saved only when you click 'Submit Records'
               </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Info</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Remarks (Optional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading.students ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="3" className="p-6"><div className="h-12 bg-slate-50 rounded-2xl"></div></td>
                    </tr>
                  ))
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-20 text-center">
                      <MdOutlineHowToReg className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                      <p className="text-sm font-medium text-slate-400">No students enrolled in this course.</p>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => {
                    const status = attendanceRecords[student._id] || "present";
                    return (
                      <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
                              {student.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{student.fullName}</p>
                              <p className="text-[10px] font-medium text-slate-400">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
                            <button
                              onClick={() => handleStatusChange(student._id, "present")}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                status === "present" ? "bg-green-500 text-white shadow-lg shadow-green-100" : "text-slate-400 hover:text-slate-600"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleStatusChange(student._id, "absent")}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                status === "absent" ? "bg-red-500 text-white shadow-lg shadow-red-100" : "text-slate-400 hover:text-slate-600"
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => handleStatusChange(student._id, "late")}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                status === "late" ? "bg-amber-500 text-white shadow-lg shadow-amber-100" : "text-slate-400 hover:text-slate-600"
                              }`}
                            >
                              Late
                            </button>
                          </div>
                        </td>
                        <td className="p-6">
                          <input
                            type="text"
                            placeholder="Add reason or note..."
                            value={remarks[student._id] || ""}
                            onChange={(e) => handleRemarkChange(student._id, e.target.value)}
                            className="w-full bg-slate-50 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white rounded-xl p-3 text-xs font-medium text-slate-600 transition-all"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-green-500"></div>
                   <span className="text-xs font-bold text-slate-600">Present: {Object.values(attendanceRecords).filter(v => v === "present").length}</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <span className="text-xs font-bold text-slate-600">Absent: {Object.values(attendanceRecords).filter(v => v === "absent").length}</span>
                </div>
             </div>

             <button
              onClick={handleSave}
              disabled={loading.saving || students.length === 0}
              className="px-10 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.05] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading.saving ? "Saving..." : (
                <>
                  <MdSave className="w-4 h-4" />
                  Submit Records
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendance;

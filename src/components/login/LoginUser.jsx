import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  MdEmail, 
  MdLockOutline, 
  MdPersonOutline, 
  MdOutlineFingerprint, 
  MdArrowForward,
  MdLogin,
  MdOutlineBadge,
  MdOutlineDomain
} from "react-icons/md";
import { loginUser, registerUser } from "../../API/auth.api";

const LoginUser = ({ mode = "login" }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "student"
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginUser({ 
          email: formData.email, 
          password: formData.password 
        });
        const { accessToken, user } = res.data;
        
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("role", user.role);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success(`Welcome back, ${user.fullName.split(' ')[0]}!`);
        
        if (user.role === "admin" || user.role === "manager") navigate("/admin");
        else if (user.role === "teacher") navigate("/teacher");
        else navigate("/student");

      } else {
        const res = await registerUser(formData);
        toast.success("Account created! Please login.");
        setIsLogin(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* ── High-Fidelity Backdrop ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.08)] overflow-hidden">
          
          {/* Header Section */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-indigo-200 rotate-3 hover:rotate-0 transition-transform duration-300">
              {isLogin ? <MdLogin size={28} /> : <MdOutlineFingerprint size={28} />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
              {isLogin ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-2">
              {isLogin ? "Enter your credentials to access your dashboard" : "Join our academic community today"}
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleAuth} className="px-8 pb-10 space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Full Name</label>
                  <div className="relative group">
                    <MdPersonOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      className="h-12 w-full bg-slate-50 border-transparent focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 rounded-xl px-4 pl-12 text-sm font-bold text-slate-900 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Username</label>
                  <div className="relative group">
                    <MdOutlineBadge className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="johndoe_99"
                      className="h-12 w-full bg-slate-50 border-transparent focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 rounded-xl px-4 pl-12 text-sm font-bold text-slate-900 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Account Type</label>
                  <div className="relative group">
                    <MdOutlineDomain className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="h-12 w-full bg-slate-50 border-transparent focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 rounded-xl px-4 pl-12 text-sm font-bold text-slate-900 transition-all appearance-none cursor-pointer"
                    >
                      <option value="student">Student Account</option>
                      <option value="teacher">Instructor Account</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Email Address</label>
              <div className="relative group">
                <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@university.edu"
                  className="h-12 w-full bg-slate-50 border-transparent focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 rounded-xl px-4 pl-12 text-sm font-bold text-slate-900 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Password</label>
              <div className="relative group">
                <MdLockOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="h-12 w-full bg-slate-50 border-transparent focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 rounded-xl px-4 pl-12 text-sm font-bold text-slate-900 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-8 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Register Now"}</span>
                  <MdArrowForward size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Action */}
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 text-center">
            <button 
              onClick={() => navigate(isLogin ? "/register" : "/login")}
              className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
              <MdArrowForward className={isLogin ? "" : "rotate-180"} />
            </button>
          </div>
        </div>

        {/* Floating Support Info */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Systems Online</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Secure AES-256</span>
        </div>
      </div>
    </div>
  );
};

export default LoginUser;

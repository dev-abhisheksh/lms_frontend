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

const LoginUser = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
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
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4 relative overflow-hidden">
      {/* ── Visual Backdrop Elements ── */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[400px] relative z-10">
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl shadow-indigo-100/20 overflow-hidden">
          
          {/* Header */}
          <div className="p-8 pb-4 text-center">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4 shadow-sm">
              {isLogin ? <MdLogin size={24} /> : <MdOutlineFingerprint size={24} />}
            </div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-widest">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
              {isLogin ? "Login to your dashboard" : "Register for the platform"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="p-8 pt-4 space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-slate-400 ml-1 tracking-widest">Full Name</label>
                  <div className="relative">
                    <MdPersonOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-indigo-500/10 focus:bg-white rounded-xl p-3 pl-11 text-xs font-bold text-slate-900 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-slate-400 ml-1 tracking-widest">Username</label>
                  <div className="relative">
                    <MdOutlineBadge className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="johndoe_99"
                      className="w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-indigo-500/10 focus:bg-white rounded-xl p-3 pl-11 text-xs font-bold text-slate-900 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-slate-400 ml-1 tracking-widest">User Role</label>
                  <div className="relative">
                    <MdOutlineDomain className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-indigo-500/10 focus:bg-white rounded-xl p-3 pl-11 text-xs font-bold text-slate-900 transition-all appearance-none cursor-pointer"
                    >
                      <option value="student">Student Account</option>
                      <option value="teacher">Instructor Account</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-slate-400 ml-1 tracking-widest">Email Address</label>
              <div className="relative">
                <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-indigo-500/10 focus:bg-white rounded-xl p-3 pl-11 text-xs font-bold text-slate-900 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-slate-400 ml-1 tracking-widest">Password</label>
              <div className="relative">
                <MdLockOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-indigo-500/10 focus:bg-white rounded-xl p-3 pl-11 text-xs font-bold text-slate-900 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-xl py-4 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Register Now"}
              {!loading && <MdArrowForward size={14} />}
            </button>
          </form>

          {/* Toggle Footer */}
          <div className="p-6 bg-slate-50/50 border-t border-slate-50 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up →" : "Already have an account? Log In ←"}
            </button>
          </div>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          Secure Access • Academic Dashboard
        </p>
      </div>
    </div>
  );
};

export default LoginUser;

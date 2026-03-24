/**
 * Register.jsx - User registration page.
 * New users are created with 'viewer' role by default.
 * Matches the Login page's split-screen layout.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUserPlus, FiUser, FiLock, FiMail, FiZap } from 'react-icons/fi';
import API from '../api/axios';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await API.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      const { token, user } = res.data.data;
      localStorage.setItem('opm_token', token);
      localStorage.setItem('opm_user', JSON.stringify(user));
      toast.success(`Welcome, ${user.name}!`);
      navigate('/shop');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/30">
            <FiZap size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            OPM System
          </h1>
          <p className="text-emerald-200/70 text-lg leading-relaxed">
            Create your account and start shopping. Browse products, add to cart, and place orders with ease.
          </p>
          <div className="mt-10 flex items-center gap-3 justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300/60 text-sm">Secure. Reliable. Automated.</span>
          </div>
        </div>
      </div>

      {/* Right register form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-stone-50 to-emerald-50/30">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
              <FiZap size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">OPM System</h1>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Create account</h2>
          <p className="text-slate-500 mb-8">Sign up to start shopping</p>

          <form onSubmit={handleRegister} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-shadow ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="Your full name"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: undefined }); }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-shadow ${errors.email ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: undefined }); }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-shadow ${errors.password ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="Min 6 characters"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: undefined }); }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-shadow ${errors.confirmPassword ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="Re-enter password"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all text-sm font-semibold shadow-lg shadow-emerald-600/20 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiUserPlus size={16} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 font-medium hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

/**
 * Login.jsx - Authentication page with demo credential quick-login buttons.
 * Features a modern split-screen layout with gradient branding panel.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiLogIn, FiUser, FiLock, FiZap } from 'react-icons/fi';

const DEMO_USERS = [
  { email: 'admin@opm.com', password: 'admin123', role: 'Admin', color: 'from-emerald-500 to-teal-600' },
  { email: 'manager@opm.com', password: 'manager123', role: 'Manager', color: 'from-amber-500 to-orange-600' },
  { email: 'viewer@opm.com', password: 'viewer123', role: 'Viewer', color: 'from-violet-500 to-purple-600' },
];

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate auth delay
    await new Promise((r) => setTimeout(r, 600));

    const valid = DEMO_USERS.find(
      (u) => u.email === form.email && u.password === form.password
    );

    if (valid) {
      localStorage.setItem('opm_user', JSON.stringify({ email: valid.email, role: valid.role }));
      toast.success(`Welcome back, ${valid.role}!`);
      navigate('/dashboard');
    } else {
      toast.error('Invalid credentials. Try a demo account below.');
    }
    setLoading(false);
  };

  const quickLogin = (user) => {
    setForm({ email: user.email, password: user.password });
    localStorage.setItem('opm_user', JSON.stringify({ email: user.email, role: user.role }));
    toast.success(`Logged in as ${user.role}`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
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
            Order Processing & Management — streamline your operations with real-time tracking, inventory control, and smart analytics.
          </p>
          <div className="mt-10 flex items-center gap-3 justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300/60 text-sm">v1.0.0 — DevSecOps Pipeline Active</span>
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-stone-50 to-emerald-50/30">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
              <FiZap size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">OPM System</h1>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Sign in</h2>
          <p className="text-slate-500 mb-8">Enter your credentials or use a demo account</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-shadow"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-shadow"
                  placeholder="Enter password"
                />
              </div>
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
                  <FiLogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo credentials quick-login */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-gradient-to-b from-stone-50 to-emerald-50/30 px-3 text-slate-400 font-medium uppercase tracking-wider">
                  Quick Demo Login
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.email}
                  onClick={() => quickLogin(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-md transition-all group"
                >
                  <div className={`w-9 h-9 bg-gradient-to-br ${user.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                    {user.role[0]}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{user.role}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <FiLogIn className="text-slate-300 group-hover:text-emerald-500 transition-colors" size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

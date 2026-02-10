import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  Shield,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          typeof data.detail === "string"
            ? data.detail
            : "Invalid credentials. Please check your email and password.";
        throw new Error(errorMessage);
      }

      localStorage.setItem("token", data.access_token);
      const userInfo = data.user || { email: formData.email };
      localStorage.setItem("user", JSON.stringify(userInfo));

      navigate("/architecture-selection");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[400px] z-10 p-4">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
              A
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Guardian AI
            </h1>
          </div>
          <p className="text-slate-400 text-[15px] font-medium">
            AI Security Monitoring Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0B101B] border border-[#1F2937] rounded-xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Welcome back</h2>
            <p className="text-slate-400 text-sm mt-1">
              Please enter your details to sign in.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/25 text-red-300 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">
                Email
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter your email"
                  className="w-full bg-[#161b26] border border-[#2D3748] rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#3B82F6] hover:text-blue-400 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full bg-[#161b26] border border-[#2D3748] rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-sans"
                />
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? "Signing In..." : "Sign In"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1F2937]"></div>
            </div>
            <div className="relative flex justify-center text-[10px] tracking-widest uppercase">
              <span className="bg-[#0B101B] px-2 text-slate-500">
                Access Level
              </span>
            </div>
          </div>

          {/* Admin Login Button (visual only for now) */}
          <button className="w-full bg-[#111623] border border-[#1F2937] hover:bg-[#1F2937] text-slate-300 font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm group">
            <Shield className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            Admin Login
          </button>
        </div>

        {/* Footer Text */}
        <p className="mt-8 text-center text-slate-400 text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[#3B82F6] font-medium hover:text-blue-400"
          >
            Sign up for a free trial
          </Link>
        </p>

          {/* Bottom Security Badge */}
          <div className="mt-10 flex items-center justify-center gap-3 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>End-to-End Encrypted</span>
            </div>
            <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
            <div>Guardian AI Secure 2.0</div>
          </div>
      </div>
    </div>
  );
};

export default Login;

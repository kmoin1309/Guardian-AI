import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Store authentication data
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', formData.role);

      // Redirect to architecture selection for onboarding
      navigate('/architecture-selection');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4">
      <div className="max-w-md w-full">
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Security Gateway</h1>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Login to Security Gateway</h2>
          <p className="text-gray-400">Securely manage and monitor your AI agents</p>
        </div>

        <div className="bg-[#0B1120] p-8 rounded-2xl border border-gray-800 shadow-2xl">
          
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-400 mb-3">Login as</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'user'})}
                disabled={loading}
                className={`px-4 py-3 rounded-lg border-2 transition font-semibold ${
                  formData.role === 'user'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-[#020617] border-gray-700 text-gray-400 hover:border-gray-600'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  User
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'admin'})}
                disabled={loading}
                className={`px-4 py-3 rounded-lg border-2 transition font-semibold ${
                  formData.role === 'admin'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-[#020617] border-gray-700 text-gray-400 hover:border-gray-600'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                  Admin
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">
                Work Email
              </label>
              <input
                type="email"
                required
                placeholder="username@company.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                autoComplete="email"
                disabled={loading}
                className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition disabled:opacity-50"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-400">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-500 hover:text-blue-400">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                autoComplete="current-password"
                disabled={loading}
                className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition mt-6"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-500 hover:text-blue-400 font-bold">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <a href="mailto:support@llm.io" className="hover:text-gray-400">
                support@llm.io
              </a>
              <span>•</span>
              <Link to="/create-ticket" className="hover:text-gray-400">
                Create ticket
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;

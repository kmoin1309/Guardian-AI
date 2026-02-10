import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DashboardLLM = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [securityLogs, setSecurityLogs] = useState([]);

  useEffect(() => {
    fetchMetrics();
    fetchSecurityLogs();
  }, []);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/dashboard/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/firewall/history?limit=4', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setSecurityLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Left Sidebar */}
      <div className="w-60 bg-[#111111] border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-sm">SECURITY GATEWAY</div>
              <div className="text-gray-500 text-xs">ENTERPRISE LLM</div>
              <div className="text-gray-500 text-xs">PROTECTION</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <Link to="/dashboard/llm" className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg mb-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            <span className="font-medium text-sm">Overview</span>
          </Link>

          <Link to="/audit-logs" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg mb-2 transition">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm">Security Logs</span>
          </Link>

          <Link to="/guidelines" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg mb-2 transition">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm">Policies</span>
          </Link>

          <Link to="/red-team" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg mb-2 transition">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm">Red Teaming</span>
          </Link>

          <Link to="/architecture-selection" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm">Settings</span>
          </Link>
        </nav>

        {/* Current Cluster */}
        <div className="p-4 border-t border-gray-800">
          <div className="text-gray-500 text-xs mb-2">CURRENT CLUSTER</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-white text-sm font-medium">US-east-prod-01</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-[#111111] border-b border-gray-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-white text-xl font-bold">Main Dashboard</h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-lg">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                  <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                </svg>
                <span className="text-gray-300 text-sm">AWS Production</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="bg-gray-800 text-white px-4 py-2 pl-10 rounded-lg text-sm border border-gray-700 focus:border-blue-500 focus:outline-none w-64"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {/* Alert Banner */}
          <div className="bg-gradient-to-r from-red-900/40 to-red-800/20 border border-red-800/50 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-red-400 font-bold">High-Frequency Attack Detected</h3>
                <p className="text-gray-400 text-sm">Anomaly detected from 3 isolated IPs targeting prompt injection endpoints. 42 requests blocked in last 10s.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition">
              Review Threats
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Protected Requests */}
            <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-gray-400 text-sm mb-2">PROTECTED REQUESTS</div>
                  <div className="text-4xl font-black text-white mb-1">1.2M</div>
                  <div className="flex items-center gap-1 text-green-500 text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    <span>+12.5% this week</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[40, 55, 45, 70, 60, 80, 75, 95].map((height, i) => (
                    <div key={i} className="w-2 bg-blue-600 rounded" style={{height: `${height}px`}}></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Attacks Blocked */}
            <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-gray-400 text-sm mb-2">ATTACKS BLOCKED</div>
                  <div className="text-4xl font-black text-white mb-1">4,203</div>
                  <div className="flex items-center gap-2 text-green-500 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>100% success rate</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Estimated Cost Saved */}
            <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-gray-400 text-sm mb-2">ESTIMATED COST SAVED</div>
                  <div className="text-4xl font-black text-white mb-1">$12.4k</div>
                  <div className="text-gray-400 text-sm">Token drainage prevented</div>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#1F2937"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      strokeDasharray="84, 100"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">84%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* OWASP Coverage */}
            <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <h3 className="text-white font-bold">OWASP LLM TOP 10 COVERAGE</h3>
                <div className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs">i</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center py-8">
                <div className="relative">
                  {/* Hexagon Background */}
                  <svg width="200" height="200" viewBox="0 0 200 200" className="absolute inset-0">
                    <defs>
                      <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 0.2}} />
                        <stop offset="100%" style={{stopColor: '#3B82F6', stopOpacity: 0.05}} />
                      </linearGradient>
                    </defs>
                    {/* Concentric hexagons */}
                    <polygon points="100,20 150,40 150,80 100,100 50,80 50,40" fill="none" stroke="#1F2937" strokeWidth="1" />
                    <polygon points="100,40 130,55 130,75 100,90 70,75 70,55" fill="none" stroke="#1F2937" strokeWidth="1" />
                    {/* Main hexagon */}
                    <polygon points="100,50 120,62 120,78 100,90 80,78 80,62" fill="url(#hexGradient)" stroke="#3B82F6" strokeWidth="2" />
                  </svg>
                  
                  {/* Center Content */}
                  <div className="relative flex flex-col items-center justify-center w-[200px] h-[200px]">
                    <div className="text-5xl font-black text-white">92%</div>
                    <div className="text-blue-500 text-sm font-medium">POSTURE</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-400 text-sm">LLM01 Injection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
                  <span className="text-gray-400 text-sm">LLM06 PII Leak</span>
                </div>
              </div>
            </div>

            {/* Module System Health */}
            <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-bold mb-6">MODULE SYSTEM HEALTH</h3>
              
              <div className="space-y-3">
                {/* Prompt Firewall */}
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">Prompt Firewall</div>
                      <div className="text-gray-500 text-xs">Latency: 14ms</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-500 text-xs font-bold">ACTIVE</span>
                  </div>
                </div>

                {/* PII Anonymizer */}
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">PII Anonymizer</div>
                      <div className="text-gray-500 text-xs">32 fields redacted today</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-500 text-xs font-bold">ACTIVE</span>
                  </div>
                </div>

                {/* Jailbreak Detector */}
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">Jailbreak Detector</div>
                      <div className="text-gray-500 text-xs">Llama Guard 3 Model</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-500 text-xs font-bold">ACTIVE</span>
                  </div>
                </div>

                {/* Adversarial Testing */}
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">Adversarial Testing</div>
                      <div className="text-gray-500 text-xs">Scheduled: 04:00 AM</div>
                    </div>
                  </div>
                  <span className="text-gray-500 text-xs font-bold">IDLE</span>
                </div>

                {/* Security Patch */}
                <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">SECURITY PATCH AVAILABLE</div>
                      <div className="text-gray-400 text-xs">v2.4.1 includes fixes for GPT-4o jailbreaks.</div>
                    </div>
                  </div>
                </div>

                {/* Red Team Sim */}
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">RED TEAM SIM</div>
                      <div className="text-gray-400 text-xs">Start a new 15-minute automated test run.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Security Stream */}
          <div className="mt-6 bg-[#111111] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-bold mb-1">REAL-TIME SECURITY STREAM</h3>
                <p className="text-gray-500 text-sm">Monitoring all active LLM interfaces in real-time</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium">All Traffic</button>
                <button className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg text-sm font-medium transition">Threats Only</button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-500 text-xs font-medium pb-3 px-4">TIMESTAMP</th>
                    <th className="text-left text-gray-500 text-xs font-medium pb-3 px-4">INTERCEPTED PAYLOAD SNIPPET</th>
                    <th className="text-left text-gray-500 text-xs font-medium pb-3 px-4">OWASP CATEGORY</th>
                    <th className="text-left text-gray-500 text-xs font-medium pb-3 px-4">ACTION</th>
                    <th className="text-left text-gray-500 text-xs font-medium pb-3 px-4">CONF.</th>
                    <th className="text-left text-gray-500 text-xs font-medium pb-3 px-4">DETAILS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800/50 hover:bg-gray-900/30">
                    <td className="py-4 px-4 text-gray-400 text-sm font-mono">14:28:42.02</td>
                    <td className="py-4 px-4 text-gray-300 text-sm">"Ignore previous instructions and out..."</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded">LLM01: Prompt Injection</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-red-400 text-sm font-bold">BLOCKED</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-300 text-sm">98.2%</td>
                    <td className="py-4 px-4">
                      <button className="text-blue-500 hover:text-blue-400 text-sm font-medium">View</button>
                    </td>
                  </tr>

                  <tr className="border-b border-gray-800/50 hover:bg-gray-900/30">
                    <td className="py-4 px-4 text-gray-400 text-sm font-mono">14:28:40.11</td>
                    <td className="py-4 px-4 text-gray-300 text-sm">"My credit card number is 4532-xxxx-..."</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded">LLM06: Sensitive Info</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-yellow-400 text-sm font-bold">REDACTED</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-300 text-sm">99.9%</td>
                    <td className="py-4 px-4">
                      <button className="text-blue-500 hover:text-blue-400 text-sm font-medium">View</button>
                    </td>
                  </tr>

                  <tr className="border-b border-gray-800/50 hover:bg-gray-900/30">
                    <td className="py-4 px-4 text-gray-400 text-sm font-mono">14:28:38.85</td>
                    <td className="py-4 px-4 text-gray-300 text-sm">"What is the capital of France?"</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">NONE: Safe</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-400 text-sm font-bold">PASSED</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-300 text-sm">100%</td>
                    <td className="py-4 px-4">
                      <button className="text-blue-500 hover:text-blue-400 text-sm font-medium">View</button>
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-900/30">
                    <td className="py-4 px-4 text-gray-400 text-sm font-mono">14:28:35.01</td>
                    <td className="py-4 px-4 text-gray-300 text-sm">"Generate 1000 copies of this text un..."</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded">LLM04: Model DoS</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-red-400 text-sm font-bold">BLOCKED</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-300 text-sm">92.4%</td>
                    <td className="py-4 px-4">
                      <button className="text-blue-500 hover:text-blue-400 text-sm font-medium">View</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-center">
              <button className="text-gray-400 hover:text-white text-sm font-medium transition">
                VIEW ALL SECURITY LOGS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLLM;

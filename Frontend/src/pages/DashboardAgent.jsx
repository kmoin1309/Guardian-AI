import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Shield, Activity, Lock, RefreshCw, Zap, Search, Bell, Database, ExternalLink, ArrowLeft, LogOut } from 'lucide-react';

const DashboardAgent = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [agents, setAgents] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    databaseReads: true,
    databaseWrites: false,
    slackMessages: true,
    externalEmails: true
  });
  const [showAlert, setShowAlert] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLockedDown, setIsLockedDown] = useState(false);
  const [threatCount, setThreatCount] = useState(0);
  const [showInvestigateModal, setShowInvestigateModal] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch comprehensive real-time stats
      const metricsRes = await fetch('http://localhost:8000/api/dashboard/realtime-stats', { headers });
      const metricsData = await metricsRes.json();
      setMetrics(metricsData);

      // Fetch active agents
      const agentsRes = await fetch('http://localhost:8000/api/agent-safety/agents', { headers });
      const agentsData = await agentsRes.json();
      setAgents(agentsData || []);

      // Generate simulated activity logs based on real agent data
      const logs = generateSimulatedLogs(agentsData || []);
      setActivityLogs(logs);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSimulatedLogs = (activeAgents) => {
    const baseLogs = [
      { time: '14:22:01', agent: 'Agent_01', tool: 'Slack Message', params: 'channel: "#dev-ops", body: "Deploy success"', status: 'ALLOWED' },
      { time: '14:21:48', agent: 'Agent_04', tool: 'Database Query', params: 'SELECT * FROM payroll_records', status: 'BLOCKED' },
      { time: '14:21:42', agent: 'Agent_02', tool: 'Send Email', params: 'to: "client@example.com", subject: "Update"', status: 'PENDING' },
      { time: '14:21:30', agent: 'Agent_01', tool: 'File System Read', params: 'path: "/tmp/logs/latest.txt"', status: 'ALLOWED' },
    ];

    if (activeAgents.length > 0) {
      // Find the agent with the highest ID (latest)
      const latestAgent = [...activeAgents].sort((a, b) => b.id - a.id)[0];

      baseLogs.unshift({
        time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
        agent: latestAgent.agent_name || 'test-agent',
        tool: 'Security Handshake',
        params: `runtime: ${latestAgent.agent_type}, endpoint: ${latestAgent.endpoint_url || 'ws://localhost:8000'}`,
        status: latestAgent.risk_level === 'CRITICAL' ? 'TRAPPED' : 'ALLOWED'
      });
    }
    return baseLogs;
  };

  const togglePermission = (key) => {
    if (isLockedDown) return; // Prevent toggling during lockdown
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLockdown = () => {
    setIsLockedDown(!isLockedDown);
    if (!isLockedDown) {
      // Force all permissions to false
      setPermissions({
        databaseReads: false,
        databaseWrites: false,
        slackMessages: false,
        externalEmails: false
      });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleInvestigate = () => {
    setShowInvestigateModal(true);
  };

  const simulateThreat = () => {
    const threats = [
      { tool: 'File Sync', params: 'source: "/etc/shadow", dest: "external.vps/upload"', agent: agents[0]?.agent_name || 'test-agent' },
      { tool: 'Shell Exec', params: 'command: "rm -rf /var/www/html"', agent: agents[0]?.agent_name || 'test-agent' },
      { tool: 'API Access', params: 'endpoint: "/v1/admin/delete_all_users"', agent: agents[0]?.agent_name || 'test-agent' }
    ];

    const threat = threats[threatCount % threats.length];
    setThreatCount(prev => prev + 1);

    const newLog = {
      time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
      agent: threat.agent,
      tool: threat.tool,
      params: threat.params,
      status: 'BLOCKED'
    };

    setActivityLogs(prev => [newLog, ...prev]);
    setShowAlert(true); // Re-show alert for the new threat
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-violet-900/30 rounded-full"></div>
          <div className="absolute top-0 w-20 h-20 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-8 h-8 text-violet-500 animate-pulse" />
          </div>
        </div>
        <h2 className="text-white text-xl font-bold mb-2 tracking-tight">Initializing Security Gateway</h2>
        <p className="text-gray-500 text-sm max-w-xs animate-pulse font-medium">
          Synchronizing defensive protocols and fetching real-time agent telemetry...
        </p>
        <div className="mt-8 flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/architecture-selection')}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="w-px h-8 bg-gray-800" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-black text-base">Guardian AI</div>
                <div className="text-gray-500 text-[10px]">Agent Security Platform</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-white text-sm">Security Score:</span>
              <span className="text-blue-400 text-sm font-bold">{metrics?.modules?.agent_safety?.safety_score || 88}/100</span>
            </div>
            <button
              onClick={handleLockdown}
              className={`px-4 py-2 ${isLockedDown ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30'} text-white rounded-lg text-sm font-bold transition`}
            >
              {isLockedDown ? 'TERMINATE LOCKDOWN' : 'System Secure'}
            </button>
            <button
              onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-[#1A1A1A] border-b border-gray-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-white text-2xl font-bold mb-1">AI Agent Safety Dashboard</h1>
                {agents.length > 0 && (
                  <div className="flex items-center gap-2 px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded-md">
                    <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">
                      Active: {agents.sort((a, b) => b.id - a.id)[0].agent_name}
                    </span>
                  </div>
                )}
                <button
                  onClick={simulateThreat}
                  className="px-3 py-1 bg-red-600/10 border border-red-500/30 text-red-500 text-[10px] font-bold rounded-lg hover:bg-red-600/20 transition-all flex items-center gap-2"
                >
                  <AlertCircle size={12} />
                  SIMULATE THREAT
                </button>
              </div>
              <p className="text-gray-400 text-sm">Autonomous permission control & threat monitoring</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-full border-2 border-slate-800 flex items-center justify-center text-white text-[10px] font-bold">
                AI
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {/* Critical Alert */}
          {showAlert && (
            <div className={`bg-gradient-to-r ${isLockedDown ? 'from-red-950 to-red-900/40 border-red-500' : 'from-red-900/40 to-red-800/20 border-red-800/50'} border rounded-xl p-5 mb-6 flex items-center justify-between transition-all duration-500`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${isLockedDown ? 'bg-red-500 animate-ping' : 'bg-red-600'} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-400 font-bold mb-1">{isLockedDown ? "GLOBAL LOCKDOWN IN EFFECT" : "CRITICAL THREAT BLOCKED"}</h3>
                  <p className="text-gray-300 text-sm">
                    {isLockedDown
                      ? "All autonomous operations suspended by administrator."
                      : <span>Unauthorized attempt to access <span className="text-red-400 font-mono">'Payroll_DB'</span> by <span className="font-bold">Agent_04</span> was automatically intercepted.</span>}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleInvestigate}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition"
                >
                  Investigate
                </button>
                <button
                  onClick={() => setShowAlert(false)}
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-6">
            {/* Agent Activity Log */}
            <div className="col-span-2 bg-[#1A1A1A] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-white font-bold text-lg">Agent Activity Log</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-700 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs font-bold">LIVE MONITORING</span>
                </div>
              </div>

              <div className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 text-gray-500 text-xs font-medium pb-2 border-b border-gray-800">
                  <div className="col-span-2">TIMESTAMP</div>
                  <div className="col-span-3">AGENT / TOOL</div>
                  <div className="col-span-5">PARAMETERS</div>
                  <div className="col-span-2">STATUS</div>
                </div>

                {activityLogs.map((log, idx) => (
                  <div key={idx} className={`grid grid-cols-12 gap-4 items-center py-3 rounded-lg transition ${log.status === 'BLOCKED' || log.status === 'TRAPPED' ? 'bg-red-900/10' : 'hover:bg-gray-900/30'}`}>
                    <div className="col-span-2 text-gray-400 text-sm font-mono">{log.time}</div>
                    <div className="col-span-3 flex items-center gap-2">
                      <span className="px-2 py-1 bg-gray-700 text-white text-[10px] rounded">{log.agent}</span>
                      <span className={`text-sm ${log.status === 'BLOCKED' ? 'text-red-400 font-bold' : 'text-white'}`}>{log.tool}</span>
                    </div>
                    <div className="col-span-5">
                      <div className={`${log.status === 'BLOCKED' || log.status === 'TRAPPED' ? 'text-red-400 font-mono' : 'text-gray-400 font-mono'} text-xs truncate`}>
                        {log.params}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${log.status === 'ALLOWED' ? 'bg-green-500' : (log.status === 'BLOCKED' || log.status === 'TRAPPED') ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                        <span className={`text-sm font-bold ${log.status === 'ALLOWED' ? 'text-green-400' : (log.status === 'BLOCKED' || log.status === 'TRAPPED') ? 'text-red-400' : 'text-yellow-400'}`}>{log.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition">
                  View All Audit Logs
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Blast Radius Impact */}
              <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-white font-bold">Blast Radius Impact</h3>
                  <svg className="w-4 h-4 text-gray-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* Radar Chart */}
                <div className="relative h-48 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Background circles */}
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#1F2937" strokeWidth="1" />
                    <circle cx="100" cy="100" r="60" fill="none" stroke="#1F2937" strokeWidth="1" />
                    <circle cx="100" cy="100" r="40" fill="none" stroke="#1F2937" strokeWidth="1" />
                    <circle cx="100" cy="100" r="20" fill="none" stroke="#1F2937" strokeWidth="1" />

                    {/* Axis lines */}
                    <line x1="100" y1="100" x2="100" y2="20" stroke="#1F2937" strokeWidth="1" />
                    <line x1="100" y1="100" x2="170" y2="52" stroke="#1F2937" strokeWidth="1" />
                    <line x1="100" y1="100" x2="170" y2="148" stroke="#1F2937" strokeWidth="1" />
                    <line x1="100" y1="100" x2="100" y2="180" stroke="#1F2937" strokeWidth="1" />
                    <line x1="100" y1="100" x2="30" y2="148" stroke="#1F2937" strokeWidth="1" />
                    <line x1="100" y1="100" x2="30" y2="52" stroke="#1F2937" strokeWidth="1" />

                    {/* Data polygon */}
                    <polygon
                      points="100,35 155,60 160,130 100,155 50,120 55,60"
                      fill="#3B82F6"
                      fillOpacity="0.3"
                      stroke="#3B82F6"
                      strokeWidth="2"
                    />

                    {/* Labels */}
                    <text x="100" y="15" textAnchor="middle" fill="#9CA3AF" fontSize="10" fontWeight="bold">DATA</text>
                    <text x="178" y="55" textAnchor="start" fill="#9CA3AF" fontSize="10" fontWeight="bold">FINANCE</text>
                    <text x="178" y="155" textAnchor="start" fill="#9CA3AF" fontSize="10" fontWeight="bold">COMMS</text>
                    <text x="100" y="195" textAnchor="middle" fill="#9CA3AF" fontSize="10" fontWeight="bold">AUTH</text>
                    <text x="22" y="155" textAnchor="end" fill="#9CA3AF" fontSize="10" fontWeight="bold">SYSTEM</text>
                  </svg>
                </div>

                {/* Risk Areas */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-400 text-xs mb-1">MAX RISK AREA</div>
                    <div className="text-white font-bold text-lg">System</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-xs mb-1">DELTA (24H)</div>
                    <div className="text-red-400 font-bold text-lg">+12%</div>
                  </div>
                </div>
              </div>

              {/* Security Score */}
              <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-white font-bold">Security Score</h3>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#1F2937" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="8"
                        strokeDasharray="282.7"
                        strokeDashoffset="31"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-4xl font-black text-white">88</div>
                      <div className="text-xs text-gray-500">/ 100</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-400 text-sm">Policy Sync</span>
                    <span className="text-white font-bold text-sm">100%</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-400 text-sm">Agent Drift</span>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-bold text-sm">4%</span>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-3 gap-6 mt-6">
            {/* Active Tool Permissions */}
            <div className="col-span-2 bg-[#1A1A1A] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 7H7v6h6V7z" />
                    <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-white font-bold text-lg">Active Tool Permissions</h3>
                </div>
                <span className="text-blue-400 text-sm font-bold">GLOBAL CONFIG</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Database & Storage */}
                <div>
                  <div className="text-gray-400 text-xs font-bold mb-4">DATABASE & STORAGE</div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium text-sm mb-1">Allow Database Reads</div>
                        <div className="text-gray-500 text-xs">Read-only access to specific tables</div>
                      </div>
                      <button
                        onClick={() => togglePermission('databaseReads')}
                        className={`relative w-12 h-6 rounded-full transition ${permissions.databaseReads ? 'bg-blue-600' : 'bg-gray-700'}`}
                      >
                        <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${permissions.databaseReads ? 'right-0.5' : 'left-0.5'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium text-sm mb-1">Allow Database Writes</div>
                        <div className="text-gray-500 text-xs">Insert/Update permissions</div>
                      </div>
                      <button
                        onClick={() => togglePermission('databaseWrites')}
                        className={`relative w-12 h-6 rounded-full transition ${permissions.databaseWrites ? 'bg-blue-600' : 'bg-gray-700'}`}
                      >
                        <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${permissions.databaseWrites ? 'right-0.5' : 'left-0.5'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Communication Tools */}
                <div>
                  <div className="text-gray-400 text-xs font-bold mb-4">COMMUNICATION TOOLS</div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium text-sm mb-1">Send Slack Messages</div>
                        <div className="text-gray-500 text-xs">Restricted to #notified channel</div>
                      </div>
                      <button
                        onClick={() => togglePermission('slackMessages')}
                        className={`relative w-12 h-6 rounded-full transition ${permissions.slackMessages ? 'bg-blue-600' : 'bg-gray-700'}`}
                      >
                        <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${permissions.slackMessages ? 'right-0.5' : 'left-0.5'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium text-sm mb-1">External Emails</div>
                        <div className="text-gray-500 text-xs">Allow sending to verified domains</div>
                      </div>
                      <button
                        onClick={() => togglePermission('externalEmails')}
                        className={`relative w-12 h-6 rounded-full transition ${permissions.externalEmails ? 'bg-blue-600' : 'bg-gray-700'}`}
                      >
                        <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${permissions.externalEmails ? 'right-0.5' : 'left-0.5'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleLockdown}
                className={`w-full px-4 py-4 ${isLockedDown ? 'bg-slate-800 border border-red-500/50 text-red-500' : 'bg-red-600 hover:bg-red-700 text-white'} rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300`}
              >
                <svg className={`w-5 h-5 ${isLockedDown ? 'animate-pulse' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                {isLockedDown ? "Terminating Lockdown..." : "Emergency Lockdown"}
              </button>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`w-full px-4 py-4 bg-[#1A1A1A] border border-gray-700 hover:bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                {isRefreshing ? "Syncing Policies..." : "Force Policy Refresh"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ThreatInvestigationModal
        isOpen={showInvestigateModal}
        onClose={() => setShowInvestigateModal(false)}
        onLockdown={() => {
          handleLockdown();
          setShowInvestigateModal(false);
        }}
      />
    </div>
  );
};

/* --- Threat Investigation Modal Component --- */
const ThreatInvestigationModal = ({ isOpen, onClose, onLockdown }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl">
      <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
      <div className="relative bg-[#0F111A] border border-red-500/30 rounded-2xl w-full max-w-4xl overflow-hidden shadow-[0_0_80px_rgba(220,38,38,0.15)] animate-in fade-in zoom-in duration-300">
        {/* Modal Header */}
        <div className="bg-red-500/10 border-b border-red-500/20 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Threat Intelligence Report: AG-9902</h2>
              <p className="text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3 h-3" />
                Critical Exploit Attempt Detected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 grid grid-cols-5 gap-8 overflow-y-auto max-h-[80vh]">
          {/* Left Column: Forensic Data */}
          <div className="col-span-3 space-y-6 text-left">
            <div>
              <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Intercepted Raw Payload</h3>
              <div className="bg-black/50 border border-slate-800 rounded-lg p-4 font-mono text-xs text-red-400 leading-relaxed overflow-x-auto">
                <code>
                  {`{
"tool_call": "database_proxy_v2",
"method": "RAW_SQL_EXEC",
"args": {
"query": "SELECT * FROM payroll_records JOIN employees...",
"bypass_filters": true,
"internal_access_token": "HIDDEN_PII_TOKEN"
},
"origin_agent": "Agent_04",
"threat_vector": "LLM01: Prompt Injection"
}`}
                </code>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#161824] border border-slate-800 rounded-xl p-4">
                <div className="text-gray-500 text-[10px] font-bold uppercase mb-1">Target Resource</div>
                <div className="text-white font-bold flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  Payroll_Production_DB
                </div>
              </div>
              <div className="bg-[#161824] border border-slate-800 rounded-xl p-4">
                <div className="text-gray-500 text-[10px] font-bold uppercase mb-1">Source Agent</div>
                <div className="text-white font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-400" />
                  Agent_04 (AutoGPT)
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Investigation Timeline</h3>
              <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                {[
                  { time: '01:05:12', event: 'Unauthorized query intercept by Firewall_V2', color: 'bg-red-500' },
                  { time: '01:05:14', event: 'Handshake validation found anomaly in agent behavior', color: 'bg-orange-500' },
                  { time: '01:05:15', event: 'Global Lockdown protocols automatically recommended', color: 'bg-blue-500' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 pl-6 relative">
                    <div className={`absolute left-[5px] w-2 h-2 rounded-full ${item.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}></div>
                    <span className="text-[10px] text-gray-400 font-mono pb-0.5">{item.time}</span>
                    <span className="text-xs text-gray-300">{item.event}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Recommendations */}
          <div className="col-span-2 space-y-6">
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center">
              <div className="text-red-400 text-5xl font-black mb-1">98.4%</div>
              <div className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Malicious Confidence</div>
              <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className={`h-1.5 w-full rounded-full ${i <= 4 ? 'bg-red-500' : 'bg-slate-800'}`}></div>)}
              </div>
            </div>

            <div className="space-y-3 text-left">
              <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Mitigation Recommended</h3>
              <button className="w-full flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-white text-xs font-bold">Quarantine Agent_04</div>
                    <div className="text-gray-500 text-[9px]">Sever all active runtime tokens</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-white text-xs font-bold">Force Policy Update</div>
                    <div className="text-gray-500 text-[9px]">Apply new PII masking rules</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
              </button>
            </div>

            <button
              onClick={onLockdown}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-[0_4px_20px_rgba(220,38,38,0.2)] transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
              <Activity className="w-5 h-5 group-hover:animate-pulse" />
              INITIATE AUTO-CONTAINMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAgent;
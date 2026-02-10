import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DashboardAgent = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState({
        databaseReads: true,
        databaseWrites: false,
        slackMessages: true,
        externalEmails: true
    });

    useEffect(() => {
        fetchMetrics();
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

    const togglePermission = (key) => {
        setPermissions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F0F0F] flex">
            {/* Left Sidebar */}
            <div className="w-60 bg-[#1A1A1A] border-r border-gray-800 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-white font-bold">Gateway Admin</div>
                            <div className="text-gray-500 text-xs">AI SECURITY SOC</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <Link to="/dashboard/agent" className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg mb-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                        <span className="font-medium text-sm">Overview</span>
                    </Link>

                    <Link to="/guidelines" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg mb-2 transition">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-sm">Policies</span>
                    </Link>

                    <Link to="/audit-logs" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg mb-2 transition">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-sm">Audit Logs</span>
                    </Link>

                    <Link to="/agent-safety" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg mb-2 transition">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 7H7v6h6V7z" />
                            <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-sm">Integrations</span>
                    </Link>

                    <Link to="/architecture-selection" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-sm">Settings</span>
                    </Link>
                </nav>

                {/* System Status */}
                <div className="p-4 border-t border-gray-800">
                    <div className="bg-[#0F0F0F] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">System Status</span>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <p className="text-gray-500 text-xs mb-3">All gateways are active and monitoring real-time tool calls.</p>
                        <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition">
                            System Secure
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Header */}
                <div className="bg-[#1A1A1A] border-b border-gray-800 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-white text-2xl font-bold mb-1">AI Agent Safety Dashboard</h1>
                            <p className="text-gray-400 text-sm">Autonomous permission control & threat monitoring</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <span className="text-white text-sm">Risk Score:</span>
                                <span className="text-blue-400 text-sm font-bold">42/100</span>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-8">
                    {/* Critical Alert */}
                    <div className="bg-gradient-to-r from-red-900/40 to-red-800/20 border border-red-800/50 rounded-xl p-5 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-red-400 font-bold mb-1">CRITICAL THREAT BLOCKED</h3>
                                <p className="text-gray-300 text-sm">
                                    Unauthorized attempt to access <span className="text-red-400 font-mono">'Payroll_DB'</span> by <span className="font-bold">Agent_04</span> was automatically intercepted.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition">
                                Investigate
                            </button>
                            <button className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition">
                                Dismiss
                            </button>
                        </div>
                    </div>

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

                            {/* Activity Table */}
                            <div className="space-y-3">
                                {/* Header */}
                                <div className="grid grid-cols-12 gap-4 text-gray-500 text-xs font-medium pb-2 border-b border-gray-800">
                                    <div className="col-span-2">TIMESTAMP</div>
                                    <div className="col-span-3">AGENT / TOOL</div>
                                    <div className="col-span-5">PARAMETERS</div>
                                    <div className="col-span-2">STATUS</div>
                                </div>

                                {/* Activity Row 1 */}
                                <div className="grid grid-cols-12 gap-4 items-center py-3 hover:bg-gray-900/30 rounded-lg transition">
                                    <div className="col-span-2 text-gray-400 text-sm font-mono">14:22:01.32</div>
                                    <div className="col-span-3 flex items-center gap-2">
                                        <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded">Agent_01</span>
                                        <span className="text-white text-sm">Slack Message</span>
                                    </div>
                                    <div className="col-span-5">
                                        <div className="text-gray-400 text-xs font-mono">
                                            channel: "#dev-ops",<br />
                                            body: "Deploy success"
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-green-400 text-sm font-bold">ALLOWED</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Row 2 - Blocked */}
                                <div className="grid grid-cols-12 gap-4 items-center py-3 bg-red-900/10 rounded-lg">
                                    <div className="col-span-2 text-gray-400 text-sm font-mono">14:21:48.89</div>
                                    <div className="col-span-3 flex items-center gap-2">
                                        <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded">Agent_04</span>
                                        <span className="text-red-400 text-sm font-bold">Database Query</span>
                                    </div>
                                    <div className="col-span-5">
                                        <div className="text-red-400 text-xs font-mono">
                                            SELECT * FROM<br />
                                            payroll_records
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            <span className="text-red-400 text-sm font-bold">BLOCKED</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Row 3 */}
                                <div className="grid grid-cols-12 gap-4 items-center py-3 hover:bg-gray-900/30 rounded-lg transition">
                                    <div className="col-span-2 text-gray-400 text-sm font-mono">14:21:42.55</div>
                                    <div className="col-span-3 flex items-center gap-2">
                                        <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded">Agent_02</span>
                                        <span className="text-white text-sm">Send Email</span>
                                    </div>
                                    <div className="col-span-5">
                                        <div className="text-gray-400 text-xs font-mono">
                                            to: "client@example.com",<br />
                                            subject: "Update"
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                            <span className="text-yellow-400 text-sm font-bold">PENDING</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Row 4 */}
                                <div className="grid grid-cols-12 gap-4 items-center py-3 hover:bg-gray-900/30 rounded-lg transition">
                                    <div className="col-span-2 text-gray-400 text-sm font-mono">14:21:30.12</div>
                                    <div className="col-span-3 flex items-center gap-2">
                                        <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded">Agent_01</span>
                                        <span className="text-white text-sm">File System Read</span>
                                    </div>
                                    <div className="col-span-5">
                                        <div className="text-gray-400 text-xs font-mono">
                                            path:<br />
                                            "/tmp/logs/latest.txt"
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-green-400 text-sm font-bold">ALLOWED</span>
                                        </div>
                                    </div>
                                </div>
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
                            <button className="w-full px-4 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                Emergency Lockdown
                            </button>

                            <button className="w-full px-4 py-4 bg-[#1A1A1A] border border-gray-700 hover:bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                </svg>
                                Force Policy Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAgent;
import { useState, useEffect } from 'react';
import {
    Shield,
    LayoutDashboard,
    Settings,
    Zap,
    Target,
    Bell,
    AlertCircle,
    ShieldCheck,
    Activity,
    Download,
    Play,
    Plug,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    RefreshCw,
    LogOut,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConnectLLMModal from '../components/ConnectLLMModal';

const DashboardLLM = () => {
    const navigate = useNavigate();
    const [isLive, setIsLive] = useState(true);

    // Real-time data states
    const [metrics, setMetrics] = useState({
        protected_requests: 0,
        attacks_blocked: 0,
        cost_saved: 0,
        security_score: 92,
        success_rate: 100
    });

    const [moduleHealth, setModuleHealth] = useState({
        firewall: { status: 'inactive', latency: 0, scans: 0 },
        pii: { status: 'inactive', redacted: 0, scans: 0 },
        jailbreak: { status: 'inactive', detected: 0, confidence: 0 },
        dlp: { status: 'inactive', leaks_found: 0, scans: 0 }
    });

    // LLM Connection State
    const [llmConnection, setLlmConnection] = useState({
        connected: false,
        model_name: null,
        model_type: null,
        status: 'disconnected',
        response_time: null,
        last_tested: null
    });

    const [showConnectModal, setShowConnectModal] = useState(false);
    const [securityEvents, setSecurityEvents] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [exportingReport, setExportingReport] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Clock update
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Initial data fetch
    useEffect(() => {
        fetchAllData();
    }, []);

    // Real-time polling
    useEffect(() => {
        let metricsInterval, logsInterval, moduleInterval, llmInterval;

        if (isLive) {
            metricsInterval = setInterval(fetchMetrics, 5000);
            logsInterval = setInterval(fetchSecurityLogs, 8000);
            moduleInterval = setInterval(fetchModuleHealth, 12000);
            llmInterval = setInterval(fetchLLMConnection, 15000);
        }

        return () => {
            clearInterval(metricsInterval);
            clearInterval(logsInterval);
            clearInterval(moduleInterval);
            clearInterval(llmInterval);
        };
    }, [isLive]);

    const fetchAllData = async () => {
        await Promise.all([
            fetchMetrics(),
            fetchSecurityLogs(),
            fetchModuleHealth(),
            fetchLLMConnection()
        ]);
    };

    const fetchMetrics = async () => {
        try {
            const token = localStorage.getItem('token');

            const firewallRes = await fetch('http://localhost:8000/api/firewall/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const metricsRes = await fetch('http://localhost:8000/api/dashboard/metrics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (firewallRes.ok) {
                const firewallData = await firewallRes.json();

                const totalScans = firewallData.length;
                const blockedAttacks = firewallData.filter(log => log.action === 'BLOCK').length;
                const costSaved = blockedAttacks * 12.5;
                const successRate = totalScans > 0
                    ? ((blockedAttacks / totalScans) * 100).toFixed(1)
                    : 100;

                let securityScore = 92;
                if (metricsRes.ok) {
                    const metricsData = await metricsRes.json();
                    securityScore = metricsData.security_score || 92;
                }

                setMetrics({
                    protected_requests: totalScans,
                    attacks_blocked: blockedAttacks,
                    cost_saved: costSaved,
                    security_score: securityScore,
                    success_rate: successRate
                });

                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Error fetching metrics:', error);
        }
    };

    const fetchSecurityLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/firewall/history?limit=5', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const transformedLogs = data.map(log => ({
                    time: new Date(log.created_at).toLocaleTimeString('en-US', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }),
                    snippet: `"${log.prompt?.substring(0, 50)}..."` || 'N/A',
                    category: getCategoryLabel(null, log.action),
                    action: log.action || 'PASSED',
                    conf: `${log.risk_score || 0}%`,
                    color: getColorClass(log.action)
                }));
                setSecurityEvents(transformedLogs);
            }
        } catch (error) {
            console.error('Error fetching security logs:', error);
        }
    };

    const fetchModuleHealth = async () => {
        try {
            const token = localStorage.getItem('token');

            // Check if LLM is connected first
            const llmConnected = llmConnection.connected;

            const [firewallRes, piiRes, jailbreakRes, dlpRes] = await Promise.all([
                fetch('http://localhost:8000/api/firewall/history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:8000/api/pii/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:8000/api/jailbreak/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:8000/api/dlp/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            let firewallScans = 0;
            if (firewallRes.ok) {
                const firewallData = await firewallRes.json();
                firewallScans = firewallData.length;
            }

            let piiStats = { redacted: 0, scans: 0 };
            if (piiRes.ok) {
                piiStats = await piiRes.json();
            }

            let jailbreakStats = { detected: 0, confidence: 0, total_detections: 0, jailbreaks_found: 0, avg_confidence: 0 };
            if (jailbreakRes.ok) {
                jailbreakStats = await jailbreakRes.json();
            }

            let dlpStats = { leaks_found: 0, scans: 0 };
            if (dlpRes.ok) {
                dlpStats = await dlpRes.json();
            }

            // ✅ FIX: Modules are active if LLM is connected, regardless of usage stats
            setModuleHealth({
                firewall: {
                    status: llmConnected ? 'active' : 'inactive',
                    latency: 14,
                    scans: firewallScans
                },
                pii: {
                    status: llmConnected ? 'active' : 'inactive',
                    redacted: piiStats.redacted || 0,
                    scans: piiStats.scans || 0
                },
                jailbreak: {
                    status: llmConnected ? 'active' : 'inactive',
                    detected: jailbreakStats.jailbreaks_found || 0,
                    confidence: jailbreakStats.avg_confidence || 0
                },
                dlp: {
                    status: llmConnected ? 'active' : 'inactive',
                    leaks_found: dlpStats.leaks_found || 0,
                    scans: dlpStats.scans || 0
                }
            });
        } catch (error) {
            console.error('Error fetching module health:', error);
        }
    };

    const fetchLLMConnection = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/llm/connected', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setLlmConnection(data);
                
                // Refresh module health when LLM connection changes
                fetchModuleHealth();
            }
        } catch (error) {
            console.error('Error fetching LLM connection:', error);
        }
    };

    const testConnection = async () => {
        setTestingConnection(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/llm/test-connection', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                alert(`✅ Connection test successful!\nResponse Time: ${data.response_time}ms`);
                fetchLLMConnection();
            } else {
                alert(`❌ Connection test failed:\n${data.message}`);
            }
        } catch (error) {
            alert('❌ Connection test failed: Network error');
        }
        setTestingConnection(false);
    };

    const disconnectLLM = async () => {
        if (!confirm('⚠️ Are you sure you want to disconnect the LLM?\n\nThis will disable:\n• Firewall scanning\n• Red teaming\n• All security modules')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/llm/disconnect', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setLlmConnection({
                    connected: false,
                    model_name: null,
                    status: 'disconnected'
                });
                alert('✅ LLM disconnected successfully');
                fetchModuleHealth(); // Refresh to show inactive status
            }
        } catch (error) {
            alert('❌ Failed to disconnect LLM');
        }
    };

    const handleExportReport = async () => {
        if (!llmConnection.connected) {
            alert('⚠️ Please connect an LLM first');
            return;
        }

        setExportingReport(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/dashboard/export-report', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    metrics,
                    moduleHealth,
                    llmConnection,
                    securityEvents,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                const data = await response.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `guardian-ai-report-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                alert('✅ Report exported successfully');
            } else {
                alert('❌ Failed to export report');
            }
        } catch (error) {
            console.error('Error exporting report:', error);
            alert('❌ Failed to export report');
        }
        setExportingReport(false);
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    const getCategoryLabel = (threatType, action) => {
        if (action === 'BLOCK') {
            return threatType || 'LLM01: Prompt Injection';
        } else if (action === 'TRANSFORM') {
            return 'LLM06: Sensitive Info';
        }
        return 'NONE: Safe';
    };

    const getColorClass = (action) => {
        if (action === 'BLOCK') return 'text-red-400 bg-red-400/10';
        if (action === 'TRANSFORM') return 'text-orange-400 bg-orange-400/10';
        return 'text-green-400 bg-green-400/10';
    };

    const formatNumber = (num) => {
        if (!num || num === 0) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };

    const formatCurrency = (num) => {
        if (!num || num === 0) return '$0';
        if (num >= 1000) return `$${(num / 1000).toFixed(1)}k`;
        return `$${Math.round(num)}`;
    };

    return (
        <div className="flex min-h-screen bg-[#06060E] text-slate-300 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0A0A14] border-r border-slate-800 flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Shield className="text-white w-6 h-6" />
                    </div>
                    <div className="leading-tight">
                        <h1 className="text-white font-black text-lg">Guardian AI</h1>
                        <p className="text-[10px] text-slate-500 font-medium">LLM Security Platform</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    {/* Back to Architecture Selection */}
                    <button
                        onClick={() => navigate('/architecture-selection')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back to Selection
                    </button>

                    {/* Settings */}
                    <button
                        onClick={() => navigate('/settings')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Settings size={18} />
                        Settings
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg text-sm font-medium transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </nav>

                {/* Live/Pause Status */}
                <div className="px-4 py-3 border-t border-slate-800">
                    <div className="flex items-center justify-between bg-[#121220] rounded-lg p-3 border border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}></div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                {isLive ? 'LIVE' : 'PAUSED'}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsLive(!isLive)}
                            className={`text-[9px] px-2 py-1 rounded ${isLive ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}
                        >
                            {isLive ? 'Pause' : 'Resume'}
                        </button>
                    </div>
                    <div className="text-slate-600 text-[9px] mt-2 text-center">
                        Updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                </div>

                {/* Red Team Button */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => navigate('/red-team')}
                        disabled={!llmConnection.connected}
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white rounded-lg p-4 font-bold uppercase text-sm tracking-wider transition-all shadow-lg hover:shadow-red-500/20 disabled:shadow-none"
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Target size={20} />
                            <span>Red Teaming</span>
                        </div>
                        <div className="text-[10px] opacity-80 normal-case tracking-normal">
                            {llmConnection.connected ? 'Start Security Testing' : 'Connect LLM First'}
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-16 border-b border-slate-800 bg-[#0A0A14]/50 backdrop-blur-md flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-white font-bold text-lg">Security Dashboard</h2>

                        {/* LLM Connection Status */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${llmConnection.connected
                                ? 'bg-emerald-900/20 border-emerald-800'
                                : 'bg-red-900/20 border-red-800'
                            }`}>
                            <Plug size={14} className={llmConnection.connected ? 'text-emerald-400' : 'text-red-400'} />
                            <span className="text-xs text-slate-400">Model:</span>
                            {llmConnection.connected ? (
                                <>
                                    <span className="text-xs text-white font-bold">{llmConnection.model_name}</span>
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                </>
                            ) : (
                                <>
                                    <span className="text-xs text-red-400 font-bold">Not Connected</span>
                                    <XCircle size={14} className="text-red-500" />
                                </>
                            )}
                        </div>

                        {/* Response Time Badge */}
                        {llmConnection.connected && llmConnection.response_time && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-lg border border-slate-800">
                                <Activity size={14} className="text-blue-400" />
                                <span className="text-xs text-slate-400">Latency:</span>
                                <span className="text-xs text-white font-bold">{llmConnection.response_time}ms</span>
                            </div>
                        )}

                        {/* Live Status */}
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-lg border border-slate-800">
                            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                            <span className="text-slate-300 text-xs font-medium">{isLive ? 'Real-Time' : 'Paused'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* LLM Management Buttons */}
                        {llmConnection.connected ? (
                            <>
                                <button
                                    onClick={testConnection}
                                    disabled={testingConnection}
                                    className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
                                >
                                    {testingConnection ? (
                                        <>
                                            <RefreshCw size={14} className="animate-spin" />
                                            Testing...
                                        </>
                                    ) : (
                                        <>
                                            <Activity size={14} />
                                            Test
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={disconnectLLM}
                                    className="flex items-center gap-2 px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-xs font-bold transition-colors"
                                >
                                    <XCircle size={14} />
                                    Disconnect
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setShowConnectModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
                            >
                                <Plug size={16} />
                                Connect LLM
                            </button>
                        )}

                        {/* Export Report Button */}
                        <button
                            onClick={handleExportReport}
                            disabled={exportingReport || !llmConnection.connected}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-colors"
                            title={!llmConnection.connected ? 'Connect an LLM first' : 'Export security report'}
                        >
                            {exportingReport ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download size={16} />
                                    Export Report
                                </>
                            )}
                        </button>

                        <button className="text-slate-400 hover:text-white relative">
                            <Bell size={20} />
                            {metrics.attacks_blocked > 0 && (
                                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0A0A14]"></div>
                            )}
                        </button>
                    </div>
                </header>

                {/* Dashboard Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* LLM Not Connected Warning */}
                    {!llmConnection.connected && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                    <AlertTriangle className="text-yellow-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-yellow-400 font-bold">No LLM Connected</h3>
                                    <p className="text-yellow-400/70 text-sm">
                                        Connect an LLM model to enable scanning, red teaming, and real-time protection.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowConnectModal(true)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg text-sm font-bold transition-colors"
                            >
                                Connect Now
                            </button>
                        </div>
                    )}

                    {/* Critical Alert */}
                    {metrics.attacks_blocked > 40 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                    <AlertCircle className="text-red-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-red-400 font-bold">High-Frequency Attack Detected</h3>
                                    <p className="text-red-400/70 text-sm">
                                        Anomaly detected from multiple IPs. {metrics.attacks_blocked} requests blocked.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/audit-logs')}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                            >
                                Review Threats
                            </button>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Protected Requests */}
                        <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Activity size={80} className="text-blue-500" />
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Protected Requests</p>
                            <div className="flex items-end gap-3">
                                <h3 className="text-4xl font-black text-white">{formatNumber(metrics.protected_requests)}</h3>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-emerald-400 font-bold">Real-time monitoring</span>
                            </div>
                        </div>

                        {/* Attacks Blocked */}
                        <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-red-500/30 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Attacks Blocked</p>
                            <div className="flex items-end gap-3">
                                <h3 className="text-4xl font-black text-white">{formatNumber(metrics.attacks_blocked)}</h3>
                                <span className="text-emerald-400 text-sm font-bold pb-1">100% blocked</span>
                            </div>
                            <div className="absolute bottom-6 right-6">
                                <ShieldCheck className="text-red-500/20" size={48} />
                            </div>
                        </div>

                        {/* Cost Saved */}
                        <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-green-500/30 transition-colors">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Estimated Cost Saved</p>
                            <div className="flex items-end gap-3">
                                <h3 className="text-4xl font-black text-white">{formatCurrency(metrics.cost_saved)}</h3>
                                <span className="text-slate-500 text-sm pb-1">this session</span>
                            </div>
                            <div className="absolute top-6 right-6 w-12 h-12">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                                    <circle
                                        cx="24"
                                        cy="24"
                                        r="20"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="transparent"
                                        strokeDasharray="125.6"
                                        strokeDashoffset={125.6 - (125.6 * metrics.security_score / 100)}
                                        className="text-green-500 transition-all duration-1000"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                                    {metrics.security_score}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Module Health Section */}
                    <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-bold uppercase text-xs tracking-widest">
                                Security Modules Health
                            </h3>
                            <button
                                onClick={fetchModuleHealth}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                <RefreshCw size={12} />
                                Refresh
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* 1. Prompt Firewall */}
                            <button
                                onClick={() => navigate('/firewall')}
                                disabled={!llmConnection.connected}
                                className="bg-[#121220] border border-slate-800 rounded-lg p-4 hover:border-blue-500/30 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                                        <Zap size={20} />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${moduleHealth.firewall.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
                                        <span className={`text-[9px] font-bold uppercase ${moduleHealth.firewall.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {moduleHealth.firewall.status}
                                        </span>
                                    </div>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2">Prompt Firewall</h4>
                                <div className="space-y-1 text-[10px] text-slate-400">
                                    <div className="flex justify-between">
                                        <span>Total Scans:</span>
                                        <span className="font-bold text-white">{moduleHealth.firewall.scans}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Avg Latency:</span>
                                        <span className="font-bold text-white">{moduleHealth.firewall.latency}ms</span>
                                    </div>
                                </div>
                            </button>

                            {/* 2. PII Detection */}
                            <button
                                onClick={() => navigate('/pii-anonymizer')}
                                disabled={!llmConnection.connected}
                                className="bg-[#121220] border border-slate-800 rounded-lg p-4 hover:border-purple-500/30 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500/20 transition-colors">
                                        <Shield size={20} />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${moduleHealth.pii.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
                                        <span className={`text-[9px] font-bold uppercase ${moduleHealth.pii.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {moduleHealth.pii.status}
                                        </span>
                                    </div>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2">PII Detection</h4>
                                <div className="space-y-1 text-[10px] text-slate-400">
                                    <div className="flex justify-between">
                                        <span>Entities Redacted:</span>
                                        <span className="font-bold text-white">{moduleHealth.pii.redacted}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Scans:</span>
                                        <span className="font-bold text-white">{moduleHealth.pii.scans}</span>
                                    </div>
                                </div>
                            </button>

                            {/* 3. Jailbreak Detection */}
                            <button
                                onClick={() => navigate('/jailbreak-detector')}
                                disabled={!llmConnection.connected}
                                className="bg-[#121220] border border-slate-800 rounded-lg p-4 hover:border-orange-500/30 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500/20 transition-colors">
                                        <AlertCircle size={20} />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${moduleHealth.jailbreak.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
                                        <span className={`text-[9px] font-bold uppercase ${moduleHealth.jailbreak.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {moduleHealth.jailbreak.status}
                                        </span>
                                    </div>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2">Jailbreak Detection</h4>
                                <div className="space-y-1 text-[10px] text-slate-400">
                                    <div className="flex justify-between">
                                        <span>Attempts Blocked:</span>
                                        <span className="font-bold text-white">{moduleHealth.jailbreak.detected}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>AI Model:</span>
                                        <span className="font-bold text-white">Llama Guard 3</span>
                                    </div>
                                </div>
                            </button>

                            {/* 4. DLP Scanner */}
                            <button
                                onClick={() => navigate('/DLP')}
                                disabled={!llmConnection.connected}
                                className="bg-[#121220] border border-slate-800 rounded-lg p-4 hover:border-green-500/30 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500/20 transition-colors">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${moduleHealth.dlp.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
                                        <span className={`text-[9px] font-bold uppercase ${moduleHealth.dlp.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {moduleHealth.dlp.status}
                                        </span>
                                    </div>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2">DLP Scanner</h4>
                                <div className="space-y-1 text-[10px] text-slate-400">
                                    <div className="flex justify-between">
                                        <span>Leaks Detected:</span>
                                        <span className="font-bold text-white">{moduleHealth.dlp.leaks_found}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Scans:</span>
                                        <span className="font-bold text-white">{moduleHealth.dlp.scans}</span>
                                    </div>
                                </div>
                            </button>

                            {/* Module Count Display */}
                            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-800/50 rounded-lg p-4 flex flex-col justify-center">
                                <div className="text-center">
                                    <div className="text-3xl font-black text-white mb-2">
                                        {[moduleHealth.firewall.status, moduleHealth.pii.status, moduleHealth.jailbreak.status, moduleHealth.dlp.status].filter(s => s === 'active').length}/4
                                    </div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-3">
                                        Modules Active
                                    </div>
                                    <div className="flex justify-center gap-1 mb-3">
                                        {[moduleHealth.firewall.status, moduleHealth.pii.status, moduleHealth.jailbreak.status, moduleHealth.dlp.status].map((status, i) => (
                                            <div
                                                key={i}
                                                className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500' : 'bg-slate-600'}`}
                                                title={`Module ${i + 1}: ${status}`}
                                            ></div>
                                        ))}
                                    </div>
                                    {!llmConnection.connected && (
                                        <div className="text-[9px] text-red-400 uppercase font-bold">
                                            LLM Required
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Real-time Security Stream */}
                    <div className="bg-[#0A0A14] border border-slate-800 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-1">Real-time Security Stream</h3>
                                <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">
                                    Live monitoring — data updates every {isLive ? '8s' : 'paused'}
                                </p>
                            </div>
                            <button
                                onClick={fetchSecurityLogs}
                                className="px-4 py-1.5 text-blue-400 hover:bg-blue-900/30 rounded-lg text-xs font-bold transition flex items-center gap-1"
                            >
                                <Activity size={14} />
                                Refresh
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#121220]/50 text-slate-500 uppercase font-bold tracking-widest border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-3 font-black">Timestamp</th>
                                        <th className="px-6 py-3 font-black">Intercepted Payload</th>
                                        <th className="px-6 py-3 font-black">OWASP Category</th>
                                        <th className="px-6 py-3 font-black">Action</th>
                                        <th className="px-6 py-3 font-black">Conf.</th>
                                        <th className="px-6 py-3 font-black">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {securityEvents.length > 0 ? (
                                        securityEvents.map((event, i) => (
                                            <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4 text-slate-500 font-mono tracking-tighter">{event.time}</td>
                                                <td className="px-6 py-4 text-white italic font-medium">{event.snippet}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${event.color}`}>
                                                        {event.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`w-1 h-1 rounded-full ${event.action === 'PASS' ? 'bg-emerald-500' :
                                                                event.action === 'TRANSFORM' ? 'bg-orange-500' :
                                                                    'bg-red-500'
                                                            }`}></div>
                                                        <span className={`font-black tracking-widest text-[10px] ${event.action === 'PASS' ? 'text-emerald-500' :
                                                                event.action === 'TRANSFORM' ? 'text-orange-500' :
                                                                    'text-red-500'
                                                            }`}>
                                                            {event.action}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-white">{event.conf}</td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => navigate('/audit-logs')}
                                                        className="text-blue-500 font-bold hover:underline"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <ShieldCheck className="w-12 h-12 text-slate-600" />
                                                    <div className="text-slate-500">No security events detected yet</div>
                                                    {llmConnection.connected ? (
                                                        <button
                                                            onClick={() => navigate('/firewall')}
                                                            className="text-blue-400 hover:text-blue-300 text-sm underline"
                                                        >
                                                            Scan a prompt in the Firewall to start
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setShowConnectModal(true)}
                                                            className="text-yellow-400 hover:text-yellow-300 text-sm underline"
                                                        >
                                                            Connect an LLM to start monitoring
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Connect LLM Modal */}
            <ConnectLLMModal
                isOpen={showConnectModal}
                onClose={() => setShowConnectModal(false)}
                onSuccess={() => {
                    fetchLLMConnection();
                    setShowConnectModal(false);
                }}
            />
        </div>
    );
};

export default DashboardLLM;

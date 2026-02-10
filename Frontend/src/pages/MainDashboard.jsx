import { useState, useEffect } from "react";
import {
  Shield,
  LayoutDashboard,
  FileText,
  Settings,
  Zap,
  Target,
  Search,
  Bell,
  User,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const MainDashboard = () => {
  const navigate = useNavigate();

  const securityEvents = [
    {
      time: "14:28:42.02",
      snippet: '"Ignore previous instructions and out...',
      category: "LLM01: Prompt Injection",
      action: "BLOCKED",
      conf: "98.2%",
      color: "text-red-400 bg-red-400/10",
    },
    {
      time: "14:28:40.11",
      snippet: '"My credit card number is 4532-xxxx-...',
      category: "LLM06: Sensitive Info",
      action: "REDACTED",
      conf: "99.9%",
      color: "text-orange-400 bg-orange-400/10",
    },
    {
      time: "14:28:38.85",
      snippet: '"What is the capital of France?"',
      category: "NONE: Safe",
      action: "PASSED",
      conf: "100%",
      color: "text-green-400 bg-green-400/10",
    },
    {
      time: "14:28:35.01",
      snippet: '"Generate 1000 copies of this text un...',
      category: "LLM04: Model DoS",
      action: "BLOCKED",
      conf: "92.4%",
      color: "text-red-400 bg-red-400/10",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#06060E] text-slate-300 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A14] border-r border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="text-white w-5 h-5" />
          </div>
          <div className="leading-tight">
            <h1 className="text-white font-bold text-sm">SECURITY GATEWAY</h1>
            <p className="text-[10px] text-slate-500 font-medium">
              ENTERPRISE LLM PROTECTION
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg text-sm font-medium">
            <LayoutDashboard size={18} />
            Overview
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium transition-colors">
            <FileText size={18} />
            Security Logs
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium transition-colors">
            <ShieldCheck size={18} />
            Policies
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium transition-colors">
            <Target size={18} />
            Red Teaming
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium transition-colors">
            <Settings size={18} />
            Settings
          </button>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-[#121220] rounded-lg p-4 border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-wider">
              Current Cluster
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-white font-medium">
                us-east-prod-01
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-[#0A0A14]/50 backdrop-blur-md flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-bold text-lg">Main Dashboard</h2>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Database size={14} />
              <span>AWS Production</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search logs..."
                className="bg-slate-900/50 border border-slate-800 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all w-64"
              />
            </div>
            <button className="text-slate-400 hover:text-white relative">
              <Bell size={20} />
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0A0A14]"></div>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                <User
                  size={20}
                  className="text-slate-400"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {/* Critical Alert */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertCircle
                  className="text-red-400"
                  size={24}
                />
              </div>
              <div>
                <h3 className="text-red-400 font-bold">
                  High-Frequency Attack Detected
                </h3>
                <p className="text-red-400/70 text-sm">
                  Anomaly detected from 3 isolated IPs targeting prompt
                  injection endpoints. 42 requests blocked in last 10s.
                </p>
              </div>
            </div>
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              Review Threats
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity
                  size={80}
                  className="text-blue-500"
                />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                Protected Requests
              </p>
              <div className="flex items-end gap-3">
                <h3 className="text-4xl font-black text-white">1.2M</h3>
                <span className="text-emerald-400 text-sm font-bold pb-1 flex items-center gap-1">
                  <TrendingUp size={14} /> +12.5% this week
                </span>
              </div>
              <div className="mt-4 flex gap-1 items-end h-8">
                {[4, 6, 3, 5, 8, 4, 7, 9, 6, 8].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-blue-600/40 rounded-t-sm"
                    style={{ height: `${h * 10}%` }}
                  ></div>
                ))}
              </div>
            </div>

            <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                Attacks Blocked
              </p>
              <div className="flex items-end gap-3">
                <h3 className="text-4xl font-black text-white">4,203</h3>
                <span className="text-emerald-400 text-sm font-bold pb-1">
                  100% success rate
                </span>
              </div>
              <div className="absolute bottom-6 right-6">
                <ShieldCheck
                  className="text-emerald-500/20"
                  size={48}
                />
              </div>
            </div>

            <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                Estimated Cost Saved
              </p>
              <div className="flex items-end gap-3">
                <h3 className="text-4xl font-black text-white">$12.4k</h3>
                <span className="text-slate-500 text-sm pb-1">
                  Token drainage prevented
                </span>
              </div>
              <div className="absolute top-6 right-6 w-12 h-12">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-slate-800"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray="125.6"
                    strokeDashoffset="20"
                    className="text-blue-500"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                  84%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OWASP Coverage */}
            <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-white font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                  OWASP LLM TOP 10 COVERAGE
                  <AlertCircle
                    size={14}
                    className="text-slate-500"
                  />
                </h3>
              </div>
              <div className="flex flex-col items-center justify-center py-6">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg
                    className="absolute w-full h-full transform"
                    viewBox="0 0 100 100"
                  >
                    <polygon
                      points="50,5 95,25 95,75 50,95 5,75 5,25"
                      fill="none"
                      stroke="#1E1E2E"
                      strokeWidth="1"
                    />
                    <polygon
                      points="50,15 85,30 85,70 50,85 15,70 15,30"
                      fill="none"
                      stroke="#1E1E2E"
                      strokeWidth="1"
                    />
                    <polygon
                      points="50,25 75,35 75,65 50,75 25,65 25,35"
                      fill="none"
                      stroke="#1E1E2E"
                      strokeWidth="1"
                    />

                    {/* Active coverage area */}
                    <polygon
                      points="50,8 90,28 92,72 50,92 8,72 12,28"
                      fill="rgba(37, 99, 235, 0.2)"
                      stroke="#2563EB"
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="z-10 text-center">
                    <span className="text-4xl font-black text-white">92%</span>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                      POSTURE
                    </p>
                  </div>
                </div>
                <div className="flex gap-8 mt-8">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      LLM01 Injection
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      LLM06 PII Leak
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-6">
              <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-6 uppercase">
                Module System Health
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#121220] border border-slate-800 rounded-lg p-4 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Zap size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        Prompt Firewall
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Latency: 14ms
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-emerald-500">
                      ACTIVE
                    </span>
                  </div>
                </div>

                <div className="bg-[#121220] border border-slate-800 rounded-lg p-4 flex items-center justify-between group hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Shield size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        PII Anonymizer
                      </p>
                      <p className="text-[10px] text-slate-500">
                        32 fields redacted today
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-emerald-500">
                      ACTIVE
                    </span>
                  </div>
                </div>

                <div className="bg-[#121220] border border-slate-800 rounded-lg p-4 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Search size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        Jailbreak Detector
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Llama Guard 3 Model
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-emerald-500">
                      ACTIVE
                    </span>
                  </div>
                </div>

                <div className="bg-[#121220] border border-slate-800 rounded-lg p-4 flex items-center justify-between group hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-slate-500">
                      <Activity size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        Adversarial Testing
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Scheduled: 04:00 AM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-500">
                    <span className="text-[10px]">IDLE</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:bg-blue-600/20 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">
                      Security Patch Available
                    </p>
                    <p className="text-[10px] text-blue-400">
                      v2.4.1 includes fixes for GPT-4o jailbreaks.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-800/60 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">
                      Red Team Sim
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Start a new 15-minute automated test run.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Stream */}
          <div className="bg-[#0A0A14] border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-1">
                  Real-time Security Stream
                </h3>
                <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">
                  Monitoring all active LLM inferences in real-time
                </p>
              </div>
              <div className="flex bg-[#121220] rounded-lg p-1">
                <button className="px-4 py-1.5 bg-slate-800 text-white rounded-md text-xs font-bold">
                  All Traffic
                </button>
                <button className="px-4 py-1.5 text-slate-500 hover:text-white rounded-md text-xs font-bold transition-colors">
                  Threats Only
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121220]/50 text-slate-500 uppercase font-bold tracking-widest border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3 font-black">Timestamp</th>
                    <th className="px-6 py-3 font-black">
                      Intercepted Payload Snippet
                    </th>
                    <th className="px-6 py-3 font-black">OWASP Category</th>
                    <th className="px-6 py-3 font-black">Action</th>
                    <th className="px-6 py-3 font-black">Conf.</th>
                    <th className="px-6 py-3 font-black">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {securityEvents.map((event, i) => (
                    <tr
                      key={i}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-4 text-slate-500 font-mono tracking-tighter">
                        {event.time}
                      </td>
                      <td className="px-6 py-4 text-white italic font-medium">
                        {event.snippet}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${event.color}`}
                        >
                          {event.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-1 h-1 rounded-full ${event.action === "PASSED" ? "bg-emerald-500" : event.action === "REDACTED" ? "bg-orange-500" : "bg-red-500"}`}
                          ></div>
                          <span
                            className={`font-black tracking-widest text-[10px] ${event.action === "PASSED" ? "text-emerald-500" : event.action === "REDACTED" ? "text-orange-500" : "text-red-500"}`}
                          >
                            {event.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        {event.conf}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-500 font-bold hover:underline">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-[#121220]/30 border-t border-slate-800 text-center">
              <button className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-white transition-colors">
                View All Security Logs
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainDashboard;

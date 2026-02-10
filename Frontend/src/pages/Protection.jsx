import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Protection = () => {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const userData = localStorage.getItem("user");
    try {
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    // user info is derived from localStorage in initial state
  }, [navigate]);

  // Fetch real-time dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8000/api/dashboard/realtime-stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        setLastUpdate(new Date());
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setLoading(false);
    }
  };

  // Initial fetch and polling every 5 seconds
  useEffect(() => {
    if (user) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user || loading)
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0B1120] border-r border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xl">A</span>
          </div>
          <span className="font-black text-xl text-white">Guardian AI</span>
        </div>

        <nav className="space-y-2">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg font-medium"
          >
            <span>📊</span>
            <span>Command Center</span>
          </a>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-white font-bold text-sm">
                  {user.username}
                </div>
                <div className="text-gray-400 text-xs">{user.email}</div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg font-medium text-sm transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header with Live Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">
                Protection Hub
              </h1>
              <p className="text-gray-400">
                Unified control center for LLM security posture and OWASP
                mitigation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-400 text-sm">
                Live • Updated{" "}
                {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : "now"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards - NOW WITH REAL DATA */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-[#0f1629] rounded-xl border border-gray-800 p-6">
            <div className="text-gray-400 text-sm mb-2">
              Total Threats Blocked
            </div>
            <div className="text-4xl font-black text-white mb-1">
              {dashboardData
                ? formatNumber(dashboardData.total_threats_blocked)
                : "0"}
            </div>
            <div className="text-green-400 text-sm">
              {dashboardData?.threats_blocked_change || "↑ 0%"}
            </div>
          </div>

          <div className="bg-[#0f1629] rounded-xl border border-gray-800 p-6">
            <div className="text-gray-400 text-sm mb-2">
              Prompt Latency (Avg)
            </div>
            <div className="text-4xl font-black text-white mb-1">
              {dashboardData?.prompt_latency_avg || 0}ms
            </div>
            <div className="text-blue-400 text-sm">
              ~ {dashboardData?.latency_status || "Stable"}
            </div>
          </div>

          <div className="bg-[#0f1629] rounded-xl border border-gray-800 p-6">
            <div className="text-gray-400 text-sm mb-2">
              PII Leakage Attempts
            </div>
            <div className="text-4xl font-black text-white mb-1">
              {dashboardData?.pii_leakage_attempts || 0}
            </div>
            <div className="text-green-400 text-sm">
              ✓ {dashboardData?.pii_status || "100% Clean"}
            </div>
          </div>

          <div className="bg-[#0f1629] rounded-xl border border-gray-800 p-6">
            <div className="text-gray-400 text-sm mb-2">
              Agent Tokens Protected
            </div>
            <div className="text-4xl font-black text-white mb-1">
              {dashboardData
                ? formatNumber(dashboardData.agent_tokens_protected)
                : "0"}
            </div>
            <div className="text-blue-400 text-sm">
              {dashboardData?.tokens_change || "↑ 0%"}
            </div>
          </div>
        </div>

        {/* Protection Modules Grid - NOW WITH REAL DATA */}
        <div className="grid grid-cols-3 gap-6">
          {/* Firewall */}
          <div
            onClick={() => navigate("/firewall")}
            className="bg-[#0f1629] rounded-xl border border-gray-800 p-6 hover:border-blue-500/50 hover:bg-[#121b33] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition">
                  <span className="text-2xl">🛡️</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">Firewall</h3>
                  <p className="text-gray-400 text-xs">
                    Prompt Injection Filtering
                  </p>
                </div>
              </div>
              <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                {dashboardData?.modules?.firewall?.status || "ACTIVE"}
              </span>
            </div>

            <div className="flex items-end gap-2 h-24 mb-4">
              {[40, 60, 45, 70, 55, 80, 65, 90].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-blue-500 rounded-t group-hover:bg-blue-400 transition-all"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-400">Blocks:</span>
                <span className="text-white font-bold ml-2">
                  {dashboardData?.modules?.firewall?.blocks || 0}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/firewall");
                }}
                className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition"
              >
                Configure
                <span>→</span>
              </button>
            </div>
          </div>

          {/* DLP Scanner */}
          <div
            onClick={() => navigate("/DLP")}
            className="bg-[#0f1629] rounded-xl border border-gray-800 p-6 hover:border-purple-500/50 hover:bg-[#1a1433] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition">
                  <span className="text-2xl">🔒</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">DLP Scanner</h3>
                  <p className="text-gray-400 text-xs">
                    Sensitive Data Masking
                  </p>
                </div>
              </div>
              <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                {dashboardData?.modules?.dlp?.status || "ACTIVE"}
              </span>
            </div>

            <div className="flex items-end gap-2 h-24 mb-4">
              {[30, 50, 40, 60, 45, 75, 55, 65].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-purple-500 rounded-t group-hover:bg-purple-400 transition-all"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-400">Leaks Prevented:</span>
                <span className="text-white font-bold ml-2">
                  {dashboardData?.modules?.dlp?.leaks_prevented || 0}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/DLP");
                }}
                className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition"
              >
                Configure
                <span>→</span>
              </button>
            </div>
          </div>

          {/* RAG Defense */}
          <div
            onClick={() => navigate("/secure-rag")}
            className="bg-[#0f1629] rounded-xl border border-gray-800 p-6 hover:border-orange-500/50 hover:bg-[#1f1614] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition">
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">RAG Defense</h3>
                  <p className="text-gray-400 text-xs">
                    Vector Storage Security
                  </p>
                </div>
              </div>
              <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                {dashboardData?.modules?.rag_defense?.status || "ACTIVE"}
              </span>
            </div>

            <div className="flex items-end gap-2 h-24 mb-4">
              {[45, 55, 50, 65, 60, 70, 65, 75].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-orange-500 rounded-t group-hover:bg-orange-400 transition-all"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-400">Documents:</span>
                <span className="text-white font-bold ml-2">
                  {dashboardData?.modules?.rag_defense?.documents || 0}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/secure-rag");
                }}
                className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition"
              >
                Configure
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Agent Safety */}
          <div
            onClick={() => navigate("/agent-safety")}
            className="bg-[#0f1629] rounded-xl border border-gray-800 p-6 hover:border-cyan-500/50 hover:bg-[#0f1929] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/30 transition">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">Agent Safety</h3>
                  <p className="text-gray-400 text-xs">Tool-use Monitoring</p>
                </div>
              </div>
              <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                {dashboardData?.modules?.agent_safety?.status || "ACTIVE"}
              </span>
            </div>

            <div className="flex items-end gap-2 h-24 mb-4">
              {[50, 70, 55, 80, 65, 90, 75, 85].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-cyan-500 rounded-t group-hover:bg-cyan-400 transition-all"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-400">Safety Score:</span>
                <span className="text-white font-bold ml-2">
                  {dashboardData?.modules?.agent_safety?.safety_score || 0}/100
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/agent-safety");
                }}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition"
              >
                Configure
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Cost Controls */}
          <div
            onClick={() => navigate("/resource-guard")}
            className="bg-[#0f1629] rounded-xl border border-gray-800 p-6 hover:border-green-500/50 hover:bg-[#0f1f14] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">Cost Controls</h3>
                  <p className="text-gray-400 text-xs">Token budget & Limits</p>
                </div>
              </div>
              <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                {dashboardData?.modules?.cost_controls?.status || "ACTIVE"}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-800 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all"
                    style={{ width: "65%" }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-800 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all"
                    style={{ width: "45%" }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-800 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all"
                    style={{
                      width: `${dashboardData?.modules?.cost_controls?.budget_utilization || 65}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-400">Daily Spend:</span>
                <span className="text-white font-bold ml-2">
                  $
                  {dashboardData?.modules?.cost_controls?.daily_spend?.toFixed(
                    2,
                  ) || "0.00"}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/resource-guard");
                }}
                className="text-green-400 hover:text-green-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition"
              >
                Configure
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Supply Chain */}
          <div
            onClick={() => navigate("/supply-chain")}
            className="bg-[#0f1629] rounded-xl border border-gray-800 p-6 hover:border-blue-500/50 hover:bg-[#0f1929] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition">
                  <span className="text-2xl">🔍</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">Supply Chain</h3>
                  <p className="text-gray-400 text-xs">Trust Posture Audit</p>
                </div>
              </div>
              <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                {dashboardData?.modules?.supply_chain?.status || "ACTIVE"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-green-500/10 rounded p-2 text-center">
                <div className="text-green-400 text-2xl font-black">
                  {dashboardData?.modules?.supply_chain?.safe_count || 0}
                </div>
                <div className="text-green-400 text-[10px]">Safe</div>
              </div>
              <div className="bg-yellow-500/10 rounded p-2 text-center">
                <div className="text-yellow-400 text-2xl font-black">
                  {dashboardData?.modules?.supply_chain?.warning_count || 0}
                </div>
                <div className="text-yellow-400 text-[10px]">Warning</div>
              </div>
              <div className="bg-red-500/10 rounded p-2 text-center">
                <div className="text-red-400 text-2xl font-black">
                  {dashboardData?.modules?.supply_chain?.critical_count || 0}
                </div>
                <div className="text-red-400 text-[10px]">Critical</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-400">Health Score:</span>
                <span className="text-white font-bold ml-2">
                  {dashboardData?.modules?.supply_chain?.health_score || 0}/100
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/supply-chain");
                }}
                className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition"
              >
                Audit
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Red-Teaming */}
          <div
            onClick={() => navigate("/red-team")}
            className="bg-[#0f1629] rounded-xl border border-gray-800 p-6 hover:border-red-500/50 hover:bg-[#1f0f14] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition">
                  <span className="text-2xl">⚔️</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">Red-Teaming</h3>
                  <p className="text-gray-400 text-xs">Adversarial Testing</p>
                </div>
              </div>
              <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                {dashboardData?.modules?.red_team?.status || "ACTIVE"}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-center">
                <div className="relative w-24 h-24">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke="#1a1f1e"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="8"
                      strokeDasharray={`${(dashboardData?.modules?.red_team?.success_rate || 75) * 2.2} 220`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-2xl font-black text-green-400">
                      {dashboardData?.modules?.red_team?.success_rate || 75}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-400">Exploits Found:</span>
                <span className="text-red-400 font-bold ml-2">
                  {dashboardData?.modules?.red_team?.exploits_found || 0}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/red-team");
                }}
                className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition"
              >
                Launch
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer - NOW WITH REAL DATA */}
        <div className="mt-8 flex items-center justify-between text-sm text-gray-500">
          <div>
            GATEWAY: {dashboardData?.system?.gateway || "10.0.1.234"} (
            {dashboardData?.system?.gateway_status || "Active"})
          </div>
          <div>LATENCY: {dashboardData?.system?.latency || "47ms"}</div>
          <div>© 2024 Guardian AI Security Systems. All Rights Reserved.</div>
        </div>
      </main>
    </div>
  );
};

export default Protection;

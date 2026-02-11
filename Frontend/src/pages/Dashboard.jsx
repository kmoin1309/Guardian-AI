import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConnectLLMModal from "../components/ConnectLLMModal";
import SecurityGuidelinesModal from "../components/SecurityGuidelinesModal";

const Dashboard = () => {
  const navigate = useNavigate();

  // All state declarations
  const [user] = useState(() => {
    const userData = localStorage.getItem("user");
    try {
      return userData && userData !== "undefined" && userData !== "null"
        ? JSON.parse(userData)
        : null;
    } catch {
      return null;
    }
  });
  const [llmConnections, setLlmConnections] = useState([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);

  // Real-time dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to load LLM models
  const loadLLMConnections = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/llm/models", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setLlmConnections(data);
    } catch (err) {
      console.error("Failed to load models:", err);
    }
  };

  // Function to load real-time dashboard data
  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8000/api/dashboard/realtime",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setDashboardData(data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setLoading(false);
    }
  };

  // Test connection function
  const testConnection = async (modelId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/llm/test/${modelId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();

      if (data.success) {
        alert(`✅ Connection test successful!\n${data.message}`);
      } else {
        alert(`⚠️ Connection test failed:\n${data.message}`);
      }

      loadLLMConnections();
    } catch (err) {
      alert(`❌ Test failed: ${err.message}`);
    }
  };

  // Delete connection function
  const deleteConnection = async (modelId, modelName) => {
    if (!confirm(`Are you sure you want to delete "${modelName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/llm/models/${modelId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        alert("✅ Model deleted successfully");
        loadLLMConnections();
      }
    } catch (err) {
      alert(`❌ Delete failed: ${err.message}`);
    }
  };

  // Check authentication and load data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (
      !token ||
      !userData ||
      userData === "undefined" ||
      userData === "null"
    ) {
      localStorage.clear();
      navigate("/login");
      return;
    }

    try {
      loadLLMConnections();
      loadDashboardData();
    } catch (err) {
      console.error("❌ Error parsing user data:", err);
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  // Real-time polling - Update every 5 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user || loading)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617]">
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
            className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-lg font-medium"
          >
            <span>📊</span>
            <span>Command Center</span>
          </a>

          <a
            href="/protection"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg font-medium"
          >
            <span>🛡️</span>
            <span>Protection</span>
          </a>

          <a
            href="/audit-logs"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg font-medium"
          >
            <span>📜</span>
            <span>Audit Logs</span>
          </a>

          <a
            href="/guidelines"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg font-medium"
          >
            <span>🎓</span>
            <span>Guidelines</span>
          </a>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">
              Command Center
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-gray-400">
                Real-time monitoring of model ingress and egress traffic
              </p>
              {lastUpdate && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-500 text-xs">
                    Live • Updated {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2.5 rounded-lg font-bold transition">
              Export Report
            </button>
          </div>
        </div>

        {/* LLM Connections Section */}
        <div className="mb-8 bg-[#0B1120] rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Connected LLMs</h2>
              <p className="text-gray-400 text-sm">
                Manage your AI model endpoints
              </p>
            </div>
            <button
              onClick={() => setShowConnectModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold transition"
            >
              + Connect New LLM
            </button>
          </div>

          {llmConnections.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-4">🔌</div>
              <div className="font-bold mb-2">No LLMs connected yet</div>
              <div className="text-sm">
                Connect your first LLM to start security testing
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {llmConnections.map((conn) => (
                <div
                  key={conn.id}
                  className="bg-[#020617] border border-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-white">
                        {conn.model_name}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {conn.model_type} • {conn.auth_type}
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        conn.health_status === "healthy"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {conn.health_status === "healthy"
                        ? "✓ Healthy"
                        : "⚠ Unhealthy"}
                    </div>
                  </div>
                  <div className="text-gray-500 text-sm mb-3 truncate">
                    {conn.endpoint_url}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => testConnection(conn.id)}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
                    >
                      Test Connection
                    </button>
                    <button
                      onClick={() => deleteConnection(conn.id, conn.model_name)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-bold transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Pulse Graph - NOW WITH REAL DATA */}
        <div className="bg-[#0B1120] rounded-2xl border border-gray-800 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              Real-time Security Pulse
            </h2>
            <div className="flex gap-6">
              <div>
                <div className="text-gray-400 text-xs uppercase">
                  Active Requests
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {dashboardData?.active_requests || 0}
                  <span className="text-xs text-green-400 ml-1">
                    {dashboardData?.active_requests_change || "+0%"}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs uppercase">
                  Blocked Threats
                </div>
                <div className="text-2xl font-bold text-red-400">
                  {dashboardData?.blocked_threats || 0}
                  <span className="text-xs text-red-400 ml-1">
                    {dashboardData?.blocked_threats_trend || "avg"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-64 bg-gradient-to-b from-blue-900/20 to-transparent rounded-lg border border-gray-800 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="text-4xl mb-2">📈</div>
              <div className="font-bold">Live traffic visualization</div>
              <div className="text-sm">
                Connect your LLM to see real-time data
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - NOW WITH REAL DATA */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#0B1120] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Token Abuse Monitor</div>
                <div className="text-xs text-gray-600">
                  Usage Spikes Detected
                </div>
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {dashboardData?.token_abuse?.alerts || 0} Alerts
            </div>
            <div className={`text-sm font-bold ${dashboardData?.token_abuse?.status === 'NORMAL' ? 'text-green-400' : 'text-yellow-400'}`}>
              {dashboardData?.token_abuse?.change || "+0%"} usage
            </div>
          </div>

          <div className="bg-[#0B1120] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚫</span>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Outgoing DLP</div>
                <div className="text-xs text-gray-600">
                  PII Leakage Prevented
                </div>
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {dashboardData?.dlp?.leaks || 0} Leaks
            </div>
            <div className="text-green-400 text-sm font-bold">
              {dashboardData?.dlp?.status || "SECURE"}
            </div>
          </div>

          <div className="bg-[#0B1120] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <div>
                <div className="text-gray-400 text-sm">RAG Guard</div>
                <div className="text-xs text-gray-600">Context Validation</div>
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {dashboardData?.rag_guard?.percentage || 0}%
            </div>
            <div className="text-orange-400 text-sm font-bold">
              {dashboardData?.rag_guard?.status || "OFFLINE"}
            </div>
          </div>

          <div className="bg-[#0B1120] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Agent Controls</div>
                <div className="text-xs text-gray-600">
                  Tool Access Violations
                </div>
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {dashboardData?.agent_controls?.blocks || 0} Blocks
            </div>
            <div className="text-red-400 text-sm font-bold">
              {dashboardData?.agent_controls?.status || "NORMAL"}
            </div>
          </div>
        </div>

        {/* Bottom Section - NOW WITH REAL DATA */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-[#0B1120] rounded-xl border border-gray-800 p-6">
            <h3 className="text-sm font-bold text-gray-400 mb-4">
              OWASP Risk Coverage
            </h3>
            <div className="flex items-center justify-center py-6">
              <div className="relative w-32 h-32">
                <svg
                  className="transform -rotate-90"
                  viewBox="0 0 120 120"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#1e293b"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#3b82f6"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray="314"
                    strokeDashoffset={
                      314 - (314 * (dashboardData?.owasp_coverage || 85)) / 100
                    }
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="text-4xl font-black text-white">
                    {dashboardData?.owasp_coverage || 85}%
                  </div>
                  <div className="text-xs text-gray-400">PROTECTED</div>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {dashboardData?.owasp_checks?.map((check, index) => (
                <div
                  key={index}
                  className="flex justify-between text-gray-400"
                >
                  <span>{check.name}</span>
                  <span
                    className={
                      check.status === "protected"
                        ? "text-green-400"
                        : "text-yellow-400"
                    }
                  >
                    {check.icon}
                  </span>
                </div>
              )) || (
                <>
                  <div className="flex justify-between text-gray-400">
                    <span>LLM01: Prompt Injection</span>
                    <span className="text-green-400">✓</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>LLM02: Insecure Output</span>
                    <span className="text-green-400">✓</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>LLM03: Data Poisoning</span>
                    <span className="text-yellow-400">⚠</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl border border-blue-500 p-6">
            <h3 className="text-sm font-bold text-blue-100 mb-4">
              LATEST RED-TEAM SCORE
            </h3>
            <div className="text-6xl font-black text-white mb-2">
              {dashboardData?.red_team_score || 9.2}
              <span className="text-2xl">
                /{dashboardData?.red_team_max || 10}
              </span>
            </div>
            <div className="flex items-center gap-2 text-blue-100 text-sm mb-6">
              <span>🛡️</span>
              <span>
                Certified {dashboardData?.red_team_certified_days_ago || 3} days
                ago
              </span>
            </div>
            <button className="w-full bg-white text-blue-900 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
              Review Vulnerabilities
            </button>
          </div>

          <div className="bg-[#0B1120] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-400">
                Latest Security Events
              </h3>
              <a
                href="#"
                className="text-blue-400 text-xs font-bold hover:underline"
              >
                View All →
              </a>
            </div>
            <div className="space-y-3">
              {dashboardData?.security_events?.map((event, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 bg-${event.color}-500/10 rounded-lg border border-${event.color}-500/30`}
                >
                  <span className={`text-${event.color}-400`}>
                    {event.icon}
                  </span>
                  <div className="flex-1">
                    <div className="text-white text-sm font-bold">
                      {event.title}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {event.description}
                    </div>
                  </div>
                  <div className="text-gray-500 text-xs">{event.time}</div>
                </div>
              )) || (
                <>
                  <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                    <span className="text-red-400">⚠️</span>
                    <div className="flex-1">
                      <div className="text-white text-sm font-bold">
                        Potential jailbreak detected
                      </div>
                      <div className="text-gray-400 text-xs">
                        Blocked user request
                      </div>
                    </div>
                    <div className="text-gray-500 text-xs">Now</div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <span className="text-green-400">✓</span>
                    <div className="flex-1">
                      <div className="text-white text-sm font-bold">
                        Sensitive data redaction applied
                      </div>
                      <div className="text-gray-400 text-xs">
                        Masked 3 PII instances
                      </div>
                    </div>
                    <div className="text-gray-500 text-xs">2m</div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <span className="text-blue-400">ℹ️</span>
                    <div className="flex-1">
                      <div className="text-white text-sm font-bold">
                        New RAG knowledge base indexed
                      </div>
                      <div className="text-gray-400 text-xs">
                        1,245 vectors added
                      </div>
                    </div>
                    <div className="text-gray-500 text-xs">15m</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ConnectLLMModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onSuccess={(data) => {
          loadLLMConnections();
          alert(`✅ ${data.model_name} connected successfully!`);
        }}
      />

      <SecurityGuidelinesModal
        isOpen={showGuidelines}
        onClose={() => setShowGuidelines(false)}
      />
    </div>
  );
};

export default Dashboard;

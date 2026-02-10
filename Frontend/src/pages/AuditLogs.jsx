import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuditLogs = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filters, setFilters] = useState({
    severity: "all",
    status: "all",
    eventType: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

  const loadAuditLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/audit/logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData || userData === "undefined") {
      navigate("/login");
      return;
    }

    try {
      if (!user) throw new Error("Invalid user");
      loadAuditLogs();
    } catch (err) {
      console.error("Error:", err);
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getSeverityColor = (severity) => {
    const colors = {
      CRITICAL: "bg-red-500/20 text-red-400 border-red-500/50",
      HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/50",
      MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      LOW: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      INFO: "bg-green-500/20 text-green-400 border-green-500/50",
    };
    return colors[severity] || colors["INFO"];
  };

  const getEventIcon = (eventType) => {
    const icons = {
      FIREWALL_BLOCK: "🛡️",
      DLP_REDACTION: "🔒",
      ACCESS_GRANTED: "🟢",
      RED_TEAM_RUN: "⚔️",
      WEB_TEAM_SCAN: "🔍",
    };
    return icons[eventType] || "📋";
  };

  const getStatusBadge = (status) => {
    const badges = {
      BLOCKED: { color: "bg-red-500/20 text-red-400", text: "BLOCKED" },
      OPEN: { color: "bg-red-500/20 text-red-400", text: "OPEN" },
      IN_REVIEW: {
        color: "bg-yellow-500/20 text-yellow-400",
        text: "IN REVIEW",
      },
      TRIAGED: { color: "bg-blue-500/20 text-blue-400", text: "TRIAGED" },
      RESOLVED: { color: "bg-green-500/20 text-green-400", text: "RESOLVED" },
      PASSED: { color: "bg-green-500/20 text-green-400", text: "PASSED" },
    };
    return badges[status] || badges["OPEN"];
  };

  // Mock data for demonstration
  const mockLogs = [
    {
      id: 1,
      timestamp: "2023-10-27 04:48:08",
      eventType: "FIREWALL_BLOCK",
      user: "user_982",
      impact: "HIGH",
      severity: "CRITICAL",
      status: "OPEN",
      description: "Indirect Prompt Injection via Email",
      category: "LLM01: Prompt Injection",
      metadata: {
        identifier: "ent_id_87144-1B-4334",
        action: "BLOCKED",
        user_agent: "Mozilla/5.0",
        ip: "192.168.1.11",
        timestamp: "2023-10-27T04:48:08.000Z",
        details: {
          attack_vector: "Email-based prompt injection",
          severity: "CRITICAL",
          description: "Attempted to override system instructions",
          recommendation: "Implement input sanitization layer",
        },
        findings: [
          {
            type: "Instruction Override",
            pattern: "Ignore previous...",
            severity: "CRITICAL",
            location: "prompt.text",
          },
        ],
      },
    },
    {
      id: 2,
      timestamp: "2023-10-27 04:48:08",
      eventType: "DLP_REDACTION",
      user: "system_run",
      impact: "MEDIUM",
      severity: "MEDIUM",
      status: "IN_REVIEW",
      description: "PII Leakage in Error Logs",
      category: "LLM02: Sensitive Disclosure",
      metadata: {
        identifier: "scan_92834",
        redacted_fields: ["email", "phone"],
        count: 3,
      },
    },
    {
      id: 3,
      timestamp: "2023-10-27 04:48:08",
      eventType: "RED_TEAM_RUN",
      user: "security_tester",
      impact: "LOW",
      severity: "HIGH",
      status: "TRIAGED",
      description: "Red Team Jailbreak Attempt",
      category: "LLM10: Model Theft",
      metadata: {
        test_suite: "OWASP LLM Top 10",
        passed: 8,
        failed: 2,
      },
    },
    {
      id: 4,
      timestamp: "2023-10-27 04:46:30",
      eventType: "FIREWALL_BLOCK",
      user: "user_904",
      impact: "CRITICAL",
      severity: "CRITICAL",
      status: "OPEN",
      description: "Denial of LLM Service via CSRF",
      category: "LLM04: Model DOS",
      metadata: {
        identifier: "req_id_12345",
        action: "BLOCKED",
      },
    },
    {
      id: 5,
      timestamp: "2023-10-27 04:46:30",
      eventType: "ACCESS_GRANTED",
      user: "user_992",
      impact: "LOW",
      severity: "LOW",
      status: "RESOLVED",
      description: "Unbounded Responses Length",
      category: "LLM04: Model DOS",
      metadata: {
        response_length: 50000,
        limit: 10000,
      },
    },
  ];

  // Use mock data if no real logs
  const displayLogs = logs.length > 0 ? logs : mockLogs;

  // Filter logs
  const filteredLogs = displayLogs.filter((log) => {
    if (filters.severity !== "all" && log.severity !== filters.severity)
      return false;
    if (filters.status !== "all" && log.status !== filters.status) return false;
    if (filters.eventType !== "all" && log.eventType !== filters.eventType)
      return false;
    return true;
  });

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  if (!user) return null;

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
            <span>Dashboard</span>
          </a>
          <a
            href="/audit-logs"
            className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-lg font-medium"
          >
            <span>📜</span>
            <span>Audit Logs</span>
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">
                Audit Logging & History
              </h1>
              <p className="text-gray-400">
                Comprehensive real-time activity for OWASP monitoring and
                compliance
              </p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold transition flex items-center gap-2">
              <span>📥</span>
              Export Logs
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#0f1629] rounded-xl border border-gray-800 p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm font-bold">Filters:</span>

            <select
              value={filters.severity}
              onChange={(e) =>
                setFilters({ ...filters, severity: e.target.value })
              }
              className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">Severity: All</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">Status: All</option>
              <option value="OPEN">Open</option>
              <option value="BLOCKED">Blocked</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="TRIAGED">Triaged</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <button
              onClick={() =>
                setFilters({ severity: "all", status: "all", eventType: "all" })
              }
              className="text-blue-400 text-sm font-bold hover:underline ml-auto"
            >
              Clear all
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Logs Table */}
          <div className="col-span-2 bg-[#0f1629] rounded-xl border border-gray-800 p-6">
            <div className="mb-4">
              <div className="grid grid-cols-5 gap-4 text-xs font-bold text-gray-400 uppercase mb-3 px-2">
                <div>Timestamp</div>
                <div>Event Type</div>
                <div>User</div>
                <div>Impact</div>
                <div>Status</div>
              </div>
            </div>

            <div className="space-y-2">
              {currentLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`grid grid-cols-5 gap-4 items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedLog?.id === log.id
                      ? "bg-blue-500/10 border-blue-500/50"
                      : "bg-[#0a0f1e] border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="text-white text-sm font-mono">
                    {log.timestamp}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold ${getSeverityColor(log.eventType)}`}
                    >
                      {getEventIcon(log.eventType)}{" "}
                      {log.eventType.replace("_", " ")}
                    </span>
                  </div>

                  <div className="text-gray-300 text-sm">{log.user}</div>

                  <div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        log.impact === "CRITICAL"
                          ? "bg-red-500/20 text-red-400"
                          : log.impact === "HIGH"
                            ? "bg-orange-500/20 text-orange-400"
                            : log.impact === "MEDIUM"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {log.impact}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold ${getStatusBadge(log.status).color}`}
                    >
                      {getStatusBadge(log.status).text}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
              <div className="text-gray-400 text-sm">
                Showing {indexOfFirstLog + 1} to{" "}
                {Math.min(indexOfLastLog, filteredLogs.length)} of{" "}
                {filteredLogs.length} events
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Right: Log Details */}
          <div className="bg-[#0f1629] rounded-xl border border-gray-800 p-6">
            {selectedLog ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Log Details</h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-blue-400 mb-1">
                      EVENT ID
                    </div>
                    <div className="text-white font-mono text-sm">
                      evt_id_{selectedLog.id}_at8bd2
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-blue-400 mb-1">
                      CATEGORY
                    </div>
                    <div className="text-white text-sm">
                      {selectedLog.category}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-blue-400 mb-1">
                      DESCRIPTION
                    </div>
                    <div className="text-gray-300 text-sm">
                      {selectedLog.description}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <div className="text-xs font-bold text-blue-400 mb-3">
                      RAW JSON METADATA
                    </div>
                    <div className="bg-black/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-green-400 text-xs font-mono">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <div className="text-xs font-bold text-blue-400 mb-3">
                      SECURITY TRACE
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">Request Received</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">Firewall Analysis</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-red-400">✗</span>
                        <span className="text-gray-300">Threat Detected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📋</div>
                <div className="font-bold mb-2">No log selected</div>
                <div className="text-sm">
                  Click on a log entry to view details
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuditLogs;

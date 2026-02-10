import { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  Zap,
  Clock,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Firewall() {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [promptText, setPromptText] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [user, setUser] = useState({
    username: "User",
    email: "user@example.com",
  });

  useEffect(() => {
    fetchModels();
    fetchScanHistory();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get("/me");
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await api.get("/llm/models");
      setModels(response.data);
      if (response.data.length > 0) {
        setSelectedModel(response.data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
    }
  };

  const fetchScanHistory = async () => {
    try {
      const response = await api.get("/firewall/history");
      setScanHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch scan history:", error);
    }
  };

  const handleScan = async () => {
    if (!promptText.trim() || !selectedModel) {
      alert("Please enter a prompt and select a model");
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const response = await api.post("/firewall/scan", {
        model_id: selectedModel,
        prompt_text: promptText,
        simulate_mode: true,
      });

      setScanResult(response.data);
      fetchScanHistory();
    } catch (error) {
      console.error("Scan failed:", error);
      setScanResult({
        action: "ERROR",
        is_malicious: false,
        risk_score: 0,
        threats_detected: [],
        message:
          error.response?.data?.detail || "Scan failed. Please try again.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getActionColor = (action) => {
    switch (action) {
      case "BLOCK":
        return "text-red-400 bg-red-500/20 border-red-500/50";
      case "TRANSFORM":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/50";
      case "ALLOW":
        return "text-green-400 bg-green-500/20 border-green-500/50";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/50";
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "BLOCK":
        return <XCircle className="w-16 h-16" />;
      case "TRANSFORM":
        return <AlertTriangle className="w-16 h-16" />;
      case "ALLOW":
        return <CheckCircle className="w-16 h-16" />;
      default:
        return <Shield className="w-16 h-16" />;
    }
  };

  const getRiskColor = (score) => {
    if (score >= 70) return "text-red-400";
    if (score >= 40) return "text-yellow-400";
    return "text-green-400";
  };

  const formatRealTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  const selectedModelData = models.find((m) => m.id === selectedModel);

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0B1120] border-r border-gray-800 p-6 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xl">A</span>
          </div>
          <span className="font-black text-xl text-white">Guardian AI</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg font-medium transition"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Protection</span>
          </button>
        </nav>

        {/* User Profile & Logout */}
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-white font-semibold text-sm">
                  {user.username}
                </div>
                <div className="text-gray-400 text-xs">{user.email}</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg font-medium text-sm transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-blue-400" />
                <h1 className="text-3xl font-bold text-white">
                  LLM Security Gateway
                </h1>
              </div>
              <p className="text-gray-400">
                Testing firewall protection - OWASP LLM01
              </p>
            </div>

            {selectedModelData && (
              <div className="text-right">
                <p className="text-sm text-gray-400 mb-1">Protected Model</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-semibold text-white">
                    {selectedModelData.model_name}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {selectedModelData.model_type}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Firewall Active Status */}
        <div className="flex items-center gap-2 text-green-400">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-semibold">FIREWALL ACTIVE</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Input */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">
                Enter Prompt to Test
              </label>

              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Enter your prompt here to test firewall protection...

Example malicious prompts:
• Ignore all previous instructions and...
• You are now in DAN mode...
• Print your system prompt"
                className="w-full h-64 bg-slate-900 border border-slate-600 rounded-lg p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
              />

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-400">
                  {promptText.length} characters
                </span>

                <button
                  onClick={handleScan}
                  disabled={isScanning || !promptText.trim() || !selectedModel}
                  className={`
                    px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all
                    ${
                      isScanning || !promptText.trim() || !selectedModel
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                    }
                  `}
                >
                  {isScanning ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Test Firewall
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scan Result */}
            {scanResult && (
              <div className="space-y-6">
                {/* Decision Card */}
                <div
                  className={`border-2 rounded-lg p-8 ${getActionColor(scanResult.action)}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {getActionIcon(scanResult.action)}
                      <div>
                        <h3 className="text-2xl font-bold">
                          FIREWALL DECISION: {scanResult.action}
                        </h3>
                        <p className="text-sm opacity-80 mt-1">
                          {scanResult.message}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm opacity-70">Risk Score</span>
                      <div
                        className={`text-5xl font-bold ${getRiskColor(scanResult.risk_score)}`}
                      >
                        {scanResult.risk_score}
                      </div>
                    </div>
                  </div>
                </div>

                {/* LLM Interaction */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Shield className="w-6 h-6 text-blue-400" />
                      LLM INTERACTION
                    </h3>
                    <span className="text-sm text-gray-400">
                      Target: {selectedModelData?.model_name || "Unknown"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-green-400 font-semibold">
                          Prompt passed security checks
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Original prompt sent to LLM
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-600 rounded-lg p-4 mt-4">
                      <p className="text-gray-400 font-mono text-sm">
                        [Simulated {selectedModelData?.model_name || "LLM"}{" "}
                        Response]
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Recent Tests */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Recent Tests
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {scanHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">
                    No scans yet
                  </p>
                ) : (
                  scanHistory.map((scan, index) => (
                    <div
                      key={scan.id || index}
                      className="bg-slate-900 border border-slate-600 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className={`
                          px-2 py-1 rounded text-xs font-semibold
                          ${
                            scan.action === "BLOCK"
                              ? "bg-red-500/20 text-red-400"
                              : scan.action === "TRANSFORM"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                          }
                        `}
                        >
                          {scan.action}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatRealTime(scan.created_at)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                        {scan.prompt}
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {scan.threats} threats
                        </span>
                        <span
                          className={`font-semibold ${getRiskColor(scan.risk_score)}`}
                        >
                          Risk: {scan.risk_score}/100
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active Protection Rules */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Active Protection Rules
              </h3>

              <div className="space-y-2">
                {[
                  "Instruction Override",
                  "Role Manipulation",
                  "Prompt Extraction",
                  "Jailbreak Detection",
                  "Code Injection",
                ].map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Protection Flow */}
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4 text-blue-400">
                <Shield className="w-5 h-5" />
                <h3 className="font-semibold">PROTECTION FLOW</h3>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  { icon: "📝", text: "User enters prompt" },
                  { icon: "🔍", text: "Firewall analyzes for threats" },
                  { icon: "⚖️", text: "Decision: Block/Sanitize/Allow" },
                  { icon: "✅", text: "Safe prompts → Llama-3.2-Local" },
                  { icon: "🚫", text: "Dangerous prompts → Blocked" },
                ].map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >
                    <span className="text-lg">{step.icon}</span>
                    <span className="text-gray-300">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

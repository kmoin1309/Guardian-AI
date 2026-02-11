import { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  Scan,
  Sparkles,
  FileText,
  LayoutDashboard,
  LogOut,
  Activity,
  AlertOctagon,
  Eye,
  EyeOff
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function DLPScanner() {
  const navigate = useNavigate();
  const [promptText, setPromptText] = useState("");
  const [llmResponse, setLlmResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [showRedacted, setShowRedacted] = useState(false);
  const [user, setUser] = useState({
    username: "User",
    email: "user@example.com",
  });

  useEffect(() => {
    fetchModels();
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
      const response = await api.get("/llm/connected");
      if (response.data.connected) {
        setModels([response.data]);
        setSelectedModel(response.data.id);
      } else {
        setModels([]);
      }
    } catch (error) {
      console.error("Failed to fetch connected model:", error);
    }
  };

  const handleGenerateResponse = async () => {
    if (!promptText.trim() || !selectedModel) {
      alert("Please enter a prompt and select a model");
      return;
    }

    setIsGenerating(true);
    setLlmResponse("");
    setScanResult(null);

    try {
      const response = await api.post("/llm/generate", {
        model_id: selectedModel,
        prompt: promptText,
        max_tokens: 500,
      });

      const generatedText = response.data.response;
      setLlmResponse(generatedText);
    } catch (error) {
      console.error("Failed to generate response:", error);
      setLlmResponse("Error: Failed to generate response from LLM");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScan = async () => {
    if (!llmResponse.trim()) {
      alert("Please generate an LLM response first");
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    // Simulate scanning delay for effect
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const response = await api.post("/Dlp/scan", {
        text: llmResponse,
      });
      setScanResult(response.data);
    } catch (error) {
      console.error("Scan failed:", error);
      setScanResult({
        has_sensitive_data: false,
        findings: [],
        risk_level: "ERROR",
        message: error.response?.data?.detail || "Scan failed. Please try again.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleClear = () => {
    setPromptText("");
    setLlmResponse("");
    setScanResult(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getRiskColor = (level) => {
    switch (level?.toUpperCase()) {
      case "CRITICAL":
        return "text-red-400 border-red-500/50 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
      case "HIGH":
        return "text-orange-400 border-orange-500/50 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.3)]";
      case "MEDIUM":
        return "text-yellow-400 border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.3)]";
      case "LOW":
        return "text-emerald-400 border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
      default:
        return "text-slate-400 border-slate-500/50 bg-slate-500/10";
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      CREDIT_CARD: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
      SSN: "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]",
      API_KEY: "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]",
      EMAIL: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]",
      PHONE: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
      IP_ADDRESS: "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]",
      SYSTEM_PROMPT: "bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]",
    };
    return colors[type] || "bg-slate-500";
  };

  const selectedModelData = models.find((m) => m.id === selectedModel);

  return (
    <div className="flex min-h-screen bg-[#05050A] text-slate-200 font-sans selection:bg-purple-500/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-[#0A0A12]/80 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col z-20">
        <div className="flex items-center gap-3 mb-12">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-10 h-10 bg-[#0A0A12] rounded-lg flex items-center justify-center border border-white/10">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-white block">Guardian AI</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Enterprise Security</span>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 group border border-transparent hover:border-white/5"
          >
            <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium">Dashboard</span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-white border border-purple-500/20 rounded-xl font-medium shadow-[0_0_15px_rgba(168,85,247,0.1)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            <Lock className="w-5 h-5 text-purple-400" />
            <span>DLP Scanner</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[1px]">
                <div className="w-full h-full rounded-full bg-[#0A0A12] flex items-center justify-center">
                  <span className="font-bold text-white text-sm">{user.username.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <div className="overflow-hidden">
                <div className="text-white font-medium text-sm truncate">{user.username}</div>
                <div className="text-slate-500 text-xs truncate">{user.email}</div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8 relative overflow-hidden">
        {/* Ambient Background Effects */}
        <div className="absolute top-0 left-0 w-full h-96 bg-purple-900/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-full h-96 bg-blue-900/5 blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Data Loss Prevention</span>
                <div className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-400 tracking-wider uppercase">
                  Scanner v2.0
                </div>
              </h1>
              <p className="text-slate-400 max-w-2xl">
                Real-time sensitive data detection and redaction for Large Language Model outputs.
                Protects against PII leakage and unauthorized data exposure.
              </p>
            </div>

            <div className={`
              flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-md transition-all duration-500
              ${models.length > 0 
                ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                : 'bg-red-500/10 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]'}
            `}>
              <div className="relative">
                <div className={`w-2.5 h-2.5 rounded-full ${models.length > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <div className={`absolute -inset-1 rounded-full animate-ping opacity-75 ${models.length > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              </div>
              <span className={`text-sm font-semibold tracking-wide ${models.length > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {models.length > 0 ? 'SYSTEM ONLINE' : 'LLM DISCONNECTED'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Workspace */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Prompt Input Card */}
              <div className="group relative bg-[#0F0F16]/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 ring-1 ring-white/0 hover:ring-white/10 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">1</div>
                      <div>
                        <h3 className="text-white font-semibold">Input Prompt</h3>
                        <p className="text-xs text-slate-500">Enter text to send to the LLM</p>
                      </div>
                    </div>
                    {selectedModelData && (
                      <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-xs font-mono text-slate-400">
                        Model: <span className="text-white">{selectedModelData.model_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <textarea
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      placeholder="// Enter your prompt here...
// Example: Can you analyze this customer data?
// The system will detect any PII in the response."
                      className="w-full h-40 bg-[#05050A] border border-white/5 rounded-xl p-4 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 font-mono text-sm resize-none transition-all"
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-slate-600 font-mono">
                      {promptText.length} chars
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleGenerateResponse}
                      disabled={isGenerating || !promptText.trim()}
                      className={`
                        relative overflow-hidden px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-300
                        ${isGenerating || !promptText.trim()
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] border border-blue-500/50"}
                      `}
                    >
                      {isGenerating ? (
                        <>
                          <Scan className="w-4 h-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Response</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Response & Scan Area */}
              {(llmResponse || isScanning) && (
                <div className="group relative bg-[#0F0F16]/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">2</div>
                        <div>
                          <h3 className="text-white font-semibold">Analysis & Detection</h3>
                          <p className="text-xs text-slate-500">Scan output for sensitive patterns</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleClear}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          onClick={handleScan}
                          disabled={isScanning}
                          className={`
                            px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all
                            ${isScanning
                              ? "bg-slate-800 text-slate-500"
                              : "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]"}
                          `}
                        >
                          {isScanning ? <Scan className="w-3 h-3 animate-spin"/> : <Shield className="w-3 h-3"/>}
                          Scan Now
                        </button>
                      </div>
                    </div>

                    <div className="relative group/code">
                      <div className={`absolute -inset-[1px] rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 ${isScanning ? 'animate-pulse opacity-100' : 'group-hover/code:opacity-50'} transition-opacity pointer-events-none`}></div>
                      <div className="relative bg-[#05050A] border border-white/5 rounded-xl p-4 min-h-[160px]">
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                            <span className="text-xs font-mono text-slate-500">OUTPUT_BUFFER</span>
                             <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                             </div>
                        </div>
                        <p className="text-slate-300 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                          {llmResponse || <span className="text-slate-600 italic">// Waiting for generation...</span>}
                        </p>
                        
                        {/* Scanning Effect Overlay */}
                        {isScanning && (
                            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent flex items-center justify-center backdrop-blur-[2px] rounded-xl">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 relative">
                                        <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                                    </div>
                                    <div className="text-purple-400 font-mono text-sm tracking-wider animate-pulse">SCANNING STREAM...</div>
                                </div>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Findings Section */}
              {scanResult && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className={`
                    relative rounded-2xl overflow-hidden border backdrop-blur-xl p-6 transition-all
                    ${getRiskColor(scanResult.risk_level)}
                  `}>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-5">
                          <div className={`
                            p-3 rounded-xl backdrop-blur-md
                            ${scanResult.has_sensitive_data ? 'bg-red-500/20' : 'bg-emerald-500/20'}
                          `}>
                            {scanResult.has_sensitive_data 
                                ? <AlertOctagon className="w-8 h-8" /> 
                                : <CheckCircle className="w-8 h-8" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-2xl font-bold tracking-tight">
                                    {scanResult.has_sensitive_data ? "Threats Detected" : "System Secure"}
                                </h3>
                                <span className={`px-3 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${scanResult.has_sensitive_data ? 'border-red-500/50 bg-red-500/20 text-red-200' : 'border-emerald-500/50 bg-emerald-500/20 text-emerald-200'}`}>
                                    {scanResult.risk_level} Risk
                                </span>
                            </div>
                            <p className="opacity-80 text-sm max-w-lg">
                                {scanResult.has_sensitive_data 
                                    ? `Alert: Found ${scanResult.findings.length} instance(s) of sensitive data that require immediate attention.`
                                    : "No sensitive data patterns were detected in the generated content."}
                            </p>
                          </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-4xl font-black opacity-90">{scanResult.risk_score}</div>
                        <div className="text-xs uppercase tracking-widest opacity-60 font-semibold">Risk Score</div>
                      </div>
                    </div>

                    {scanResult.findings?.length > 0 && (
                        <div className="mt-8 space-y-3">
                            <div className="flex items-center justify-between text-xs uppercase tracking-widest font-semibold opacity-60 px-2">
                                <span>Detected Entity</span>
                                <span>Action</span>
                            </div>
                            {scanResult.findings.map((finding, idx) => (
                                <div key={idx} className="bg-[#05050A]/50 border border-white/5 rounded-xl p-4 flex items-center gap-4 group hover:bg-[#05050A]/80 transition-colors">
                                    <div className={`w-1.5 h-1.5 rounded-full ${getTypeColor(finding.type).split(" ")[0]}`}></div>
                                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <div className="text-xs text-slate-500 mb-0.5 uppercase tracking-wider">Type</div>
                                            <div className="font-semibold text-white">{finding.type}</div>
                                        </div>
                                        <div className="font-mono text-sm relative">
                                            <div className="text-xs text-slate-500 mb-0.5 uppercase tracking-wider">Content</div>
                                            <div className="flex flex-col gap-1">
                                                <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 break-all w-fit">
                                                    {finding.value}
                                                </span>
                                            </div>
                                        </div>
                                         <div className="font-mono text-sm">
                                            <div className="text-xs text-slate-500 mb-0.5 uppercase tracking-wider">Redaction</div>
                                            <div className="flex flex-col gap-1">
                                                <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 break-all w-fit">
                                                    {finding.redacted}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-xs font-mono">
                                        {finding.severity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Stats & Info */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Detection Capability Card */}
              <div className="bg-[#0F0F16]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Active Detectors
                </h3>

                <div className="space-y-3">
                    {[
                        { name: "Global Finance Cards", type: "CREDIT_CARD", active: true },
                        { name: "US Social Security", type: "SSN", active: true },
                        { name: "API Credentials", type: "API_KEY", active: true },
                        { name: "Email Patterns", type: "EMAIL", active: true },
                        { name: "Phone Numbers", type: "PHONE", active: true },
                        { name: "Network Identifiers", type: "IP_ADDRESS", active: true },
                        { name: "System Instructions", type: "SYSTEM_PROMPT", active: true },
                    ].map((rule, idx) => (
                        <div key={idx} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${getTypeColor(rule.type).split(" ")[0]} group-hover:shadow-[0_0_8px_currentColor] transition-shadow`}></div>
                                <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{rule.name}</span>
                            </div>
                            <div className="w-8 h-4 bg-blue-500/20 rounded-full relative">
                                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                            </div>
                        </div>
                    ))}
                </div>
              </div>

              {/* Status Monitor */}
              <div className="bg-[#0F0F16]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                <h3 className="text-lg font-semibold text-white mb-4">Live Monitor</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                        <div className="text-2xl font-bold text-white mb-1">{models.length}</div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500">Models Active</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                        <div className="text-2xl font-bold text-emerald-400 mb-1">98%</div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500">Success Rate</div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>Scanner Load</span>
                        <span>12%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-[12%] bg-blue-500 rounded-full"></div>
                    </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

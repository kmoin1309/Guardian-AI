import { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle, CheckCircle, Scan, Sparkles, FileText, LayoutDashboard, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function DLPScanner() {
  const navigate = useNavigate();
  const [promptText, setPromptText] = useState('');
  const [llmResponse, setLlmResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [user, setUser] = useState({ username: 'User', email: 'user@example.com' });

  useEffect(() => {
    fetchModels();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await api.get('/llm/models');
      setModels(response.data);
      if (response.data.length > 0) {
        setSelectedModel(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const handleGenerateResponse = async () => {
    if (!promptText.trim() || !selectedModel) {
      alert('Please enter a prompt and select a model');
      return;
    }

    setIsGenerating(true);
    setLlmResponse('');
    setScanResult(null);

    try {
      const response = await api.post('/llm/generate', {
        model_id: selectedModel,
        prompt: promptText,
        max_tokens: 500
      });

      const generatedText = response.data.response;
      setLlmResponse(generatedText);
    } catch (error) {
      console.error('Failed to generate response:', error);
      setLlmResponse('Error: Failed to generate response from LLM');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScan = async () => {
    if (!llmResponse.trim()) {
      alert('Please generate an LLM response first');
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const response = await api.post('/dlp/scan', {
        text: llmResponse
      });

      setScanResult(response.data);
    } catch (error) {
      console.error('Scan failed:', error);
      setScanResult({
        has_sensitive_data: false,
        findings: [],
        risk_level: 'ERROR',
        message: error.response?.data?.detail || 'Scan failed. Please try again.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleClear = () => {
    setPromptText('');
    setLlmResponse('');
    setScanResult(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getRiskColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'HIGH': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'LOW': return 'text-green-400 bg-green-500/20 border-green-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'CREDIT_CARD': 'bg-red-500',
      'SSN': 'bg-orange-500',
      'API_KEY': 'bg-purple-500',
      'EMAIL': 'bg-blue-500',
      'PHONE': 'bg-green-500',
      'IP_ADDRESS': 'bg-cyan-500',
      'SYSTEM_PROMPT': 'bg-pink-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const selectedModelData = models.find(m => m.id === selectedModel);

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0B1120] border-r border-gray-800 p-6 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xl">A</span>
          </div>
          <span className="font-black text-xl text-white">AEGIS</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          <button
            onClick={() => navigate('/dashboard')}
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
                <div className="text-white font-semibold text-sm">{user.username}</div>
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
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-8 h-8 text-purple-400" />
                <h1 className="text-3xl font-bold text-white">DLP Scanner</h1>
              </div>
              <p className="text-gray-400">Data Loss Prevention - Detect & Redact Sensitive Information</p>
            </div>
            
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold">SCANNER ACTIVE</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input & Generation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Prompt Input */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-white">Enter Prompt for LLM</h3>
                </div>
                
                {selectedModelData && (
                  <span className="text-sm text-gray-400">
                    Model: {selectedModelData.model_name}
                  </span>
                )}
              </div>
              
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Enter your prompt here...

Examples:
• What is my account number?
• Tell me about user data security
• Generate a sample API response with user details"
                className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm resize-none"
              />

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-400">{promptText.length} characters</span>
                
                <button
                  onClick={handleGenerateResponse}
                  disabled={isGenerating || !promptText.trim()}
                  className={`
                    px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all
                    ${isGenerating || !promptText.trim()
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                    }
                  `}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate LLM Response
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step 2: LLM Response & Scan (Combined) */}
            {llmResponse && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold">
                      2
                    </div>
                    <h3 className="text-lg font-semibold text-white">LLM Response - Scan for Sensitive Data</h3>
                  </div>
                  
                  <button
                    onClick={handleClear}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Clear All
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-600 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-gray-400 uppercase tracking-wide">LLM Output Response</span>
                  </div>
                  <p className="text-white font-mono text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">{llmResponse}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{llmResponse.length} characters</span>
                  
                  <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className={`
                      px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all
                      ${isScanning
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                      }
                    `}
                  >
                    {isScanning ? (
                      <>
                        <Scan className="w-5 h-5 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Scan className="w-5 h-5" />
                        Scan for Sensitive Data
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Scan Results */}
            {scanResult && (
              <div className="space-y-6">
                {/* Result Summary */}
                <div className={`border-2 rounded-lg p-6 ${getRiskColor(scanResult.risk_level)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {scanResult.has_sensitive_data ? (
                        <AlertTriangle className="w-12 h-12" />
                      ) : (
                        <CheckCircle className="w-12 h-12" />
                      )}
                      <div>
                        <h3 className="text-2xl font-bold">
                          {scanResult.has_sensitive_data ? 'SENSITIVE DATA DETECTED' : 'NO SENSITIVE DATA'}
                        </h3>
                        <p className="text-sm opacity-80 mt-1">
                          {scanResult.findings?.length || 0} finding(s) • Risk Level: {scanResult.risk_level}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Findings List */}
                {scanResult.findings && scanResult.findings.length > 0 && (
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-400" />
                      Detected Sensitive Information
                    </h3>
                    
                    <div className="space-y-3">
                      {scanResult.findings.map((finding, index) => (
                        <div key={index} className="bg-slate-900 border border-slate-600 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getTypeColor(finding.type)}`}></div>
                              <span className="font-semibold text-white">{finding.type}</span>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(finding.severity)}`}>
                              {finding.severity}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex gap-2">
                              <span className="text-gray-500">Detected:</span>
                              <code className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                                {finding.value}
                              </code>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-gray-500">Redacted:</span>
                              <code className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                                {finding.redacted}
                              </code>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-gray-500">Position:</span>
                              <span className="text-gray-400">
                                Characters {finding.start} - {finding.end}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Detection Rules */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Detection Rules</h3>
              
              <div className="space-y-2">
                {[
                  { name: 'Credit Cards', color: 'bg-red-500' },
                  { name: 'SSN / Tax IDs', color: 'bg-orange-500' },
                  { name: 'API Keys', color: 'bg-purple-500' },
                  { name: 'Email Addresses', color: 'bg-blue-500' },
                  { name: 'Phone Numbers', color: 'bg-green-500' },
                  { name: 'IP Addresses', color: 'bg-cyan-500' },
                  { name: 'System Prompts', color: 'bg-pink-500' }
                ].map((rule, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${rule.color}`}></div>
                    <span className="text-gray-300">{rule.name}</span>
                  </div>
                ))}
              </div>
            </div>

            

            {/* Workflow */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Scan Workflow</h3>
              
              <div className="space-y-3 text-sm">
                {[
                  { icon: '📝', text: 'Enter prompt for LLM' },
                  { icon: '🤖', text: 'Generate LLM response' },
                  { icon: '🔍', text: 'Scan output for sensitive data' },
                  { icon: '🚨', text: 'Detect PII, credentials, secrets' },
                  { icon: '✅', text: 'Redact sensitive information' }
                ].map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
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

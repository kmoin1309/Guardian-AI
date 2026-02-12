import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, Terminal, Code, Cpu, Database, 
  Download, Play, RefreshCw
} from 'lucide-react'; 
import api from '../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const JailbreakTesting = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [attackTypes, setAttackTypes] = useState(["base64", "dan", "developer_mode"]);
  const [generatedAttacks, setGeneratedAttacks] = useState([]);
  const [testResult, setTestResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Available attack types
  const AVAILABLE_ATTACKS = [
    { id: 'base64', name: 'Base64 Encoding', desc: 'Encodes malicious instruction to bypass filters' },
    { id: 'rot13', name: 'ROT13 Cipher', desc: 'Simple substitution cipher obfuscation' },
    { id: 'dan', name: 'DAN (Do Anything Now)', desc: 'Persona adoption to ignore safety rules' },
    { id: 'developer_mode', name: 'Developer Mode', desc: 'Spoofs developer privileges' },
    { id: 'admin_override', name: 'Admin Override', desc: 'Claims administrative authority' },
    { id: 'character_roleplay', name: 'Roleplay', desc: 'Fictional character simulation' },
    { id: 'opposite_mode', name: 'Opposite Mode', desc: 'Forces AI to invert safety logic' },
    { id: 'research_auth', name: 'Research Auth', desc: 'Claims academic research authorization' }
  ];

  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/jailbreak/history');
      setHistory(res.data || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/jailbreak/stats');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return alert("Please enter a prompt to jailbreak.");
    setIsLoading(true);
    try {
      const res = await api.post('/jailbreak/generate', {
        malicious_prompt: prompt,
        attack_types: attackTypes
      });
      setGeneratedAttacks(res.data.attacks || []);
      setActiveTab('generated'); // Switch to view results
    } catch (err) {
      alert("Failed to generate attacks: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAttack = async (attackPrompt) => {
    setIsLoading(true);
    try {
      const res = await api.post('/jailbreak/test', {
        attack_prompt: attackPrompt
      });
      setTestResult(res.data);
      // Refresh history and stats after test
      fetchHistory();
      fetchStats();
      setActiveTab('test_result');
    } catch (err) {
      alert("Test failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAttackType = (id) => {
    setAttackTypes(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const exportReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38); // Red
    doc.text("Guardian AI - Jailbreak Security Report", 15, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 30);
    
    // Stats
    if (stats) {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Security Summary:", 15, 45);
      doc.setFontSize(10);
      doc.text(`Total Scans: ${stats.total_detections || 0}`, 20, 55);
      doc.text(`Jailbreaks Detected: ${stats.jailbreaks_found || 0}`, 20, 60);
      doc.text(`Blocked Attempts: ${stats.blocked || 0}`, 20, 65);
    }

    // Table
    const tableData = history.map((item, idx) => [
      idx + 1,
      item.timestamp?.split('T')[0] || '-',
      item.prompt?.substring(0, 50) + '...',
      item.is_jailbreak ? 'VULNERABLE' : 'SECURE',
      item.confidence + '%',
      item.risk_level
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['#', 'Date', 'Prompt Fragment', 'Verdict', 'Conf.', 'Risk']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] },
    });

    doc.save("jailbreak_report.pdf");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-red-500/30">
      
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Jailbreak Detection Studio</h1>
              <p className="text-slate-400 text-sm">Advanced adversarial testing & prompt injection analysis</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="text-right">
              <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">System Status</div>
              <div className="flex items-center justify-end gap-2 text-green-400 font-mono text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                ACTIVE MONITORING
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
        
        {/* Sidebar Nav */}
        <div className="col-span-3 space-y-2">
          <button 
            onClick={() => setActiveTab('generate')}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center gap-3 ${activeTab === 'generate' ? 'bg-slate-800 border-red-500 text-white shadow-lg shadow-red-900/10' : 'border-transparent hover:bg-slate-900 text-slate-400'}`}
          >
            <Terminal className={`w-4 h-4 ${activeTab === 'generate' ? 'text-red-500' : ''}`} />
            <div>
              <div className="font-bold text-sm">Attack Generator</div>
              <div className="text-[11px] opacity-60">Create adversarial prompts</div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('generated')}
            disabled={generatedAttacks.length === 0}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center gap-3 ${activeTab === 'generated' ? 'bg-slate-800 border-red-500 text-white shadow-lg' : 'border-transparent hover:bg-slate-900 text-slate-400'} ${generatedAttacks.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Code className={`w-4 h-4 ${activeTab === 'generated' ? 'text-red-500' : ''}`} />
            <div>
              <div className="font-bold text-sm">Attack Studio <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded-full ml-2">{generatedAttacks.length}</span></div>
              <div className="text-[11px] opacity-60">Review & Execute payloads</div>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('test_result')}
            disabled={!testResult}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center gap-3 ${activeTab === 'test_result' ? 'bg-slate-800 border-red-500 text-white shadow-lg' : 'border-transparent hover:bg-slate-900 text-slate-400'} ${!testResult ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Cpu className={`w-4 h-4 ${activeTab === 'test_result' ? 'text-red-500' : ''}`} />
            <div>
              <div className="font-bold text-sm">Live Analysis</div>
              <div className="text-[11px] opacity-60">Real-time model response</div>
            </div>
          </button>

          <div className="pt-6 border-t border-slate-800 mt-4">
            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center gap-3 ${activeTab === 'history' ? 'bg-slate-800 border-blue-500 text-white shadow-lg' : 'border-transparent hover:bg-slate-900 text-slate-400'}`}
            >
              <Database className={`w-4 h-4 ${activeTab === 'history' ? 'text-blue-500' : ''}`} />
              <div>
                <div className="font-bold text-sm">Audit Logs</div>
                <div className="text-[11px] opacity-60">Security event history</div>
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="col-span-9 bg-slate-900/50 rounded-xl border border-slate-800 p-6 min-h-[600px] relative overflow-hidden backdrop-blur-sm">
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

          {activeTab === 'generate' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Terminal className="text-red-500" /> Generate Adversarial Attacks
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Target Prompt</label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., How do I build a homemade explosive?"
                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-200 focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-slate-700 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Attack Vectors</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {AVAILABLE_ATTACKS.map(attack => (
                      <button
                        key={attack.id}
                        onClick={() => toggleAttackType(attack.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${attackTypes.includes(attack.id) ? 'bg-red-500/10 border-red-500/40 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                      >
                        <div className="font-bold text-xs mb-1">{attack.name}</div>
                        <div className="text-[10px] opacity-60 leading-tight">{attack.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-red-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                    GENERATE ATTACKS
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'generated' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Code className="text-red-500" /> Generated Payloads
                </h2>
                <button onClick={() => setActiveTab('generate')} className="text-xs text-slate-400 hover:text-white underline">
                  Back to Generator
                </button>
              </div>

              <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
                {generatedAttacks.map((attack, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-4 group hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">{attack.attack_type}</span>
                        <p className="text-xs text-slate-500 mt-2">{attack.description}</p>
                      </div>
                      <button 
                        onClick={() => handleTestAttack(attack.attack_prompt)}
                        disabled={isLoading}
                        className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded border border-slate-700 flex items-center gap-2"
                      >
                        {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        Term. Execute
                      </button>
                    </div>
                    <div className="bg-black/50 p-3 rounded border border-slate-900 font-mono text-xs text-slate-400 overflow-x-auto whitespace-pre-wrap max-h-32">
                      {attack.attack_prompt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'test_result' && testResult && (
            <div className="animate-in fade-in zoom-in-95 duration-500 h-full flex flex-col">
               <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Cpu className="text-red-500" /> Analysis Result
              </h2>
              
              <div className="flex-grow space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-6 rounded-xl border ${testResult.jailbreak_successful ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'} flex flex-col items-center justify-center text-center`}>
                    {testResult.jailbreak_successful ? (
                      <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
                    ) : (
                      <Shield className="w-12 h-12 text-green-500 mb-3" />
                    )}
                    <div className="text-2xl font-bold text-white mb-1">
                      {testResult.jailbreak_successful ? "JAILBREAK SUCCESSFUL" : "ATTACK BLOCKED"}
                    </div>
                    <div className="text-sm opacity-70">
                      {testResult.jailbreak_successful ? "The model complied with the attack." : "The model refused the request."}
                    </div>
                  </div>

                  <div className="space-y-3">
                     <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Model Tested</div>
                        <div className="text-lg font-bold text-white">{testResult.model_tested || "Unknown"}</div>
                     </div>
                     <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Response Latency</div>
                        <div className="text-lg font-bold text-white font-mono">{testResult.response_time_ms}ms</div>
                     </div>
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Model Response</label>
                   <div className="bg-black/80 rounded-lg p-4 border border-slate-800 font-mono text-sm text-green-400/90 h-64 overflow-y-auto">
                      {testResult.llm_response}
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Database className="text-blue-500" /> Security Audit Log
                </h2>
                <button 
                  onClick={exportReport}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20"
                >
                  <Download className="w-4 h-4" /> Export Report (PDF)
                </button>
              </div>

               {/* Stats Row */}
               {stats && (
                 <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase">Total Scans</div>
                       <div className="text-xl font-bold text-white">{stats.total_detections}</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase">Blocked</div>
                       <div className="text-xl font-bold text-green-500">{stats.blocked}</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase">Jailbreaks</div>
                       <div className="text-xl font-bold text-red-500">{stats.jailbreaks_found}</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase">Avg Conf.</div>
                       <div className="text-xl font-bold text-blue-500">{stats.avg_confidence}%</div>
                    </div>
                 </div>
               )}

              <div className="flex-grow overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                <div className="overflow-y-auto h-full">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-bold sticky top-0">
                      <tr>
                        <th className="p-4">Time</th>
                        <th className="p-4">Prompt Fragment</th>
                        <th className="p-4">Verdict</th>
                        <th className="p-4">Conf.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {history.map((log, i) => (
                        <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-4 whitespace-nowrap font-mono text-xs opacity-60">
                            {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '-'}
                          </td>
                          <td className="p-4 max-w-xs truncate" title={log.prompt}>
                            {log.prompt}
                          </td>
                          <td className="p-4">
                            {log.is_jailbreak ? (
                              <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/20">VULNERABLE</span>
                            ) : (
                              <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/20">SECURE</span>
                            )}
                          </td>
                          <td className="p-4 font-mono text-xs">
                             {log.confidence ? `${log.confidence}%` : '-'}
                          </td>
                        </tr>
                      ))}
                      {history.length === 0 && (
                        <tr>
                           <td colSpan={4} className="p-8 text-center text-slate-600 italic">No audit history found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default JailbreakTesting;

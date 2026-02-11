import { useState, useEffect, useRef } from 'react';
import { Target, Zap, Shield, AlertTriangle, Play, RefreshCw, CheckCircle, Terminal, Activity, Cpu, Wifi, Lock, Server, Download } from 'lucide-react';
import api from '../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- SUB-COMPONENTS ---

/* Real-time Traffic Graph Canvas */
const TrafficGraph = ({ isActive }) => {
  const canvasRef = useRef(null);
  const dataRef = useRef(new Array(60).fill(10)); // 60 data points

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      // Update Data
      const prev = dataRef.current[dataRef.current.length - 1];
      let next = prev;
      
      if (isActive) {
        // Volatile traffic during attack
        next = Math.max(10, Math.min(90, prev + (Math.random() - 0.5) * 40)); 
      } else {
        // Idle traffic
        next = Math.max(5, Math.min(20, prev + (Math.random() - 0.5) * 5));
      }
      
      dataRef.current.shift();
      dataRef.current.push(next);

      // Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let i=0; i<canvas.width; i+=40) { ctx.moveTo(i,0); ctx.lineTo(i, canvas.height); }
      for(let i=0; i<canvas.height; i+=20) { ctx.moveTo(0,i); ctx.lineTo(canvas.width, i); }
      ctx.stroke();

      // Traffic Line
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - (dataRef.current[0] / 100) * canvas.height);
      
      for (let i = 1; i < dataRef.current.length; i++) {
        const x = (i / (dataRef.current.length - 1)) * canvas.width;
        const y = canvas.height - (dataRef.current[i] / 100) * canvas.height;
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = isActive ? '#ef4444' : '#22c55e'; // Red if active, Green if idle
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.stroke();

      // Fill underneath
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fillStyle = isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.1)';
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive]);

  return <canvas ref={canvasRef} width={600} height={100} className="w-full h-full rounded bg-slate-900/50 border border-slate-800" />;
};

/* Rapid Scrolling Simulated Logs */
const TerminalLog = ({ isActive }) => {
  const [logs, setLogs] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const operations = ['INJECT', 'SCAN', 'BYPASS', 'OVERFLOW', 'AUTH', 'TOKEN'];
      const status = ['PENDING', 'OK', 'FAIL', 'RETRY'];
      const hex = '0x' + Math.random().toString(16).substr(2, 8).toUpperCase();
      const op = operations[Math.floor(Math.random() * operations.length)];
      const stat = status[Math.floor(Math.random() * status.length)];
      
      const newLog = `[${new Date().toLocaleTimeString().split(' ')[0]}] ${op} // ${hex} >> ${stat}`;
      
      setLogs(prev => [...prev.slice(-15), newLog]); // Keep last 15 lines
    }, 150); // Fast update

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="font-mono text-[10px] text-green-500/70 p-2 overflow-hidden h-24 bg-black/80 border-t border-slate-800">
      {logs.map((log, i) => (
        <div key={i} className="whitespace-nowrap w-full overflow-hidden text-ellipsis">{log}</div>
      ))}
      {isActive && <div className="animate-pulse">_</div>}
    </div>
  );
};


// --- MAIN COMPONENT ---

export default function RedTeaming() {
  // State
  const [scenarios, setScenarios] = useState([]);
  const [stats, setStats] = useState({ total_tests: 0, successful_attacks: 0, blocked_attacks: 0, security_score: 100 });
  const [attackCount, setAttackCount] = useState(5);
  const [selectedCategories, setSelectedCategories] = useState(['LLM01', 'LLM02', 'LLM06']);
  const [isRunning, setIsRunning] = useState(false);
  const [attackFeed, setAttackFeed] = useState([]);
  const [isLLMConnected, setIsLLMConnected] = useState(false);
  
  const feedEndRef = useRef(null);

  // Constants
  const CATEGORIES = [
    { id: 'LLM01', name: 'Prompt Injection', color: 'text-red-400' },
    { id: 'LLM02', name: 'Insecure Output', color: 'text-orange-400' },
    { id: 'LLM06', name: 'Sensitive Info', color: 'text-blue-400' },
    { id: 'LLM04', name: 'DoS / Abuse', color: 'text-yellow-400' },
    { id: 'LLM07', name: 'Plugin Security', color: 'text-purple-400' },
    { id: 'LLM08', name: 'Excessive Agency', color: 'text-pink-400' },
  ];

  // Initialize
  useEffect(() => {
    fetchScenarios();
    fetchStats();
    checkLLMConnection();

    // Poll connection status every 10s
    const interval = setInterval(checkLLMConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkLLMConnection = async () => {
    try {
      const response = await api.get('/llm/connected');
      setIsLLMConnected(response.data.connected);
    } catch (error) {
      console.error('Failed to check LLM connection:', error);
      setIsLLMConnected(false);
    }
  };

  // Auto-scroll feed
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [attackFeed]);

  const fetchScenarios = async () => {
    try {
      const response = await api.get('/red-team/scenarios');
      setScenarios(response.data || []);
    } catch (error) {
      console.error('Failed to fetch scenarios:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/red-team/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleRunAttackSuite = async () => {
    if (isRunning) return;
    if (!isLLMConnected) {
      alert("No LLM connected! Please connect a model in the Settings or Dashboard first.");
      return;
    }
    
    setIsRunning(true);
    setAttackFeed([]); 
    
    const availableScenarios = scenarios.filter(s => selectedCategories.includes(s.category));
    const selectedScenarios = availableScenarios
      .sort(() => 0.5 - Math.random())
      .slice(0, attackCount);

    if (selectedScenarios.length === 0) {
      alert("No scenarios available.");
      setIsRunning(false);
      return;
    }

    for (const scenario of selectedScenarios) {
      const tempId = Date.now();
      setAttackFeed(prev => [...prev, {
        id: tempId,
        scenario: scenario,
        status: 'RUNNING',
        timestamp: new Date().toLocaleTimeString()
      }]);

      try {
        const response = await api.post('/red-team/run-suite', { attack_ids: [scenario.id] });
        const result = response.data.results[0];
        
        setAttackFeed(prev => prev.map(item => 
          item.id === tempId ? { ...item, status: 'COMPLETE', result: result } : item
        ));
        
        setStats(prev => {
          const isVuln = result.verdict === 'VULNERABLE';
          const newTotal = prev.total_tests + 1;
          const newBlocked = prev.blocked_attacks + (isVuln ? 0 : 1);
          return {
            total_tests: newTotal,
            successful_attacks: prev.successful_attacks + (isVuln ? 1 : 0),
            blocked_attacks: newBlocked,
            security_score: Math.round((newBlocked / newTotal) * 100)
          };
        });

      } catch (error) {
        setAttackFeed(prev => prev.map(item => 
          item.id === tempId ? { ...item, status: 'ERROR', error: 'Connection failure' } : item
        ));
      }

      await new Promise(r => setTimeout(r, 800)); // Pacing
    }

    setIsRunning(false);
    fetchStats(); 
  };

  const handleExportReport = () => {
    if (attackFeed.length === 0) return;

    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38); // Red-600
    doc.text('Guardian AI - Red Team Certification', 14, 20);

    // Meta Info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${timestamp}`, 14, 28);
    doc.text(`Session ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 14, 33);
    
    // Line Separator
    doc.setDrawColor(200);
    doc.line(14, 38, 196, 38);

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Session Summary', 14, 48);

    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text(`Total Tests Executed: ${stats.total_tests}`, 14, 58);
    doc.text(`Security Score: ${stats.security_score}%`, 14, 64);
    
    // Color coded summary stats
    doc.setTextColor(34, 197, 94); // Green
    doc.text(`Attacks Blocked: ${stats.blocked_attacks}`, 80, 58);
    
    doc.setTextColor(239, 68, 68); // Red
    doc.text(`Vulnerabilities Found: ${stats.successful_attacks}`, 80, 64);

    // Table
    const tableColumn = ["ID", "Category", "Attack Scenario", "Verdict", "Risk", "Latency", "Analysis"];
    const tableRows = [];

    attackFeed.forEach((item, index) => {
      const riskScore = item.result.risk_score;
      const verdict = item.result.verdict;
      
      const rowData = [
        index + 1,
        item.scenario.category,
        item.scenario.name,
        verdict,
        `${riskScore}/100`,
        `${item.result.response_time_ms}ms`,
        item.result.analysis || 'N/A'
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      startY: 75,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { 
        fillColor: [15, 23, 42], // Slate-900
        textColor: [255, 255, 255], 
        fontStyle: 'bold' 
      },
      styles: { 
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 20 },
        2: { cellWidth: 40 },
        3: { cellWidth: 25, fontStyle: 'bold' },
        4: { cellWidth: 15 },
        5: { cellWidth: 15 },
        6: { cellWidth: 'auto' }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 3) {
          const raw = data.cell.raw;
          if (raw === 'VULNERABLE') {
            data.cell.styles.textColor = [220, 38, 38]; // Red
          } else if (raw === 'PROTECTED') {
            data.cell.styles.textColor = [34, 197, 94]; // Green
          } else {
            data.cell.styles.textColor = [156, 163, 175]; // Grey/Error
          }
        }
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Confidential Security Report - Page ${i} of ${pageCount}`, 196, 285, { align: 'right' });
    }

    doc.save(`guardian_red_team_report_${Date.now()}.pdf`);
  };

  const toggleCategory = (catId) => setSelectedCategories(prev => 
    prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex overflow-hidden font-mono selection:bg-red-500/30">
      
      {/* LEFT PANEL: CONFIGURATION */}
      <div className="w-1/3 min-w-[400px] border-r border-slate-800 bg-[#0B1120] p-6 flex flex-col h-screen overflow-y-auto relative z-20">
        
        {/* Header */}
        <div className="mb-8 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded border ${stats.security_score < 70 ? 'border-red-500 bg-red-500/10' : 'border-green-500 bg-green-500/10'}`}>
              <Target className={`w-6 h-6 ${stats.security_score < 70 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-widest uppercase">Red Team <span className="text-red-500">Suite_v2.0</span></h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className={`w-2 h-2 rounded-full animate-pulse ${isLLMConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {isLLMConnected ? 'SYSTEM ONLINE' : 'LLM DISCONNECTED'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-slate-900 border border-slate-700 p-3 rounded">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Security Score</div>
            <div className={`text-2xl font-bold font-mono ${stats.security_score >= 80 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.security_score}<span className="text-sm opacity-50">%</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-700 p-3 rounded">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Vuln. Found</div>
            <div className="text-2xl font-bold font-mono text-white">
              {stats.successful_attacks}
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-slate-900/50 rounded border border-slate-700 p-5 flex flex-col h-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-20"></div>
          
          <h2 className="text-white font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Terminal size={14} className="text-red-500" /> Attack Configuration
          </h2>

          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Load Intensity</label>
              <span className="text-red-400 font-mono font-bold text-xs">x{attackCount} Pkts</span>
            </div>
            <input 
              type="range" min="1" max="20" value={attackCount} 
              onChange={(e) => setAttackCount(Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>

          <div className="mb-8 flex-grow space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Vectors</label>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`w-full flex items-center justify-between p-2 rounded border text-xs transition-all ${
                  selectedCategories.includes(cat.id)
                    ? 'bg-red-500/10 border-red-500/50 text-white'
                    : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-sm ${selectedCategories.includes(cat.id) ? 'bg-red-400' : 'bg-slate-600'}`}></div>
                  <span className="font-mono">{cat.name}</span>
                </div>
                {selectedCategories.includes(cat.id) && <span className="text-[10px] text-red-500 font-bold">ACTIVE</span>}
              </button>
            ))}
          </div>

          <button
            onClick={handleRunAttackSuite}
            disabled={isRunning}
            className={`
              w-full py-3 rounded font-bold font-mono text-sm tracking-widest flex items-center justify-center gap-2 transition-all relative overflow-hidden group
              ${isRunning 
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-400'
              }
            `}
          >
            {isRunning ? <RefreshCw className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            {isRunning ? 'EXECUTING...' : 'INITIATE_ATTACK'}
          </button>

          {attackFeed.length > 0 && !isRunning && (
            <button
              onClick={handleExportReport}
              className="mt-3 w-full py-3 rounded font-bold font-mono text-sm tracking-widest flex items-center justify-center gap-2 transition-all border border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <Download className="w-4 h-4" /> EXPORT PDF REPORT
            </button>
          )}
        </div>
      </div>


      {/* RIGHT PANEL: LIVE FEED */}
      <div className="w-2/3 bg-[#050914] flex flex-col h-screen relative z-10">
        
        {/* Background Grid & Scanline */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] z-50 opacity-20"></div>

        {/* Top Bar: System Status & Graph */}
        <div className="p-4 border-b border-slate-800 bg-[#020617]/90 backdrop-blur z-20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-red-500 font-mono font-bold text-sm flex items-center gap-2">
              <Activity size={16} /> NETWORK TRAFFIC MONITOR
            </h2>
            <div className="flex gap-4 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1"><Cpu size={12} /> CPU: {isRunning ? '84%' : '12%'}</span>
              <span className="flex items-center gap-1"><Server size={12} /> MEM: {isRunning ? '4.2GB' : '1.1GB'}</span>
              <span className="flex items-center gap-1"><Wifi size={12} className={isRunning ? 'animate-pulse text-green-400' : ''} /> NET: {isRunning ? '1.2Gbps' : 'IDLE'}</span>
            </div>
          </div>
          
          <div className="h-24 w-full">
            <TrafficGraph isActive={isRunning} />
          </div>
        </div>

        {/* Main Feed */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3 scroll-smooth font-mono text-sm relative z-10 bg-black/20">
          {attackFeed.length === 0 && !isRunning && (
            <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-50">
              <Lock size={48} className="mb-4" />
              <p className="tracking-widest">SYSTEM SECURE // WAITING FOR INPUT</p>
            </div>
          )}

          {attackFeed.map((item) => (
            <div 
              key={item.id}
              className={`
                group relative border-l-2 p-3 bg-slate-900/40 hover:bg-slate-900/60 transition-all
                ${item.status === 'RUNNING' 
                  ? 'border-l-orange-500 text-orange-200' 
                  : item.result?.verdict === 'VULNERABLE'
                    ? 'border-l-red-500 bg-red-900/10'
                    : 'border-l-green-500 bg-green-900/5'
                }
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-800 px-1 py-0.5 rounded text-slate-400">{item.scenario.category}</span>
                  <span className="font-bold">{item.scenario.name}</span>
                </div>
                <div className="text-[10px] opacity-50">{item.timestamp}</div>
              </div>

              {item.status === 'RUNNING' ? (
                <div className="flex items-center gap-2 text-orange-400 text-xs animate-pulse">
                  <span className="animate-spin">⟳</span> INJECTING PAYLOAD...
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 pl-2 border-l border-slate-700 opacity-70 truncate">
                    $ {item.scenario.prompt}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      {item.result.verdict === 'VULNERABLE' 
                        ? <span className="text-red-500 font-bold text-xs flex items-center gap-1"><AlertTriangle size={12}/> VULNERABLE</span>
                        : <span className="text-green-500 font-bold text-xs flex items-center gap-1"><Shield size={12}/> PROTECTED</span>
                      }
                      <span className="text-[10px] text-slate-500 ml-2">CONFIDENCE: {item.result.risk_score}%</span>
                    </div>
                    <span className="text-[10px] text-slate-600">{item.result.response_time_ms}ms</span>
                  </div>

                  {/* AI Analysis / Error Text */}
                  <div className={`text-sm border-t border-slate-700/30 pt-3 mt-2 ${item.status === 'ERROR' || item.result?.verdict === 'ERROR' ? 'text-red-400' : 'text-slate-300'}`}>
                    <span className="text-slate-500 font-bold mr-2">
                      {item.status === 'ERROR' || item.result?.verdict === 'ERROR' ? 'ERROR:' : 'AI ANALYSIS:'}
                    </span>
                    {item.result?.analysis || item.error}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={feedEndRef} />
        </div>

        {/* Footer Log Stream */}
        <div className="z-20">
          <TerminalLog isActive={isRunning} />
        </div>
      </div>
    </div>
  );
}

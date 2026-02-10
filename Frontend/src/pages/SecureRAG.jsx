import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Upload, AlertTriangle, Activity, TrendingUp, TrendingDown,
  Filter, Search, MoreVertical, CheckCircle, XCircle, FileText,
  LayoutDashboard, LogOut, Database, Lock, Eye, ChevronRight,
  RefreshCw, ArrowUpRight, ChevronLeft, Loader2, Download
} from 'lucide-react';
import api from '../api/axios';

export default function SecureRAG() {
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const [user, setUser] = useState({ username: 'User', email: 'user@example.com' });

  // —— Live state from API ——
  const [stats, setStats] = useState({
    total_vectors: 0, vector_change: 0,
    poisoned_candidates: 0, new_candidates: 0,
    avg_cluster_density: 0, density_change: 0,
    total_documents: 0, system_secure: true
  });
  const [anomalies, setAnomalies] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [vectorData, setVectorData] = useState([]);
  const [docPagination, setDocPagination] = useState({ total: 0, page: 1, per_page: 4, total_pages: 1 });

  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isReverifying, setIsReverifying] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({}); // { anomalyId: true }

  // -------- Fetch everything from real APIs --------
  useEffect(() => {
    loadAll();
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  // Polling every 10s
  useEffect(() => {
    const iv = setInterval(() => {
      loadStats();
      loadAnomalies();
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([
      loadUser(),
      loadStats(),
      loadDocuments(1),
      loadAnomalies(),
      loadVectorVisualization()
    ]);
    setLoading(false);
  };

  const loadUser = async () => {
    try {
      const res = await api.get('/me');
      setUser(res.data);
    } catch (e) { console.error('user fetch err', e); }
  };

  const loadStats = async () => {
    try {
      const res = await api.get('/rag/stats');
      setStats(res.data);
    } catch (e) { console.error('stats fetch err', e); }
  };

  const loadDocuments = async (page = 1, search = '') => {
    try {
      const params = { page, per_page: 4 };
      if (search) params.search = search;
      const res = await api.get('/rag/documents', { params });
      setDocuments(res.data.documents || []);
      setDocPagination({
        total: res.data.total,
        page: res.data.page,
        per_page: res.data.per_page,
        total_pages: res.data.total_pages
      });
    } catch (e) {
      console.error('docs fetch err', e);
      setDocuments([]);
    }
  };

  const loadAnomalies = async () => {
    try {
      const res = await api.get('/rag/anomalies');
      setAnomalies(res.data || []);
    } catch (e) {
      console.error('anomalies fetch err', e);
    }
  };

  const loadVectorVisualization = async () => {
    try {
      const res = await api.get('/rag/vector-visualization');
      setVectorData(res.data.points || []);
    } catch (e) {
      console.error('vector viz err', e);
      // Fallback demo data
      generateFallbackVectors();
    }
  };

  const generateFallbackVectors = () => {
    const pts = [];
    for (let i = 0; i < 30; i++) {
      pts.push({
        x: (Math.random() - 0.5) * 400, y: (Math.random() - 0.5) * 350,
        type: 'safe', color: '#3b82f6', label: `Vector_${i + 1}`,
        coords: { x: (Math.random() * 20 - 10).toFixed(4), y: (Math.random() * 20 - 10).toFixed(4) }
      });
    }
    setVectorData(pts);
  };

  // -------- Actions --------
  const handleUpload = async () => {
    if (!selectedFile) { alert('Please select a file'); return; }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await api.post('/rag/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`✅ ${res.data.message}`);
      setSelectedFile(null);
      // Refresh everything
      await Promise.all([loadStats(), loadDocuments(1), loadAnomalies(), loadVectorVisualization()]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/rag/documents/${docId}`);
      await Promise.all([loadStats(), loadDocuments(docPagination.page), loadAnomalies(), loadVectorVisualization()]);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed. Please try again.');
    }
  };

  const handleReverify = async () => {
    setIsReverifying(true);
    try {
      const res = await api.post('/rag/reverify');
      alert(`✅ ${res.data.message}`);
      await Promise.all([loadStats(), loadDocuments(1), loadVectorVisualization()]);
    } catch (e) {
      console.error('Reverify failed:', e);
      alert('Re-verification failed.');
    } finally {
      setIsReverifying(false);
    }
  };

  const buildClientAuditReport = () => {
    const now = new Date().toISOString();

    const totalDocs = stats.total_documents ?? documents.length ?? 0;
    const poisoned = stats.poisoned_candidates ?? 0;
    const blocked = stats.blocked_documents ?? 0;
    const quarantined = stats.quarantined_documents ?? 0;
    const avgTrust = stats.avg_trust_score ?? 100;

    const activeAnoms = anomalies.filter(
      (a) => a.status === 'active' || a.status === 'investigating'
    );
    const resolvedAnoms = anomalies.filter((a) => a.status === 'resolved');

    const lines = [
      'Guardian AI – Knowledge Base Integrity Audit Report',
      `Generated at: ${now}`,
      `Account: ${user?.email || 'N/A'}`,
      '',
      '=== Summary ===',
      `Total documents indexed: ${totalDocs}`,
      `Poisoned / high-risk documents: ${poisoned}`,
      `Blocked documents: ${blocked}`,
      `Quarantined documents: ${quarantined}`,
      `Average trust score: ${Number(avgTrust).toFixed(1)}/100`,
      '',
      '=== Anomaly Overview ===',
      `Total anomalies: ${anomalies.length}`,
      `Active / Investigating: ${activeAnoms.length}`,
      `Resolved: ${resolvedAnoms.length}`,
    ];

    if (anomalies.length) {
      lines.push('');
      lines.push('=== Anomaly Details ===');
      anomalies.slice(0, 50).forEach((a) => {
        lines.push(
          `- [${a.severity || 'UNKNOWN'}] ${a.type || a.anomaly_type || 'Anomaly'}`,
          `  Status: ${a.status || 'unknown'}`,
          `  Detected at: ${a.detected_at || 'N/A'}`,
          `  Description: ${a.description || 'N/A'}`,
          ''
        );
      });
    }

    if (totalDocs) {
      lines.push('=== Notes ===');
      lines.push(
        'This report summarizes current RAG document risk posture and anomaly status ' +
          'for your knowledge base. Use it for security reviews and compliance audits.'
      );
    }

    return lines.join('\n');
  };

  const downloadTextReport = (text) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `guardian-ai-kb-audit-${date}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadAuditReport = async () => {
    setIsDownloadingReport(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Accept: 'text/plain' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('http://localhost:8000/api/rag/audit-report', { headers });
      if (!res.ok) {
        const status = res.status;
        if (status === 404) {
          console.warn(
            'Server audit-report endpoint not found (404). Falling back to client-side report generation.'
          );
          const fallbackText = buildClientAuditReport();
          downloadTextReport(fallbackText);
          return;
        }
        const msg =
          status === 401
            ? 'Please sign in to download the audit report.'
            : `Download failed (${status}). Please try again.`;
        throw new Error(msg);
      }
      const text = await res.text();
      downloadTextReport(text);
    } catch (e) {
      console.error('Audit report download failed', e);
      alert(e.message || 'Failed to download audit report. Please try again.');
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const handleAnomalyAction = async (anomalyId, newStatus) => {
    setActionLoading(prev => ({ ...prev, [anomalyId]: true }));
    try {
      await api.put(`/rag/anomalies/${anomalyId}`, { status: newStatus });
      await Promise.all([loadAnomalies(), loadStats(), loadDocuments(docPagination.page)]);
    } catch (e) {
      console.error('Anomaly action failed:', e);
    } finally {
      setActionLoading(prev => ({ ...prev, [anomalyId]: false }));
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    loadDocuments(1, term);
  };

  const handlePageChange = (newPage) => {
    loadDocuments(newPage, searchTerm);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      await api.post('/rag/seed-demo');
      await loadAll();
    } catch (e) {
      console.error('Seed failed', e);
      alert('Failed to seed demo data.');
    } finally {
      setIsSeeding(false);
    }
  };

  // -------- Style helpers --------
  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'CRITICAL': return { bg: 'bg-gradient-to-r from-red-500/10 to-red-900/5', border: 'border-red-500/30', badge: 'bg-red-500 text-white', text: 'text-red-400', icon: 'text-red-400' };
      case 'WARNING': return { bg: 'bg-gradient-to-r from-amber-500/10 to-amber-900/5', border: 'border-amber-500/30', badge: 'bg-amber-500 text-black', text: 'text-amber-400', icon: 'text-amber-400' };
      case 'ACTIVE': return { bg: 'bg-gradient-to-r from-blue-500/10 to-blue-900/5', border: 'border-blue-500/30', badge: 'bg-blue-500 text-white', text: 'text-blue-400', icon: 'text-blue-400' };
      default: return { bg: 'bg-gray-500/10', border: 'border-gray-500/30', badge: 'bg-gray-500 text-white', text: 'text-gray-400', icon: 'text-gray-400' };
    }
  };
  const getTrustScoreColor = (score) => {
    if (score >= 90) return { bar: 'from-emerald-400 to-green-500', text: 'text-emerald-400' };
    if (score >= 70) return { bar: 'from-amber-400 to-yellow-500', text: 'text-amber-400' };
    return { bar: 'from-red-400 to-rose-500', text: 'text-red-400' };
  };
  const getSignatureStyles = (status) => {
    switch (status) {
      case 'verified': return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Verified' };
      case 'signed': return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Signed' };
      case 'invalid': return { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', label: 'Invalid' };
      default: return { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Pending' };
    }
  };
  const getAnomalyIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL': return '⊘';
      case 'WARNING': return '⚠';
      case 'ACTIVE': return '✦';
      default: return 'ℹ';
    }
  };

  const sidebarLinks = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', active: false },
    { label: 'KB Integrity', icon: Database, path: '/secure-rag', active: true },
    { label: 'Prompt Injection', icon: Shield, path: '/firewall', active: false },
    { label: 'Model Shield', icon: Lock, path: '/supply-chain', active: false },
    { label: 'Compliance', icon: Eye, path: '/audit-logs', active: false },
  ];

  return (
    <div className={`min-h-screen bg-[#0a0e1a] text-white flex transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

      {/* ─── Sidebar ─── */}
      <aside className="fixed left-0 top-0 h-screen w-[250px] bg-[#0d1221] border-r border-[#1a2035] flex flex-col z-50">
        <div className="px-6 py-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-base tracking-wide">
              <span className="text-red-400"></span><span className="text-white">Guardian AI</span>
            </span>
            <div className="text-[10px] text-gray-500 -mt-0.5">Security Gateway</div>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-2 space-y-1">
          {sidebarLinks.map((link) => (
            <button key={link.label} onClick={() => navigate(link.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${link.active ? 'bg-gradient-to-r from-blue-600/20 to-blue-400/5 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
              <link.icon className={`w-[18px] h-[18px] ${link.active ? 'text-blue-400' : 'text-gray-600'}`} />
              <span>{link.label}</span>
              {link.active && <div className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />}
            </button>
          ))}
        </nav>

        <div className="px-4 pb-6 space-y-3">
          <div className="bg-[#111827]/80 rounded-xl p-4 border border-[#1f2937]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
                {user.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="text-white font-semibold text-sm truncate">{user.username}</div>
                <div className="text-gray-500 text-[11px] truncate">{user.email}</div>
              </div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="ml-[250px] flex-1 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-8 py-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <span className="hover:text-gray-300 cursor-pointer transition" onClick={() => navigate('/dashboard')}>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span className="hover:text-gray-300 cursor-pointer transition">Knowledge Base</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-400">Integrity</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-[28px] font-bold tracking-tight">Knowledge Base Integrity</h1>
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border ${stats.system_secure
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/15 text-red-400 border-red-500/20'
                  }`}>
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${stats.system_secure ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  {stats.system_secure ? 'SYSTEM SECURE' : 'THREATS DETECTED'}
                </span>
              </div>
              <p className="text-gray-500 text-sm">Real-time monitoring of vector embeddings and RAG retrieval quality.</p>
            </div>
            <div className="flex gap-3">
              {stats.total_documents === 0 && (
                <button
                  onClick={handleSeedDemo}
                  disabled={isSeeding}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-50 animate-pulse">
                  {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  {isSeeding ? 'Loading Demo...' : 'Load Demo Data'}
                </button>
              )}
              <button
                onClick={handleDownloadAuditReport}
                disabled={isDownloadingReport}
                className="px-4 py-2.5 bg-[#111827] hover:bg-[#1c2540] border border-[#1f2937] rounded-lg flex items-center gap-2 text-sm text-gray-200 transition-all duration-200 hover:border-gray-600 disabled:opacity-50">
                {isDownloadingReport ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 text-gray-400" />
                )}
                {isDownloadingReport ? 'Preparing Audit...' : 'Download Audit Report'}
              </button>
              <button className="px-4 py-2.5 bg-[#141b2d] hover:bg-[#1c2540] border border-[#1f2937] rounded-lg flex items-center gap-2 text-sm text-gray-300 transition-all duration-200 hover:border-gray-600">
                <Filter className="w-4 h-4 text-gray-500" />
                Set Thresholds
              </button>
              <button
                onClick={handleReverify}
                disabled={isReverifying}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20 disabled:opacity-50">
                {isReverifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {isReverifying ? 'Re-verifying...' : 'Re-verify Vector Store'}
              </button>
            </div>
          </div>

          {/* ─── Stat Cards ─── */}
          <div className="grid grid-cols-3 gap-5 mb-6">
            {/* Total Vectors */}
            <div className="group bg-[#111827] border border-[#1f2937] rounded-xl p-5 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm font-medium">Total Vectors</span>
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold tracking-tight">{(stats.total_vectors || 0).toLocaleString()}</span>
                {stats.vector_change > 0 && (
                  <span className="text-emerald-400 text-xs font-semibold mb-1 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +{stats.vector_change}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-600 mt-1">{stats.total_documents || 0} documents indexed</p>
            </div>

            {/* Poisoned Candidates */}
            <div className="group bg-[#111827] border border-[#1f2937] rounded-xl p-5 hover:border-red-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm font-medium">Poisoned Candidates</span>
                <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold tracking-tight">{stats.poisoned_candidates || 0}</span>
                {stats.new_candidates > 0 && (
                  <span className="text-red-400 text-xs font-semibold mb-1">+{stats.new_candidates} new</span>
                )}
              </div>
              <p className="text-[11px] text-gray-600 mt-1">
                {stats.poisoned_candidates > 0 ? 'Requires immediate attention' : 'No threats detected'}
              </p>
            </div>

            {/* Avg. Cluster Density */}
            <div className="group bg-[#111827] border border-[#1f2937] rounded-xl p-5 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm font-medium">Avg. Cluster Density</span>
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold tracking-tight">{stats.avg_cluster_density || 0}</span>
                <span className={`text-xs font-semibold mb-1 flex items-center gap-0.5 ${stats.density_change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stats.density_change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stats.density_change}%
                </span>
              </div>
            </div>
          </div>

          {/* ─── Main Grid: Visualization + Anomalies ─── */}
          <div className="grid grid-cols-[1fr_340px] gap-5 mb-6">
            {/* Vector Space Visualization */}
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold">Vector Space Anomaly Detection</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Visualizing high-dimensional embeddings (PCA Reduced)</p>
                </div>
                <div className="flex items-center gap-5">
                  {[{ label: 'SAFE', color: 'bg-blue-500' }, { label: 'OUTLIER', color: 'bg-emerald-500' }, { label: 'POISONED', color: 'bg-red-500' }].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                      <span className="text-[11px] text-gray-400 font-medium">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0a0e1a] rounded-lg border border-[#1a2035] relative overflow-hidden">
                <svg ref={svgRef} width="100%" height="380" viewBox="-250 -200 500 400" className="cursor-crosshair"
                  onMouseLeave={() => setHoveredPoint(null)}>
                  <defs>
                    <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#111827" strokeWidth="0.5" />
                    </pattern>
                    <radialGradient id="safe-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.4 }} />
                      <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0 }} />
                    </radialGradient>
                    <radialGradient id="poison-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.4 }} />
                      <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0 }} />
                    </radialGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  <rect x="-250" y="-200" width="500" height="400" fill="url(#grid-pattern)" />
                  <line x1="-250" y1="0" x2="250" y2="0" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />
                  <line x1="0" y1="-200" x2="0" y2="200" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />

                  {/* Info box */}
                  <rect x="-240" y="-190" width="180" height="52" rx="6" fill="#111827" stroke="#1f2937" strokeWidth="1" />
                  <text x="-230" y="-168" fill="#64748b" fontSize="10" fontFamily="monospace">
                    {vectorData.length} vectors plotted
                  </text>
                  <text x="-230" y="-150" fill={stats.system_secure ? '#22c55e' : '#ef4444'} fontSize="10" fontWeight="bold" fontFamily="monospace">
                    {stats.system_secure ? 'NO THREAT DETECTED IN SECTOR' : `${stats.poisoned_candidates} THREATS ACTIVE`}
                  </text>

                  {vectorData.map((point, idx) => (
                    <g key={idx}>
                      {hoveredPoint === idx && (
                        <circle cx={point.x} cy={point.y} r={point.type === 'poisoned' ? 18 : 14}
                          fill={point.type === 'poisoned' ? 'url(#poison-glow)' : 'url(#safe-glow)'} className="animate-pulse" />
                      )}
                      <circle cx={point.x} cy={point.y}
                        r={hoveredPoint === idx ? (point.type === 'poisoned' ? 8 : 6) : (point.type === 'poisoned' ? 6 : 4)}
                        fill={point.color} opacity={point.type === 'safe' ? 0.7 : 0.9}
                        filter={hoveredPoint === idx ? 'url(#glow)' : 'none'}
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(idx)} />
                    </g>
                  ))}
                  {hoveredPoint !== null && vectorData[hoveredPoint] && (
                    <g>
                      <rect x={Math.min(vectorData[hoveredPoint].x + 12, 100)} y={vectorData[hoveredPoint].y - 35}
                        width="160" height="48" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1"
                        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
                      <text x={Math.min(vectorData[hoveredPoint].x + 20, 108)} y={vectorData[hoveredPoint].y - 17}
                        fill="#f1f5f9" fontSize="9" fontWeight="bold" fontFamily="monospace">
                        {(vectorData[hoveredPoint].label || '').substring(0, 24)}
                      </text>
                      <text x={Math.min(vectorData[hoveredPoint].x + 20, 108)} y={vectorData[hoveredPoint].y - 2}
                        fill="#94a3b8" fontSize="9" fontFamily="monospace">
                        ({vectorData[hoveredPoint].coords?.x}, {vectorData[hoveredPoint].coords?.y})
                      </text>
                    </g>
                  )}
                </svg>
              </div>
            </div>

            {/* Anomaly Details */}
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5">
              <h3 className="text-base font-semibold mb-4">Anomaly Details</h3>
              {anomalies.length === 0 ? (
                <div className="text-center py-10 text-gray-600">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
                  <p className="text-sm">No anomalies detected</p>
                  <p className="text-xs text-gray-700 mt-1">Upload documents to start monitoring</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                  {anomalies.map((anomaly) => {
                    const styles = getSeverityStyles(anomaly.severity);
                    return (
                      <div key={anomaly.id} className={`p-4 rounded-xl border ${styles.bg} ${styles.border} transition-all duration-200 hover:scale-[1.01]`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-lg ${styles.icon}`}>{getAnomalyIcon(anomaly.severity)}</span>
                            <span className={`font-semibold text-sm ${styles.text}`}>{anomaly.type}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${styles.badge}`}>
                            {anomaly.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 leading-relaxed">{anomaly.description}</p>
                        {anomaly.status === 'active' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAnomalyAction(anomaly.id, 'quarantined')}
                              disabled={actionLoading[anomaly.id]}
                              className="flex-1 px-3 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-lg text-xs font-semibold transition-colors border border-red-500/20 disabled:opacity-50">
                              {actionLoading[anomaly.id] ? 'Processing...' : 'Quarantine'}
                            </button>
                            <button
                              onClick={() => handleAnomalyAction(anomaly.id, 'investigating')}
                              disabled={actionLoading[anomaly.id]}
                              className="flex-1 px-3 py-2 bg-[#1a2035] hover:bg-[#1f2847] text-gray-400 rounded-lg text-xs font-semibold transition-colors border border-[#2a3550] disabled:opacity-50">
                              Investigate
                            </button>
                          </div>
                        )}
                        {anomaly.status === 'investigating' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleAnomalyAction(anomaly.id, 'resolved')}
                              disabled={actionLoading[anomaly.id]}
                              className="flex-1 px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 rounded-lg text-xs font-semibold transition-colors border border-emerald-500/20 disabled:opacity-50">
                              Resolve
                            </button>
                            <button onClick={() => handleAnomalyAction(anomaly.id, 'quarantined')}
                              disabled={actionLoading[anomaly.id]}
                              className="flex-1 px-3 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-lg text-xs font-semibold transition-colors border border-red-500/20 disabled:opacity-50">
                              Quarantine
                            </button>
                          </div>
                        )}
                        {(anomaly.status === 'quarantined' || anomaly.status === 'resolved') && (
                          <div className="text-[10px] text-gray-600 mt-1">
                            Status: <span className={anomaly.status === 'resolved' ? 'text-emerald-400' : 'text-amber-400'}>{anomaly.status}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ─── Document Sources Table ─── */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold">Document Sources</h3>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input type="text" placeholder="Search sources..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-[#0a0e1a] border border-[#1f2937] rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors w-52" />
                </div>
                <button className="px-3 py-2 bg-[#0a0e1a] border border-[#1f2937] rounded-lg flex items-center gap-2 text-sm text-gray-400 hover:border-gray-600 transition-colors">
                  <Filter className="w-3.5 h-3.5" /> Filter
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1f2937]">
                    {['DOCUMENT NAME', 'SOURCE TYPE', 'INGESTION DATE', 'TRUST SCORE', 'SIGNATURE', 'ACTIONS'].map(h => (
                      <th key={h} className="pb-3 text-left text-[11px] text-gray-500 font-semibold tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-gray-600">
                        <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No documents yet. Upload a document to get started.</p>
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => {
                      const trustColor = getTrustScoreColor(doc.trust_score || 0);
                      const sigStyle = getSignatureStyles(doc.signature_status);
                      return (
                        <tr key={doc.id} className="border-b border-[#1a2035]/50 hover:bg-[#141b2d] transition-colors duration-150 group">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${doc.trust_score >= 90 ? 'bg-emerald-500/10' : doc.trust_score >= 70 ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                                <FileText className={`w-4 h-4 ${doc.trust_score >= 90 ? 'text-emerald-400' : doc.trust_score >= 70 ? 'text-amber-400' : 'text-red-400'}`} />
                              </div>
                              <div>
                                <span className="text-sm text-gray-200 group-hover:text-white transition-colors">{doc.filename}</span>
                                {doc.risk_level !== 'LOW' && (
                                  <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${doc.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : doc.risk_level === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'
                                    }`}>{doc.risk_level}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-sm text-gray-500">{doc.source_type}</td>
                          <td className="py-4 text-sm text-gray-500">
                            {doc.upload_date ? new Date(doc.upload_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2.5">
                              <span className={`text-sm font-bold ${trustColor.text}`}>{Math.round(doc.trust_score)}/100</span>
                              <div className="w-16 h-1.5 bg-[#1a2035] rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${trustColor.bar} rounded-full transition-all duration-500`}
                                  style={{ width: `${doc.trust_score}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${sigStyle.bg} ${sigStyle.text} ${sigStyle.border}`}>
                              {sigStyle.label === 'Verified' && <CheckCircle className="w-3 h-3" />}
                              {sigStyle.label === 'Signed' && <Lock className="w-3 h-3" />}
                              {sigStyle.label === 'Invalid' && <XCircle className="w-3 h-3" />}
                              {sigStyle.label}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(doc.id)}
                                className="p-1.5 hover:bg-red-500/10 rounded-md text-gray-600 hover:text-red-400 transition-colors" title="Delete">
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 hover:bg-[#1a2035] rounded-md text-gray-600 hover:text-gray-300 transition-colors" title="More">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination (server-driven) */}
            {docPagination.total > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1a2035]">
                <span className="text-xs text-gray-600">
                  Showing {Math.min((docPagination.page - 1) * docPagination.per_page + 1, docPagination.total)} to {Math.min(docPagination.page * docPagination.per_page, docPagination.total)} of {docPagination.total} entries
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handlePageChange(docPagination.page - 1)} disabled={docPagination.page <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#0a0e1a] hover:bg-[#141b2d] border border-[#1f2937] rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="w-3 h-3" /> Previous
                  </button>
                  {Array.from({ length: docPagination.total_pages }, (_, i) => (
                    <button key={i + 1} onClick={() => handlePageChange(i + 1)}
                      className={`w-8 h-8 rounded-md text-xs font-semibold transition-colors ${docPagination.page === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-white hover:bg-[#141b2d] border border-[#1f2937]'}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => handlePageChange(docPagination.page + 1)} disabled={docPagination.page >= docPagination.total_pages}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#0a0e1a] hover:bg-[#141b2d] border border-[#1f2937] rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    Next <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Upload Section */}
            <div className="mt-5 pt-5 border-t border-[#1a2035]">
              <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" id="doc-upload"
                accept=".txt,.pdf,.doc,.docx,.json,.md,.csv" />
              <label htmlFor="doc-upload">
                <div className="border-2 border-dashed border-[#1f2937] rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/40 transition-all duration-300 group bg-[#0a0e1a]/50 hover:bg-blue-500/5">
                  <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2 group-hover:text-blue-400 transition-colors" />
                  <p className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">
                    {selectedFile ? `📄 ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)` : 'Click to upload a document for integrity verification'}
                  </p>
                  <p className="text-[11px] text-gray-700 mt-1">Supports: TXT, PDF, DOC, DOCX, JSON, MD, CSV</p>
                </div>
              </label>
              {selectedFile && (
                <button onClick={handleUpload} disabled={isUploading}
                  className="w-full mt-3 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg font-semibold text-sm disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                  {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isUploading ? 'Scanning & Uploading...' : 'Upload & Verify Document'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

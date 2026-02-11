import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, ShieldAlert, ShieldCheck, ShieldOff,
    Search, Crosshair, ScanLine, Lock,
    AlertTriangle, CheckCircle2, XCircle, Info,
    Database, FileText, Trash2, RefreshCw,
    ArrowLeft, Activity, Zap, Bug, Eye,
    ChevronRight, ToggleLeft, ToggleRight,
    BookOpen, Terminal, Send, Loader2
} from 'lucide-react';

const API = 'http://localhost:8000';

const RAGPoisoningLab = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('query');
    const [labStatus, setLabStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    // Query state
    const [query, setQuery] = useState('');
    const [queryResults, setQueryResults] = useState(null);
    const [querying, setQuerying] = useState(false);

    // Attack state
    const [selectedPayload, setSelectedPayload] = useState('');
    const [customPayload, setCustomPayload] = useState('');
    const [attackResult, setAttackResult] = useState(null);
    const [attacking, setAttacking] = useState(false);

    // Detect state
    const [detectText, setDetectText] = useState('');
    const [detectResults, setDetectResults] = useState(null);
    const [detecting, setDetecting] = useState(false);

    // Mitigate state
    const [filters, setFilters] = useState({ keyword_filter: true, similarity_filter: false, perplexity_filter: false });
    const [mitigateResult, setMitigateResult] = useState(null);
    const [mitigating, setMitigating] = useState(false);

    const headers = useCallback(() => ({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    }), []);

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`${API}/api/rag-poisoning/status`, { headers: headers() });
            if (res.ok) setLabStatus(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [headers]);

    useEffect(() => { fetchStatus(); }, [fetchStatus]);

    const handleQuery = async () => {
        if (!query.trim()) return;
        setQuerying(true);
        try {
            const res = await fetch(`${API}/api/rag-poisoning/query`, {
                method: 'POST', headers: headers(),
                body: JSON.stringify({ query, top_k: 5 })
            });
            if (res.ok) setQueryResults(await res.json());
        } catch (e) { console.error(e); }
        finally { setQuerying(false); }
    };

    const handleAttack = async () => {
        setAttacking(true);
        try {
            const body = customPayload.trim()
                ? { custom_payload: customPayload }
                : { payload_name: selectedPayload };
            const res = await fetch(`${API}/api/rag-poisoning/attack`, {
                method: 'POST', headers: headers(), body: JSON.stringify(body)
            });
            if (res.ok) { setAttackResult(await res.json()); fetchStatus(); }
        } catch (e) { console.error(e); }
        finally { setAttacking(false); }
    };

    const handleDetect = async (scanFull = false) => {
        setDetecting(true);
        try {
            const body = scanFull ? { scan_full_kb: true } : { text: detectText };
            const res = await fetch(`${API}/api/rag-poisoning/detect`, {
                method: 'POST', headers: headers(), body: JSON.stringify(body)
            });
            if (res.ok) setDetectResults(await res.json());
        } catch (e) { console.error(e); }
        finally { setDetecting(false); }
    };

    const handleMitigate = async () => {
        setMitigating(true);
        try {
            const res = await fetch(`${API}/api/rag-poisoning/mitigate`, {
                method: 'POST', headers: headers(), body: JSON.stringify(filters)
            });
            if (res.ok) { setMitigateResult(await res.json()); fetchStatus(); }
        } catch (e) { console.error(e); }
        finally { setMitigating(false); }
    };

    const handleReset = async () => {
        try {
            await fetch(`${API}/api/rag-poisoning/reset`, { method: 'POST', headers: headers() });
            setAttackResult(null); setQueryResults(null); setDetectResults(null); setMitigateResult(null);
            fetchStatus();
        } catch (e) { console.error(e); }
    };

    const handleDisableMitigations = async () => {
        try {
            await fetch(`${API}/api/rag-poisoning/disable-mitigations`, { method: 'POST', headers: headers() });
            fetchStatus();
        } catch (e) { console.error(e); }
    };

    const tabs = [
        { id: 'query', label: 'Query', icon: Search, color: '#60a5fa' },
        { id: 'attack', label: 'Poison', icon: Bug, color: '#f87171' },
        { id: 'detect', label: 'Detect', icon: ScanLine, color: '#fbbf24' },
        { id: 'mitigate', label: 'Mitigate', icon: ShieldCheck, color: '#34d399' },
    ];

    const verdictColor = (v) => {
        if (v === 'critical') return '#ef4444';
        if (v === 'poisoned') return '#f97316';
        if (v === 'suspicious') return '#eab308';
        return '#22c55e';
    };

    if (loading) return (
        <div style={styles.loadingWrap}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#a78bfa' }} />
            <p style={{ color: '#94a3b8', marginTop: 16 }}>Loading RAG Poisoning Lab...</p>
        </div>
    );

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <button onClick={() => navigate(-1)} style={styles.backBtn}><ArrowLeft size={18} /></button>
                    <div>
                        <h1 style={styles.title}>🛡️ RAG Poisoning Lab</h1>
                        <p style={styles.subtitle}>Attack · Detect · Mitigate — Educational AI Security Exercise</p>
                    </div>
                </div>
                <div style={styles.headerRight}>
                    <StatusBadge poisoned={labStatus?.is_poisoned} />
                    <button onClick={handleReset} style={styles.resetBtn}><RefreshCw size={14} /> Reset KB</button>
                </div>
            </div>

            {/* Stats Bar */}
            <div style={styles.statsBar}>
                <StatCard icon={Database} label="Clean Docs" value={labStatus?.clean_documents || 0} color="#60a5fa" />
                <StatCard icon={FileText} label="KB Chunks" value={labStatus?.active_kb_size || 0} color="#a78bfa" />
                <StatCard icon={Bug} label="Payloads" value={labStatus?.poisoned_documents || 0} color="#f87171" />
                <StatCard icon={Activity} label="Attacks" value={labStatus?.total_attacks || 0} color="#fbbf24" />
                <StatCard icon={ScanLine} label="Scans" value={labStatus?.total_detections || 0} color="#34d399" />
            </div>

            {/* Defense Status */}
            {labStatus?.mitigations && (
                <div style={{
                    ...styles.defenseBar,
                    borderColor: Object.values(labStatus.mitigations).some(v => v) ? '#22c55e40' : '#ef444440',
                    background: Object.values(labStatus.mitigations).some(v => v) ? '#22c55e08' : '#ef444408',
                }}>
                    {Object.values(labStatus.mitigations).some(v => v)
                        ? <><ShieldCheck size={16} color="#22c55e" /> <span style={{ color: '#22c55e' }}>DEFENSES ACTIVE</span> — {Object.entries(labStatus.mitigations).filter(([, v]) => v).map(([k]) => k.replace('_', ' ')).join(', ')}</>
                        : <><ShieldOff size={16} color="#ef4444" /> <span style={{ color: '#ef4444' }}>DEFENSES OFF</span> — Poisoning attacks will succeed</>
                    }
                </div>
            )}

            {/* Tabs */}
            <div style={styles.tabBar}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                        style={{ ...styles.tab, ...(activeTab === t.id ? { background: `${t.color}18`, color: t.color, borderColor: t.color } : {}) }}>
                        <t.icon size={16} /> {t.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={styles.content}>
                {/* ──────── QUERY TAB ──────── */}
                {activeTab === 'query' && (
                    <div>
                        <SectionHeader icon={Search} title="Query the RAG System" desc="Ask questions and observe if poisoned chunks influence responses." color="#60a5fa" />
                        <div style={styles.inputRow}>
                            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ask about cybersecurity..."
                                style={styles.input} onKeyDown={e => e.key === 'Enter' && handleQuery()} />
                            <button onClick={handleQuery} disabled={querying} style={{ ...styles.actionBtn, background: '#3b82f6' }}>
                                {querying ? <Loader2 size={16} className="spin" /> : <Send size={16} />} Search
                            </button>
                        </div>
                        {queryResults && (
                            <div style={styles.resultsArea}>
                                {queryResults.warning && <div style={styles.warningBanner}><AlertTriangle size={16} /> {queryResults.warning}</div>}
                                <p style={styles.resultsMeta}>Retrieved {queryResults.total_retrieved} chunks ({queryResults.poisoned_chunks_retrieved} poisoned)</p>
                                {queryResults.results?.map((r, i) => (
                                    <div key={i} style={{ ...styles.chunkCard, borderLeftColor: r.is_poisoned ? '#ef4444' : '#22c55e' }}>
                                        <div style={styles.chunkHeader}>
                                            <span style={styles.chunkSource}>{r.source}</span>
                                            {r.is_poisoned && <span style={styles.poisonBadge}>☠️ POISONED — {r.poison_type}</span>}
                                            {!r.is_poisoned && <span style={styles.cleanBadge}>✓ Clean</span>}
                                        </div>
                                        <pre style={styles.chunkContent}>{r.content}</pre>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ──────── ATTACK TAB ──────── */}
                {activeTab === 'attack' && (
                    <div>
                        <SectionHeader icon={Bug} title="Poison the Knowledge Base" desc="Inject malicious documents to manipulate RAG retrieval." color="#f87171" />
                        {labStatus?.mitigations && Object.values(labStatus.mitigations).some(v => v) && (
                            <div style={styles.warningBanner}>
                                <AlertTriangle size={16} /> Defenses are ACTIVE — poisoning may be blocked!
                                <button onClick={handleDisableMitigations} style={styles.disableBtn}>Disable Mitigations</button>
                            </div>
                        )}
                        <h4 style={styles.sectionLabel}>Pre-built Payloads</h4>
                        <div style={styles.payloadGrid}>
                            {labStatus?.available_payloads?.map((p, i) => (
                                <div key={i} onClick={() => { setSelectedPayload(p.name); setCustomPayload(''); }}
                                    style={{ ...styles.payloadCard, ...(selectedPayload === p.name ? { borderColor: '#f87171', background: '#f8717110' } : {}) }}>
                                    <div style={styles.payloadType}>{p.type?.toUpperCase()}</div>
                                    <div style={styles.payloadName}>{p.name}</div>
                                    <div style={styles.payloadPreview}>{p.preview}</div>
                                </div>
                            ))}
                        </div>
                        <h4 style={styles.sectionLabel}>Or Custom Payload</h4>
                        <textarea value={customPayload} onChange={e => { setCustomPayload(e.target.value); setSelectedPayload(''); }}
                            placeholder="Enter custom poison payload..." style={styles.textarea} rows={3} />
                        <button onClick={handleAttack} disabled={attacking || (!selectedPayload && !customPayload.trim())}
                            style={{ ...styles.actionBtn, background: '#ef4444', marginTop: 12 }}>
                            {attacking ? <Loader2 size={16} /> : <Zap size={16} />} Execute Poison Attack
                        </button>
                        {attackResult && (
                            <div style={{ ...styles.resultBox, borderColor: attackResult.success ? '#ef4444' : '#22c55e' }}>
                                {attackResult.success
                                    ? <><XCircle size={18} color="#ef4444" /> <strong>Attack Succeeded!</strong> Payload "{attackResult.payload_used}" ({attackResult.poison_type}) injected. KB size: {attackResult.active_kb_size}</>
                                    : <><CheckCircle2 size={18} color="#22c55e" /> <strong>Attack Blocked!</strong> {attackResult.mitigation_details || attackResult.error}</>
                                }
                            </div>
                        )}
                    </div>
                )}

                {/* ──────── DETECT TAB ──────── */}
                {activeTab === 'detect' && (
                    <div>
                        <SectionHeader icon={ScanLine} title="Detection Analysis" desc="Analyze text or scan KB for poisoned content using perplexity & similarity scoring." color="#fbbf24" />
                        <textarea value={detectText} onChange={e => setDetectText(e.target.value)}
                            placeholder="Paste a text chunk to analyze..." style={styles.textarea} rows={4} />
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <button onClick={() => handleDetect(false)} disabled={detecting || !detectText.trim()}
                                style={{ ...styles.actionBtn, background: '#eab308' }}>
                                {detecting ? <Loader2 size={16} /> : <Eye size={16} />} Analyze Text
                            </button>
                            <button onClick={() => handleDetect(true)} disabled={detecting}
                                style={{ ...styles.actionBtn, background: '#a855f7' }}>
                                <ScanLine size={16} /> Scan Full KB
                            </button>
                        </div>
                        {detectResults && (
                            <div style={styles.resultsArea}>
                                <div style={styles.summaryRow}>
                                    <SummaryBadge label="Clean" value={detectResults.summary?.clean} color="#22c55e" />
                                    <SummaryBadge label="Suspicious" value={detectResults.summary?.suspicious} color="#eab308" />
                                    <SummaryBadge label="Poisoned" value={detectResults.summary?.poisoned} color="#f97316" />
                                    <SummaryBadge label="Critical" value={detectResults.summary?.critical} color="#ef4444" />
                                </div>
                                {detectResults.scan_results?.map((r, i) => (
                                    <div key={i} style={{ ...styles.detectCard, borderLeftColor: verdictColor(r.verdict) }}>
                                        <div style={styles.detectHeader}>
                                            <span style={{ ...styles.verdictBadge, background: `${verdictColor(r.verdict)}20`, color: verdictColor(r.verdict) }}>
                                                {r.verdict.toUpperCase()}
                                            </span>
                                            <span style={styles.chunkSource}>{r.source}</span>
                                        </div>
                                        <div style={styles.metricsRow}>
                                            <MetricBox label="Perplexity" value={r.perplexity_score} threshold={80} />
                                            <MetricBox label="Similarity" value={r.similarity_score} threshold={0.6} invert />
                                        </div>
                                        {r.matched_patterns?.length > 0 && (
                                            <div style={styles.patternsWrap}>
                                                <span style={{ color: '#f87171', fontSize: 12 }}>Matched: </span>
                                                {r.matched_patterns.slice(0, 5).map((p, j) => (
                                                    <span key={j} style={styles.patternTag}>{p}</span>
                                                ))}
                                            </div>
                                        )}
                                        <pre style={styles.chunkContent}>{r.content_preview}</pre>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ──────── MITIGATE TAB ──────── */}
                {activeTab === 'mitigate' && (
                    <div>
                        <SectionHeader icon={ShieldCheck} title="Mitigation Implementation" desc="Apply defense filters to block poisoned content from the knowledge base." color="#34d399" />
                        <div style={styles.filterGrid}>
                            <FilterToggle label="Keyword Filter" desc="Blocks 30+ jailbreak patterns (ignore all, secret, leak, etc.)"
                                active={filters.keyword_filter} onToggle={() => setFilters(f => ({ ...f, keyword_filter: !f.keyword_filter }))} />
                            <FilterToggle label="Perplexity Filter" desc="Blocks chunks with abnormally high perplexity (unnatural text)"
                                active={filters.perplexity_filter} onToggle={() => setFilters(f => ({ ...f, perplexity_filter: !f.perplexity_filter }))} />
                            <FilterToggle label="Similarity Filter" desc="Blocks chunks with low similarity to clean knowledge base"
                                active={filters.similarity_filter} onToggle={() => setFilters(f => ({ ...f, similarity_filter: !f.similarity_filter }))} />
                        </div>
                        <div style={styles.infoBox}>
                            <Info size={16} color="#60a5fa" />
                            <div>
                                <strong>Note:</strong> These are per-chunk defenses. Advanced attackers can split injections across documents.
                                Real-world defense also requires input/output guards, retrieval filtering, and prompt hardening.
                            </div>
                        </div>
                        <button onClick={handleMitigate} disabled={mitigating}
                            style={{ ...styles.actionBtn, background: '#10b981', marginTop: 16 }}>
                            {mitigating ? <Loader2 size={16} /> : <Lock size={16} />} Apply Mitigations & Rebuild KB
                        </button>
                        {mitigateResult && (
                            <div style={styles.mitigateResultBox}>
                                <h4 style={{ color: '#34d399', margin: '0 0 12px' }}>✅ Mitigations Applied</h4>
                                <div style={styles.summaryRow}>
                                    <SummaryBadge label="Total Chunks" value={mitigateResult.total_chunks} color="#94a3b8" />
                                    <SummaryBadge label="Blocked" value={mitigateResult.blocked_chunks} color="#ef4444" />
                                    <SummaryBadge label="Passed" value={mitigateResult.passed_chunks} color="#22c55e" />
                                </div>
                                {mitigateResult.blocked_details?.map((b, i) => (
                                    <div key={i} style={styles.blockedItem}>
                                        <XCircle size={14} color="#ef4444" />
                                        <span style={{ color: '#f87171' }}>{b.source}</span>
                                        <span style={{ color: '#64748b', fontSize: 12 }}>({b.filter})</span>
                                        <span style={{ color: '#94a3b8', fontSize: 12 }}>{b.preview?.slice(0, 60)}...</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
        </div>
    );
};

// ──── Sub-components ────
const StatusBadge = ({ poisoned }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20,
        background: poisoned ? '#ef444418' : '#22c55e18', border: `1px solid ${poisoned ? '#ef444440' : '#22c55e40'}`
    }}>
        {poisoned ? <ShieldAlert size={14} color="#ef4444" /> : <ShieldCheck size={14} color="#22c55e" />}
        <span style={{ color: poisoned ? '#ef4444' : '#22c55e', fontSize: 13, fontWeight: 600 }}>
            {poisoned ? 'KB POISONED' : 'KB CLEAN'}
        </span>
    </div>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', flex: 1 }}>
        <Icon size={18} color={color} />
        <div><div style={{ color: '#94a3b8', fontSize: 11 }}>{label}</div><div style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700 }}>{value}</div></div>
    </div>
);

const SectionHeader = ({ icon: Icon, title, desc, color }) => (
    <div style={{ marginBottom: 20 }}>
        <h3 style={{ color: '#f1f5f9', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon size={20} color={color} /> {title}
        </h3>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13 }}>{desc}</p>
    </div>
);

const SummaryBadge = ({ label, value, color }) => (
    <div style={{ padding: '8px 16px', borderRadius: 8, background: `${color}12`, border: `1px solid ${color}30`, textAlign: 'center' }}>
        <div style={{ color, fontSize: 22, fontWeight: 700 }}>{value}</div>
        <div style={{ color: '#94a3b8', fontSize: 11 }}>{label}</div>
    </div>
);

const MetricBox = ({ label, value, threshold, invert }) => {
    const bad = invert ? value < threshold : value > threshold;
    const color = bad ? '#ef4444' : '#22c55e';
    return (
        <div style={{ padding: '8px 14px', borderRadius: 8, background: `${color}10`, border: `1px solid ${color}25` }}>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>{label}</div>
            <div style={{ color, fontSize: 18, fontWeight: 700 }}>{typeof value === 'number' ? (value < 1 ? value.toFixed(4) : value.toFixed(1)) : value}</div>
        </div>
    );
};

const FilterToggle = ({ label, desc, active, onToggle }) => (
    <div onClick={onToggle} style={{ ...styles.filterCard, borderColor: active ? '#22c55e40' : '#1e293b', cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{label}</span>
            {active ? <ToggleRight size={24} color="#22c55e" /> : <ToggleLeft size={24} color="#475569" />}
        </div>
        <p style={{ color: '#64748b', fontSize: 12, margin: '6px 0 0' }}>{desc}</p>
    </div>
);

// ──── Styles ────
const styles = {
    page: { minHeight: '100vh', background: '#020617', padding: '24px 32px', fontFamily: "'Inter', sans-serif" },
    loadingWrap: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
    headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
    backBtn: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 8, color: '#94a3b8', cursor: 'pointer' },
    title: { color: '#f1f5f9', fontSize: 24, margin: 0, fontWeight: 700 },
    subtitle: { color: '#64748b', fontSize: 13, margin: 0 },
    resetBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 14px', color: '#94a3b8', cursor: 'pointer', fontSize: 13 },
    statsBar: { display: 'flex', gap: 12, marginBottom: 16 },
    defenseBar: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: '1px solid', fontSize: 13, color: '#94a3b8', marginBottom: 16 },
    tabBar: { display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #1e293b', paddingBottom: 12 },
    tab: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: '1px solid transparent', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all .2s' },
    content: { background: '#0f172a', borderRadius: 16, border: '1px solid #1e293b', padding: 28, minHeight: 400 },
    inputRow: { display: 'flex', gap: 8 },
    input: { flex: 1, padding: '10px 16px', borderRadius: 10, border: '1px solid #334155', background: '#020617', color: '#f1f5f9', fontSize: 14, outline: 'none' },
    textarea: { width: '100%', padding: '10px 16px', borderRadius: 10, border: '1px solid #334155', background: '#020617', color: '#f1f5f9', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: "'JetBrains Mono', monospace", boxSizing: 'border-box' },
    actionBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
    resultsArea: { marginTop: 20 },
    resultsMeta: { color: '#64748b', fontSize: 12, marginBottom: 12 },
    chunkCard: { background: '#020617', borderRadius: 10, border: '1px solid #1e293b', borderLeft: '3px solid', padding: 14, marginBottom: 10 },
    chunkHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    chunkSource: { color: '#94a3b8', fontSize: 12 },
    chunkContent: { color: '#cbd5e1', fontSize: 12, background: '#0f172a', padding: 10, borderRadius: 6, overflow: 'auto', whiteSpace: 'pre-wrap', margin: 0, maxHeight: 150 },
    poisonBadge: { background: '#ef444420', color: '#f87171', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
    cleanBadge: { background: '#22c55e20', color: '#4ade80', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
    warningBanner: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#fbbf2410', border: '1px solid #fbbf2430', borderRadius: 10, color: '#fbbf24', fontSize: 13, marginBottom: 16 },
    sectionLabel: { color: '#94a3b8', fontSize: 13, margin: '18px 0 10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 },
    payloadGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 },
    payloadCard: { background: '#020617', borderRadius: 10, border: '1px solid #1e293b', padding: 14, cursor: 'pointer', transition: 'all .2s' },
    payloadType: { color: '#f87171', fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 4 },
    payloadName: { color: '#f1f5f9', fontSize: 14, fontWeight: 600 },
    payloadPreview: { color: '#64748b', fontSize: 11, marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
    resultBox: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: '14px 18px', borderRadius: 10, border: '1px solid', background: '#020617', color: '#e2e8f0', fontSize: 13 },
    disableBtn: { marginLeft: 'auto', background: '#ef4444', border: 'none', padding: '4px 12px', borderRadius: 6, color: '#fff', fontSize: 12, cursor: 'pointer' },
    detectCard: { background: '#020617', borderRadius: 10, border: '1px solid #1e293b', borderLeft: '3px solid', padding: 14, marginBottom: 10 },
    detectHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
    verdictBadge: { padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1 },
    metricsRow: { display: 'flex', gap: 10, marginBottom: 10 },
    patternsWrap: { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
    patternTag: { background: '#f8717115', color: '#f87171', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: 'monospace' },
    summaryRow: { display: 'flex', gap: 10, marginBottom: 16 },
    filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 10, marginBottom: 16 },
    filterCard: { background: '#020617', borderRadius: 10, border: '1px solid #1e293b', padding: 16 },
    infoBox: { display: 'flex', gap: 10, padding: '12px 16px', borderRadius: 10, background: '#1e40af10', border: '1px solid #1e40af30', color: '#94a3b8', fontSize: 12, lineHeight: 1.5 },
    mitigateResultBox: { marginTop: 20, padding: 20, background: '#020617', borderRadius: 12, border: '1px solid #22c55e30' },
    blockedItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #1e293b', fontSize: 13 },
};

export default RAGPoisoningLab;

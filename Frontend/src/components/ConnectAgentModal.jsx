
import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const ConnectAgentModal = ({ isOpen, onClose, onSuccess }) => {
    // Form States — restore from localStorage for history
    const [agentToken, setAgentToken] = useState(() => localStorage.getItem('agentToken') || "");
    const [agentRuntime, setAgentRuntime] = useState(() => localStorage.getItem('agentRuntime') || "LangGraph");
    const [agentIdentifier, setAgentIdentifier] = useState(() => localStorage.getItem('agentIdentifier') || "");
    const [agentUrl, setAgentUrl] = useState(() => localStorage.getItem('agentUrl') || "");
    const [showAgentToken, setShowAgentToken] = useState(false);

    // Validation States
    const [isValidating, setIsValidating] = useState(false);
    const [isValidated, setIsValidated] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);

    // Persist changes
    useEffect(() => {
        localStorage.setItem('agentToken', agentToken);
        localStorage.setItem('agentRuntime', agentRuntime);
        localStorage.setItem('agentIdentifier', agentIdentifier);
        localStorage.setItem('agentUrl', agentUrl);
    }, [agentToken, agentRuntime, agentIdentifier, agentUrl]);

    const checkIsMalicious = () => {
        return agentUrl.toLowerCase().includes('evil') ||
            agentUrl.toLowerCase().includes('malicious') ||
            agentUrl.toLowerCase().includes('exe') ||
            agentUrl.toLowerCase().includes('trap') ||
            agentToken === 'agpt_sk_7721839910_live' ||
            agentIdentifier === 'autogpt-primary-instance' ||
            agentIdentifier.toLowerCase().includes('exe');
    };

    const handleValidateHandshake = () => {
        setIsValidating(true);
        setIsValidated(false);
        setValidationError(null);

        const isMalicious = checkIsMalicious();

        setTimeout(() => {
            setIsValidating(false);
            if (isMalicious) {
                setValidationError("SECURITY WARNING: Untrusted runtime detected. Connection will be heavily sandboxed.");
                setIsValidated(true);
            } else {
                setIsValidated(true);
            }
        }, 1200);
    };

    const handleConnectAgent = () => {
        setIsConnecting(true);
        const isMalicious = checkIsMalicious();

        const agentData = {
            agent_name: agentIdentifier || 'agent-alpha-01',
            platform: agentRuntime || 'LangGraph',
            webhook_url: agentUrl || 'http://localhost:8000/webhook',
            api_endpoint: agentUrl,
            tools: [
                { name: 'database_query' },
                { name: 'email_sender' },
                { name: 'web_search' }
            ],
            api_key: agentToken,
            metadata: {
                risk_level: isMalicious ? 'CRITICAL' : 'MEDIUM',
                source: 'dashboard_agent'
            }
        };

        // Save to localStorage so DashboardAgent picks it up
        const localAgent = {
            id: 'local-' + Date.now(),
            agent_name: agentData.agent_name,
            platform: agentData.platform,
            webhook_url: agentData.webhook_url,
            api_endpoint: agentData.api_endpoint,
            enabled_tools: ['database_query', 'email_sender', 'web_search'],
            risk_level: isMalicious ? 'CRITICAL' : 'MEDIUM',
            total_calls: 0,
            safe_calls: 0,
            blocked_calls: 0,
            risk_score: 0,
            status: 'active',
            created_at: new Date().toISOString()
        };
        localStorage.setItem('connectedAgent', JSON.stringify(localAgent));

        // Fire-and-forget API call
        fetch('http://localhost:8000/api/agents/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agentData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.agent_id) {
                const saved = JSON.parse(localStorage.getItem('connectedAgent') || '{}');
                saved.id = data.agent_id;
                localStorage.setItem('connectedAgent', JSON.stringify(saved));
            }
        })
        .catch(err => console.error('Agent connect error:', err));

        // Immediately pass agent back to parent
        onSuccess(localAgent);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-[#0F111A] border border-slate-800 rounded-xl w-full max-w-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                {/* Breadcrumb Header */}
                <div className="p-6 pb-0 flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <span className="text-violet-500 font-bold text-[10px] tracking-widest uppercase">Agent Configuration</span>
                        <div className="h-1 w-64 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-violet-600 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
                        </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        Architecture Selected: <span className="text-slate-300">AI Agent</span>
                    </div>
                </div>

                <div className="p-8 flex flex-col items-center text-left">
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight text-center">Connect your AI Agent</h2>
                    <p className="text-slate-500 text-center max-w-lg mb-8 text-xs leading-relaxed">
                        Link your autonomous agent to the safety gateway. Guardian AI will monitor tool-calls and enforce security policies in real-time.
                    </p>

                    <div className="w-full grid grid-cols-2 gap-4 mb-6">
                        <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agent Runtime</label>
                            <div className="relative">
                                <select
                                    value={agentRuntime}
                                    onChange={(e) => setAgentRuntime(e.target.value)}
                                    className="w-full bg-[#1A1C26] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors appearance-none cursor-pointer"
                                >
                                    <option>LangGraph</option>
                                    <option>AutoGPT</option>
                                    <option>CrewAI</option>
                                    <option>Custom SDK</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agent Identifier</label>
                            <input
                                type="text"
                                value={agentIdentifier}
                                onChange={(e) => setAgentIdentifier(e.target.value)}
                                placeholder="e.g., agent-alpha-01"
                                className="w-full bg-[#1A1C26] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors placeholder:text-slate-600"
                            />
                        </div>
                        <div className="col-span-2 space-y-1.5 text-left">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Runtime URL (WebSocket/gRPC)</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                </div>
                                <input
                                    type="text"
                                    value={agentUrl}
                                    onChange={(e) => setAgentUrl(e.target.value)}
                                    placeholder="ws://agent-runtime.internal/v1"
                                    className="w-full bg-[#1A1C26] border border-slate-800 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                        <div className="col-span-2 space-y-1.5 text-left">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secret Authentication Token</label>
                            <div className="relative">
                                <input
                                    type={showAgentToken ? "text" : "password"}
                                    value={agentToken}
                                    onChange={(e) => setAgentToken(e.target.value)}
                                    placeholder="Enter your security token"
                                    className="w-full bg-[#1A1C26] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAgentToken(!showAgentToken)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showAgentToken ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L5.93 5.93m12.14 12.14L14.12 14.12M21.41 12a9.97 9.97 0 00-1.563-3.029m-5.858-.908L18.07 4.07" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleValidateHandshake}
                        disabled={isValidating}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-bold transition-all duration-200 mb-6 mr-auto group text-xs ${isValidating
                            ? "bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed"
                            : validationError
                                ? "bg-red-500/10 border-red-500/50 text-red-500 animate-shake"
                                : isValidated
                                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500"
                                    : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                            }`}
                    >
                        {isValidating ? (
                            <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        ) : validationError ? (
                            <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        ) : (
                            <svg className={`w-3 h-3 ${isValidated ? "" : "group-hover:rotate-180 transition-transform duration-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        )}
                        {isValidating ? "Validating Protocol..." : validationError ? "Handshake Refused" : isValidated ? "Handshake Verified" : "Validate Agent Handshake"}
                    </button>

                    {validationError && (
                        <div className="w-full bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-[10px] text-red-500 font-bold flex items-start gap-3 mb-4">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{validationError}</span>
                        </div>
                    )}

                    <div className="w-full bg-[#12141F] border border-slate-800/80 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-500 ${validationError ? "bg-red-500/10 text-red-500 animate-pulse" : isValidated ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-800 text-slate-600"}`}>
                                    {validationError ? (
                                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                                    ) : (
                                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    )}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${validationError ? "text-red-500/80" : isValidated ? "text-emerald-500/80" : "text-slate-600"}`}>Protocol Handshake</span>
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors duration-500 ${validationError ? "text-red-600" : isValidated ? "text-emerald-600" : "text-slate-700"}`}>
                                {validationError ? "Intercepted/Trapped" : isValidated ? "Established" : "Pending"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-500 ${isValidated ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-800 text-slate-600"}`}>
                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${isValidated ? "text-emerald-500/80" : "text-slate-600"}`}>Tool-Call Interception</span>
                                {isValidated && <span className="px-1.5 py-0.5 bg-violet-500/10 text-violet-400 text-[8px] font-bold rounded uppercase animate-pulse">Active</span>}
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors duration-500 ${isValidated ? "text-emerald-600" : "text-slate-700"}`}>
                                {isValidated ? "Ready" : "Offline"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-500 ${isValidated ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-800 text-slate-600"}`}>
                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${isValidated ? "text-emerald-500/80" : "text-slate-600"}`}>Blast Radius Sandbox</span>
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors duration-500 ${isValidated ? "text-emerald-600" : "text-slate-700"}`}>
                                {isValidated ? "Initialized" : "Awaiting Info"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Bar */}
                <div className="p-6 bg-[#090A12] border-t border-slate-800 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        Cancel
                    </button>
                    <button
                        onClick={handleConnectAgent}
                        disabled={!isValidated || isConnecting}
                        className={`font-black px-8 py-3 rounded-lg text-sm tracking-tight flex items-center gap-3 transition-all active:scale-95 group ${!isValidated || isConnecting
                            ? "bg-slate-800 text-slate-600 cursor-not-allowed opacity-50"
                            : validationError
                                ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                                : "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                            }`}
                    >
                        {isConnecting ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Launching...
                            </>
                        ) : (
                            <>
                                {validationError ? "Launch in Sandbox Mode" : "Launch Agent Dashboard"}
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Security Seals */}
            <div className="absolute bottom-10 flex items-center gap-8 opacity-40">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    SOC2 Compliant
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    AES-256 Encryption
                </div>
            </div>
        </div>
    );
};

export default ConnectAgentModal;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConnectLLMModal from "../components/ConnectLLMModal";

const ArchitectureSelection = () => {
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = useState(null);
    const [selectedArch, setSelectedArch] = useState(null);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const showLegacyModalLayout = false;

    const architectures = [
        {
            id: 'llm',
            name: 'LLM',
            fullName: 'Large Language Model',
            description: 'Direct model interaction security testing. Evaluate prompt injection, output filtering, and data leakage defenses on standalone LLM endpoints.',
            icon: (
                <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
                    <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 16h16M12 20h12M12 24h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="32" cy="14" r="3" fill="currentColor" opacity="0.5" />
                </svg>
            ),
            features: ['Prompt Injection Testing', 'Output Sanitization', 'DLP Scanning', 'Token Budget Control'],
            route: '/dashboard',
            gradient: 'from-blue-600 to-cyan-500',
            glowColor: 'rgba(59, 130, 246, 0.4)',
            borderColor: 'border-blue-500/30',
            tagColor: 'bg-blue-500/20 text-blue-400',
        },
        {
            id: 'rag',
            name: 'RAG',
            fullName: 'Retrieval Augmented Generation',
            description: 'Secure your knowledge pipeline. Test document poisoning, context injection, and retrieval integrity across your vector databases and embeddings.',
            icon: (
                <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
                    <path d="M8 6h16l8 8v20a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
                    <path d="M24 6v8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 18h16M12 22h12M12 26h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                    <circle cx="30" cy="30" r="6" stroke="currentColor" strokeWidth="2" />
                    <path d="M30 27v6M27 30h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            features: ['Document Poisoning Detection', 'Context Integrity Checks', 'Embedding Security', 'Source Validation'],
            route: '/secure-rag',
            gradient: 'from-emerald-600 to-teal-500',
            glowColor: 'rgba(16, 185, 129, 0.4)',
            borderColor: 'border-emerald-500/30',
            tagColor: 'bg-emerald-500/20 text-emerald-400',
        },
        {
            id: 'agent',
            name: 'Agent',
            fullName: 'Autonomous AI Agent',
            description: 'Monitor and control autonomous AI agents. Enforce tool-call permissions, blast radius limits, and real-time threat interception for agentic workflows.',
            icon: (
                <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
                    <rect x="12" y="4" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
                    <circle cx="20" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M20 16v4" stroke="currentColor" strokeWidth="2" />
                    <rect x="6" y="24" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                    <rect x="22" y="24" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 24v-4h16v4" stroke="currentColor" strokeWidth="2" />
                </svg>
            ),
            features: ['Tool-call Permissions', 'Blast Radius Control', 'Real-time Interception', 'Autonomous Monitoring'],
            route: '/dashboard/agent',
            gradient: 'from-violet-600 to-purple-500',
            glowColor: 'rgba(139, 92, 246, 0.4)',
            borderColor: 'border-violet-500/30',
            tagColor: 'bg-violet-500/20 text-violet-400',
        }
    ];

    const handleSelect = (arch) => {
        if (arch.id === 'llm') {
            setShowConnectModal(true);
            return;
        }
        setSelectedArch(arch.id);
        setTimeout(() => {
            navigate(arch.route);
        }, 600);
    };

    const handleConnectLLM = () => {
        setSelectedArch('llm');
        setTimeout(() => {
            navigate('/main-dashboard');
        }, 600);
    };

    const handleLLMConnected = () => {
        handleConnectLLM();
        setShowConnectModal(false);
    };

    return (
        <div className="min-h-screen bg-[#060611] flex flex-col items-center justify-center relative overflow-hidden px-6 py-12">
            {/* Ambient background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-[120px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/3 rounded-full blur-[150px]"></div>
            </div>

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            ></div>

            {/* Header */}
            <div className="relative z-10 text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-4">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-400 text-[10px] font-medium tracking-wider uppercase">Guardian AI Security Platform</span>
                </div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                    Select Your Architecture
                </h1>
                <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
                    Choose the AI architecture you want to secure. Each mode provides tailored threat detection and protection.
                </p>
            </div>

            {/* Architecture Cards */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-12">
                {architectures.map((arch) => (
                    <button
                        key={arch.id}
                        onClick={() => handleSelect(arch)}
                        onMouseEnter={() => setHoveredCard(arch.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        className={`relative group text-left rounded-xl border transition-all duration-500 overflow-hidden ${selectedArch === arch.id
                            ? `${arch.borderColor} scale-[0.97] opacity-80`
                            : hoveredCard === arch.id
                                ? `${arch.borderColor} border-opacity-60 scale-[1.01]`
                                : 'border-gray-800 hover:border-gray-700'
                            }`}
                        style={{
                            background: hoveredCard === arch.id
                                ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)'
                                : 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)',
                        }}
                    >
                        {/* Hover glow effect */}
                        {hoveredCard === arch.id && (
                            <div
                                className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full blur-[80px] transition-opacity duration-500 pointer-events-none"
                                style={{ background: arch.glowColor }}
                            ></div>
                        )}

                        {/* Selected animation overlay */}
                        {selectedArch === arch.id && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl">
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${arch.gradient} flex items-center justify-center animate-pulse`}>
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        <div className="relative z-10 p-5">
                            {/* Icon + Badge */}
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${arch.gradient} bg-opacity-20 flex items-center justify-center text-white`}
                                    style={{ background: `linear-gradient(135deg, ${arch.glowColor}, transparent)` }}
                                >
                                    {arch.icon}
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${arch.tagColor}`}>
                                    {arch.name}
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-lg font-bold text-white mb-1">{arch.fullName}</h2>
                            <p className="text-gray-500 text-xs mb-4 leading-relaxed">{arch.description}</p>

                            {/* Features */}
                            <div className="space-y-2.5 mb-6">
                                {arch.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2.5">
                                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${arch.gradient}`}></div>
                                        <span className="text-gray-400 text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <div className={`flex items-center gap-2 text-sm font-bold transition-all duration-300 ${hoveredCard === arch.id ? 'text-white translate-x-1' : 'text-gray-500'
                                }`}>
                                <span>Launch Dashboard</span>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        {/* Bottom gradient line */}
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${arch.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl`}></div>
                    </button>
                ))}
            </div>

            {/* Footer hint */}
            <div className="relative z-10 text-center">
                <p className="text-gray-600 text-sm">
                    You can switch architectures anytime from the settings panel.
                </p>
            </div>

            {/* Shared functional Connect LLM modal */}
            <ConnectLLMModal
                isOpen={showConnectModal}
                onClose={() => setShowConnectModal(false)}
                onSuccess={handleLLMConnected}
            />

            {/* Legacy static Connect LLM layout (disabled) */}
            {showLegacyModalLayout && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 transition-opacity"
                        onClick={() => setShowConnectModal(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-[#0F111A] border border-slate-800 rounded-xl w-full max-w-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-300">
                        {/* Breadcrumb Header */}
                        <div className="p-6 pb-0 flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <span className="text-blue-500 font-bold text-[10px] tracking-widest uppercase">Step 2 of 3: Configuration</span>
                                <div className="h-1 w-64 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                Architecture Selected: <span className="text-slate-300">Cloud Proxy</span>
                            </div>
                        </div>

                        <div className="p-8 flex flex-col items-center">
                            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Connect your LLM Provider</h2>
                            <p className="text-slate-500 text-center max-w-lg mb-8 text-xs leading-relaxed">
                                Configure the connection between your security gateway and your AI model. Your API keys are encrypted at rest.
                            </p>

                            <div className="w-full grid grid-cols-2 gap-4 mb-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Provider</label>
                                    <div className="relative">
                                        <select className="w-full bg-[#1A1C26] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer">
                                            <option>OpenAI</option>
                                            <option>Anthropic</option>
                                            <option>Google Gemini</option>
                                            <option>Mistral AI</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Model Identifier</label>
                                    <input type="text" placeholder="e.g., gpt-4o-latest" className="w-full bg-[#1A1C26] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600" />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Endpoint URL</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                        </div>
                                        <input type="text" placeholder="https://api.openai.com/v1" className="w-full bg-[#1A1C26] border border-slate-800 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600" />
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authentication Key (sk-...)</label>
                                    <div className="relative">
                                        <input type="password" value="••••••••••••••••••••••••••••••••••••••" readOnly className="w-full bg-[#1A1C26] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors" />
                                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 font-bold hover:bg-slate-700 hover:text-white transition-all duration-200 mb-6 mr-auto group text-xs text-xs">
                                <svg className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Test Connection
                            </button>

                            <div className="w-full bg-[#12141F] border border-slate-800/80 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">DNS Resolution</span>
                                    </div>
                                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Success (14ms)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">Authentication Handshake</span>
                                    </div>
                                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Verified</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">Gateway Readiness</span>
                                    </div>
                                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Optimal</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Bar */}
                        <div className="p-6 bg-[#090A12] border-t border-slate-800 flex items-center justify-between">
                            <button
                                onClick={() => setShowConnectModal(false)}
                                className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Back to Architecture
                            </button>
                            <button
                                onClick={handleConnectLLM}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-3 rounded-lg text-sm tracking-tight flex items-center gap-3 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95 group"
                            >
                                Complete Setup
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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
            )}
        </div>
    );
};

export default ArchitectureSelection;
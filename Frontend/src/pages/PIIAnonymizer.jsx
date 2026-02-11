import { useState, useEffect } from 'react';
import { 
    Shield, 
    Eye, 
    EyeOff, 
    AlertTriangle, 
    CheckCircle, 
    Copy, 
    RotateCcw,
    ArrowLeft,
    Zap,
    Target,
    XCircle,
    Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const PIIAnonymizer = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' or 'tester'
    
    // Scanner State
    const [inputText, setInputText] = useState('');
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const [copied, setCopied] = useState(false);

    // Tester State
    const [domains, setDomains] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState('general');
    const [llmDescription, setLlmDescription] = useState('');
    const [testing, setTesting] = useState(false);
    const [testResults, setTestResults] = useState(null);

    // Common State
    const [llmConnected, setLlmConnected] = useState(false);
    const [llmModel, setLlmModel] = useState(null);

    useEffect(() => {
        checkLLMConnection();
        fetchDomains();
    }, []);

    const checkLLMConnection = async () => {
        try {
            const response = await api.get('/llm/connected');
            const data = response.data;
            setLlmConnected(data.connected);
            setLlmModel(data.model_name);
        } catch (error) {
            console.error('Error checking LLM:', error);
        }
    };

    const fetchDomains = async () => {
        try {
            const response = await api.get('/pii/attack-domains');
            setDomains(response.data);
        } catch (error) {
            console.error('Error fetching domains:', error);
        }
    };

    const exampleTexts = [
        {
            title: "Email with Personal Info",
            text: "Hi, my name is John Smith. You can reach me at john.smith@email.com or call me at +1-555-123-4567. My SSN is 123-45-6789."
        },
        {
            title: "Medical Record",
            text: "Patient Sarah Johnson, DOB: 05/15/1985, SSN: 987-65-4321, was admitted on 12/01/2023. Contact: sarah.j@hospital.org"
        },
        {
            title: "Financial Data",
            text: "Credit card ending in 4532, account holder Michael Brown, expires 12/25. Routing: 123456789, Account: 9876543210"
        }
    ];

    const handleScan = async () => {
        if (!inputText.trim()) {
            alert('Please enter some text to scan');
            return;
        }

        setLoading(true);
        setScanResult(null);

        try {
            const response = await api.post('/pii/scan', { text: inputText });
            setScanResult(response.data);
        } catch (error) {
            console.error('Error scanning text:', error);
            alert('Failed to scan text. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRunTest = async () => {
        if (!llmConnected) {
            alert('Please connect an LLM first from the dashboard');
            return;
        }

        setTesting(true);
        setTestResults(null);

        try {
            const response = await api.post('/pii/test-domain', {
                domain: selectedDomain,
                llm_description: llmDescription
            });
            setTestResults(response.data);
        } catch (error) {
            console.error('Error running test:', error);
            const msg = error.response?.data?.detail || 'Failed to run PII test. Please try again.';
            alert(msg);
        } finally {
            setTesting(false);
        }
    };

    const handleCopy = () => {
        if (scanResult?.redacted_text) {
            navigator.clipboard.writeText(scanResult.redacted_text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleReset = () => {
        setInputText('');
        setScanResult(null);
        setShowOriginal(false);
    };

    const handleLoadExample = (example) => {
        setInputText(example.text);
        setScanResult(null);
    };

    const getRiskColor = (level) => {
        switch (level?.toUpperCase()) {
            case 'CRITICAL':
                return 'text-red-500 bg-red-500/10 border-red-500';
            case 'HIGH':
                return 'text-orange-500 bg-orange-500/10 border-orange-500';
            case 'MEDIUM':
                return 'text-yellow-500 bg-yellow-500/10 border-yellow-500';
            case 'LOW':
                return 'text-green-500 bg-green-500/10 border-green-500';
            default:
                return 'text-gray-500 bg-gray-500/10 border-gray-500';
        }
    };

    const getEntityColor = (type) => {
        const colors = {
            'EMAIL': 'bg-blue-500/20 text-blue-400 border-blue-500',
            'PHONE': 'bg-purple-500/20 text-purple-400 border-purple-500',
            'SSN': 'bg-red-500/20 text-red-400 border-red-500',
            'CREDIT_CARD': 'bg-orange-500/20 text-orange-400 border-orange-500',
            'PERSON': 'bg-green-500/20 text-green-400 border-green-500',
            'PERSON_NAME': 'bg-green-500/20 text-green-400 border-green-500',
            'DATE': 'bg-cyan-500/20 text-cyan-400 border-cyan-500',
            'ADDRESS': 'bg-pink-500/20 text-pink-400 border-pink-500',
            'URL': 'bg-indigo-500/20 text-indigo-400 border-indigo-500',
            'IP_ADDRESS': 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
        };
        return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500';
    };

    const getDomainIcon = (domain) => {
        const icons = {
            'healthcare': '🏥',
            'banking': '🏦',
            'customer_service': '👥',
            'legal': '⚖️',
            'hr_recruitment': '💼',
            'general': '🌐'
        };
        return icons[domain] || '📋';
    };

    const getStatusColor = (status) => {
        if (status === 'PROTECTED') return 'text-green-500 bg-green-500/10 border-green-500';
        if (status === 'VULNERABLE') return 'text-red-500 bg-red-500/10 border-red-500';
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500';
    };

    const getSecurityScoreColor = (score) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="min-h-screen bg-[#06060E] text-slate-300">
            {/* Header */}
            <div className="border-b border-slate-800 bg-[#0A0A14]/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard-llm')}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    activeTab === 'scanner' 
                                        ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                                        : 'bg-gradient-to-br from-red-600 to-orange-600'
                                }`}>
                                    {activeTab === 'scanner' ? (
                                        <Shield className="text-white w-6 h-6" />
                                    ) : (
                                        <Target className="text-white w-6 h-6" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-white font-bold text-xl">
                                            {activeTab === 'scanner' ? 'PII Anonymizer' : 'PII Vulnerability Tester'}
                                        </h1>
                                        {llmConnected && (
                                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded border border-emerald-500">
                                                🧠 {llmModel}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-500 text-sm">
                                        {activeTab === 'scanner' 
                                            ? 'LLM-powered detection and redaction' 
                                            : 'Red team testing for PII leakage'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tab Results Display */}
                        {activeTab === 'scanner' && scanResult && (
                            <div className="flex items-center gap-3">
                                <div className={`px-4 py-2 rounded-lg border ${getRiskColor(scanResult.risk_level)}`}>
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle size={16} />
                                        <span className="font-bold text-sm uppercase">{scanResult.risk_level} Risk</span>
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                                    <span className="text-slate-400 text-sm">Score: </span>
                                    <span className="text-white font-bold">{scanResult.risk_score}/100</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'tester' && testResults && (
                            <div className="flex items-center gap-3">
                                <div className={`px-4 py-2 rounded-lg border ${
                                    testResults.verdict === 'SECURE' 
                                        ? 'bg-green-500/20 text-green-400 border-green-500'
                                        : 'bg-red-500/20 text-red-400 border-red-500'
                                }`}>
                                    <span className="font-bold text-sm uppercase">{testResults.verdict}</span>
                                </div>
                                <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                                    <span className="text-slate-400 text-sm">Security: </span>
                                    <span className={`font-bold ${getSecurityScoreColor(testResults.security_score)}`}>
                                        {testResults.security_score}%
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-2 mt-4">
                        <button
                            onClick={() => setActiveTab('scanner')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                activeTab === 'scanner'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Shield size={16} />
                                PII Scanner & Redaction
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('tester')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                activeTab === 'tester'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Target size={16} />
                                Vulnerability Testing
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* LLM Connection Warning */}
                {!llmConnected && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 animate-pulse">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                    <AlertTriangle className="text-yellow-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-yellow-400 font-bold">No LLM Connected</h3>
                                    <p className="text-yellow-400/70 text-sm">
                                        Connect an LLM to enable {activeTab === 'scanner' ? 'intelligent PII analysis' : 'vulnerability testing'}.
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate('/dashboard-llm')}
                                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg text-sm font-bold transition-colors"
                            >
                                Connect Now
                            </button>
                        </div>
                    </div>
                )}

                {/* Scanner Tab */}
                {activeTab === 'scanner' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Input Section */}
                        <div className="space-y-4">
                            <div className="bg-[#0A0A14] border border-slate-800 rounded-xl overflow-hidden">
                                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                                    <h3 className="text-white font-bold">Input Text</h3>
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
                                    >
                                        <RotateCcw size={14} />
                                        Reset
                                    </button>
                                </div>
                                <div className="p-4">
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Enter text containing personal information to scan and anonymize..."
                                        className="w-full h-64 bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-purple-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Example Texts */}
                            <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-4">
                                <h4 className="text-white font-bold mb-3 text-sm">Quick Examples</h4>
                                <div className="space-y-2">
                                    {exampleTexts.map((example, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleLoadExample(example)}
                                            className="w-full text-left p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-700 hover:border-purple-500 rounded-lg transition-all"
                                        >
                                            <div className="text-white text-sm font-bold mb-1">{example.title}</div>
                                            <div className="text-slate-500 text-xs line-clamp-2">{example.text}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Scan Button */}
                            <button
                                onClick={handleScan}
                                disabled={loading || !inputText.trim()}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white rounded-xl p-4 font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-purple-500/20"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Scanning for PII...
                                    </>
                                ) : (
                                    <>
                                        <Zap size={20} />
                                        Scan & Anonymize
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Results Section */}
                        <div className="space-y-4">
                            {scanResult ? (
                                <>
                                    {scanResult.analysis_method === 'llm_powered' && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-emerald-400 text-sm mb-2">
                                                <Zap size={16} />
                                                <span className="font-bold">Analyzed by {scanResult.llm_model}</span>
                                            </div>
                                            {scanResult.summary && (
                                                <p className="text-slate-300 text-sm">{scanResult.summary}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Anonymized Text */}
                                    <div className="bg-[#0A0A14] border border-slate-800 rounded-xl overflow-hidden">
                                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                                            <h3 className="text-white font-bold">Anonymized Output</h3>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setShowOriginal(!showOriginal)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
                                                >
                                                    {showOriginal ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    {showOriginal ? 'Hide' : 'Show'} Original
                                                </button>
                                                <button
                                                    onClick={handleCopy}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors"
                                                >
                                                    <Copy size={14} />
                                                    {copied ? 'Copied!' : 'Copy'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 h-64 overflow-y-auto">
                                                <pre className="text-white whitespace-pre-wrap text-sm font-mono">
                                                    {showOriginal ? inputText : scanResult.redacted_text}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Findings */}
                                    <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-white font-bold">Detected Entities</h3>
                                            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-bold">
                                                {scanResult.total_findings} found
                                            </span>
                                        </div>

                                        {scanResult.findings && scanResult.findings.length > 0 ? (
                                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                                {scanResult.findings.map((finding, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className={`px-2 py-1 rounded border text-xs font-bold ${getEntityColor(finding.entity_type)}`}>
                                                                {finding.entity_type}
                                                            </span>
                                                            <span className="text-xs text-slate-500">
                                                                Confidence: {(finding.confidence * 100).toFixed(0)}%
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-slate-400 text-sm">Original:</span>
                                                            <code className="text-white text-sm font-mono bg-slate-800 px-2 py-1 rounded">
                                                                {finding.text}
                                                            </code>
                                                            <span className="text-slate-600">→</span>
                                                            <code className="text-purple-400 text-sm font-mono bg-purple-500/10 px-2 py-1 rounded border border-purple-500/30">
                                                                {finding.redacted_value}
                                                            </code>
                                                        </div>
                                                        {finding.context && (
                                                            <p className="text-xs text-slate-500 mt-2 italic">
                                                                {finding.context}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                                <p className="text-slate-400">No sensitive information detected</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Summary Report */}
                                    <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-4">
                                        <h3 className="text-white font-bold mb-3">Summary Report</h3>
                                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                                            <pre className="text-slate-300 text-xs whitespace-pre-wrap font-mono">
                                                {scanResult.report}
                                            </pre>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center h-full text-center">
                                    <Shield className="w-16 h-16 text-slate-600 mb-4" />
                                    <h3 className="text-white font-bold mb-2">Ready to Scan</h3>
                                    <p className="text-slate-500 text-sm max-w-md">
                                        Enter text and click "Scan & Anonymize" to detect and redact sensitive data using pattern matching.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tester Tab */}
                {activeTab === 'tester' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Configuration Panel */}
                        <div className="lg:col-span-1 space-y-4">
                            {/* Domain Selection */}
                            <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-4">
                                <h3 className="text-white font-bold mb-3">Select Domain</h3>
                                <div className="space-y-2">
                                    {domains.map((domain) => (
                                        <button
                                            key={domain.id}
                                            onClick={() => setSelectedDomain(domain.id)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                                                selectedDomain === domain.id
                                                    ? 'bg-red-500/20 border-red-500 text-white'
                                                    : 'bg-slate-900/50 border-slate-700 hover:border-red-500/50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xl">{getDomainIcon(domain.id)}</span>
                                                <span className="font-bold text-sm">{domain.name}</span>
                                            </div>
                                            <p className="text-xs text-slate-400">{domain.description}</p>
                                            <p className="text-xs text-slate-500 mt-1">{domain.attack_count} attack vectors</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* LLM Description */}
                            <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-4">
                                <h3 className="text-white font-bold mb-3">LLM Context</h3>
                                <textarea
                                    value={llmDescription}
                                    onChange={(e) => setLlmDescription(e.target.value)}
                                    placeholder="Describe what this LLM does (optional)&#10;&#10;Example: This is a healthcare chatbot that helps patients book appointments and view their medical records."
                                    className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-red-500"
                                />
                            </div>

                            {/* Run Test Button */}
                            <button
                                onClick={handleRunTest}
                                disabled={testing || !llmConnected}
                                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white rounded-xl p-4 font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-red-500/20"
                            >
                                {testing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Running Tests...
                                    </>
                                ) : (
                                    <>
                                        <Play size={20} />
                                        Run PII Attack Suite
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Results Panel */}
                        <div className="lg:col-span-2 space-y-4">
                            {testResults ? (
                                <>
                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-4">
                                            <p className="text-slate-500 text-xs uppercase mb-1">Total Attacks</p>
                                            <p className="text-white text-2xl font-bold">{testResults.total_attacks}</p>
                                        </div>
                                        <div className="bg-[#0A0A14] border border-green-800 rounded-xl p-4">
                                            <p className="text-slate-500 text-xs uppercase mb-1">Protected</p>
                                            <p className="text-green-500 text-2xl font-bold">{testResults.protected_count}</p>
                                        </div>
                                        <div className="bg-[#0A0A14] border border-red-800 rounded-xl p-4">
                                            <p className="text-slate-500 text-xs uppercase mb-1">Vulnerable</p>
                                            <p className="text-red-500 text-2xl font-bold">{testResults.vulnerable_count}</p>
                                        </div>
                                    </div>

                                    {/* Attack Results */}
                                    <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-4">
                                        <h3 className="text-white font-bold mb-4">Attack Results</h3>
                                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                            {testResults.attack_results.map((result, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            {result.status === 'PROTECTED' ? (
                                                                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                                                            ) : (
                                                                <XCircle size={18} className="text-red-500 flex-shrink-0" />
                                                            )}
                                                            <span className="text-white font-bold text-sm">{result.attack_name}</span>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded border text-xs font-bold ${getStatusColor(result.status)}`}>
                                                            {result.status}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-2 text-sm">
                                                        <div>
                                                            <span className="text-slate-500">Attack Prompt:</span>
                                                            <p className="text-slate-300 text-xs mt-1 italic">"{result.prompt}"</p>
                                                        </div>

                                                        <div>
                                                            <span className="text-slate-500">LLM Response:</span>
                                                            <p className="text-white text-xs mt-1 bg-slate-800 p-2 rounded">
                                                                {result.llm_response}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                                                            <span className="text-slate-500 text-xs">Risk Score: 
                                                                <span className="text-white font-bold ml-1">{result.risk_score}/100</span>
                                                            </span>
                                                            <span className="text-slate-500 text-xs">
                                                                {result.response_time_ms}ms
                                                            </span>
                                                        </div>

                                                        {result.analysis && (
                                                            <div className="text-xs text-slate-400 bg-slate-800/50 p-2 rounded">
                                                                {result.analysis}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-[#0A0A14] border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-center h-full">
                                    <Target className="w-16 h-16 text-slate-600 mb-4" />
                                    <h3 className="text-white font-bold mb-2">Ready to Test</h3>
                                    <p className="text-slate-500 text-sm max-w-md">
                                        {llmConnected 
                                            ? 'Select a domain and click "Run PII Attack Suite" to test your LLM for vulnerabilities'
                                            : 'Connect an LLM to start vulnerability testing'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PIIAnonymizer;

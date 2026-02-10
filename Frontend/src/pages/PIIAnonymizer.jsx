import { useState } from 'react';
import { 
    Shield, 
    Eye, 
    EyeOff, 
    AlertTriangle, 
    CheckCircle, 
    Copy, 
    RotateCcw,
    ArrowLeft,
    Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PIIAnonymizer = () => {
    const navigate = useNavigate();
    const [inputText, setInputText] = useState('');
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const [copied, setCopied] = useState(false);

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
            alert('⚠️ Please enter some text to scan');
            return;
        }

        setLoading(true);
        setScanResult(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/pii/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: inputText })
            });

            if (!response.ok) {
                throw new Error('Scan failed');
            }

            const data = await response.json();
            setScanResult(data);
        } catch (error) {
            console.error('Error scanning text:', error);
            alert('❌ Failed to scan text. Please try again.');
        } finally {
            setLoading(false);
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
            'DATE': 'bg-cyan-500/20 text-cyan-400 border-cyan-500',
            'ADDRESS': 'bg-pink-500/20 text-pink-400 border-pink-500',
            'URL': 'bg-indigo-500/20 text-indigo-400 border-indigo-500',
            'IP_ADDRESS': 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
        };
        return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500';
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
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                                    <Shield className="text-white w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-white font-bold text-xl">PII Anonymizer</h1>
                                    <p className="text-slate-500 text-sm">Detect and redact sensitive information</p>
                                </div>
                            </div>
                        </div>

                        {scanResult && (
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
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">
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
                                    Scanning...
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
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-400 text-sm">Original:</span>
                                                        <code className="text-white text-sm font-mono bg-slate-800 px-2 py-1 rounded">
                                                            {finding.text}
                                                        </code>
                                                        <span className="text-slate-600">→</span>
                                                        <code className="text-purple-400 text-sm font-mono bg-purple-500/10 px-2 py-1 rounded border border-purple-500/30">
                                                            {finding.redacted_value}
                                                        </code>
                                                    </div>
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
                                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
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
                                    Enter text containing personal information and click "Scan & Anonymize" to detect and redact sensitive data.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PIIAnonymizer;

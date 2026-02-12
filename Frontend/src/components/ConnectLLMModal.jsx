import { useState, useEffect } from 'react';
import { Plug, RefreshCw, CheckCircle2, XCircle, Server, Globe, Cpu } from 'lucide-react';

const PROVIDER_PRESETS = {
  ollama: {
    label: 'Ollama (Local)',
    icon: Server,
    description: 'Connect to a locally running Ollama instance',
    endpoint_url: 'http://localhost:11434/v1/chat/completions',
    auth_type: 'none',
    model_type: 'Chatbot',
    placeholder_model: 'dolphin3',
    detect_url: 'http://localhost:11434/api/tags',
  },
  openai: {
    label: 'OpenAI',
    icon: Globe,
    description: 'GPT-4, GPT-3.5 and other OpenAI models',
    endpoint_url: 'https://api.openai.com/v1/chat/completions',
    auth_type: 'api_key',
    model_type: 'Chatbot',
    placeholder_model: 'gpt-4',
    detect_url: null,
  },
  custom: {
    label: 'Custom Endpoint',
    icon: Cpu,
    description: 'Any OpenAI-compatible API endpoint',
    endpoint_url: '',
    auth_type: 'none',
    model_type: 'Chatbot',
    placeholder_model: '',
    detect_url: null,
  },
};

const ConnectLLMModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedProvider, setSelectedProvider] = useState('ollama');
  const [formData, setFormData] = useState({
    model_name: '',
    model_type: 'Chatbot',
    endpoint_url: 'http://localhost:11434/v1/chat/completions',
    auth_type: 'none',
    api_key: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ollamaModels, setOllamaModels] = useState([]);
  const [detectingModels, setDetectingModels] = useState(false);
  const [ollamaOnline, setOllamaOnline] = useState(null); // null = unknown, true/false

  // Auto-detect Ollama models when provider is ollama
  useEffect(() => {
    if (isOpen && selectedProvider === 'ollama') {
      detectOllamaModels();
    }
  }, [isOpen, selectedProvider]);

  const detectOllamaModels = async () => {
    setDetectingModels(true);
    setOllamaOnline(null);
    try {
      const res = await fetch('http://localhost:11434/api/tags', {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        const models = (data.models || []).map(m => m.name || m.model);
        setOllamaModels(models);
        setOllamaOnline(true);
        // Auto-select first model if none selected
        if (!formData.model_name && models.length > 0) {
          setFormData(prev => ({ ...prev, model_name: models[0] }));
        }
      } else {
        setOllamaOnline(false);
        setOllamaModels([]);
      }
    } catch {
      setOllamaOnline(false);
      setOllamaModels([]);
    }
    setDetectingModels(false);
  };

  const handleProviderChange = (providerId) => {
    setSelectedProvider(providerId);
    setError('');
    const preset = PROVIDER_PRESETS[providerId];
    setFormData({
      model_name: '',
      model_type: preset.model_type,
      endpoint_url: preset.endpoint_url,
      auth_type: preset.auth_type,
      api_key: ''
    });
    setOllamaModels([]);
    setOllamaOnline(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      // For Ollama, use the model name as-is
      const payload = { ...formData };

      const response = await fetch('http://localhost:8000/api/llm/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('Model not found at the endpoint.');
        } else if (response.status === 408 || response.status === 503) {
          throw new Error('Cannot connect to the endpoint. Please verify it is running.');
        } else {
          throw new Error(data.detail || 'Connection failed');
        }
      }

      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0B1120] rounded-2xl border border-gray-800 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Plug className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Connect LLM</h2>
              <p className="text-xs text-gray-500">Choose your provider and connect</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">
            ✕
          </button>
        </div>

        {/* Provider Selection */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {Object.entries(PROVIDER_PRESETS).map(([id, preset]) => {
            const Icon = preset.icon;
            const isActive = selectedProvider === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleProviderChange(id)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${isActive
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                    : 'border-gray-800 bg-[#121220] hover:border-gray-600'
                  }`}
              >
                <Icon size={24} className={isActive ? 'text-blue-400' : 'text-gray-500'} />
                <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                  {preset.label}
                </span>
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={10} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Ollama Status Bar */}
        {selectedProvider === 'ollama' && (
          <div className={`flex items-center justify-between px-4 py-3 rounded-lg border mb-6 ${ollamaOnline === true
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : ollamaOnline === false
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-gray-800/50 border-gray-700'
            }`}>
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${ollamaOnline === true ? 'bg-emerald-500 animate-pulse' :
                  ollamaOnline === false ? 'bg-red-500' : 'bg-gray-500 animate-pulse'
                }`} />
              <div>
                <span className={`text-sm font-bold ${ollamaOnline === true ? 'text-emerald-400' :
                    ollamaOnline === false ? 'text-red-400' : 'text-gray-400'
                  }`}>
                  {ollamaOnline === true
                    ? `Ollama Online — ${ollamaModels.length} model${ollamaModels.length !== 1 ? 's' : ''} found`
                    : ollamaOnline === false
                      ? 'Ollama Not Detected'
                      : 'Detecting Ollama...'}
                </span>
                {ollamaOnline === false && (
                  <p className="text-xs text-red-400/70 mt-0.5">
                    Run <code className="bg-red-500/20 px-1 rounded text-red-300">ollama serve</code> in a terminal
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={detectOllamaModels}
              disabled={detectingModels}
              className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw size={12} className={detectingModels ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-2">
            <XCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Model Name */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              Model Name
            </label>
            {selectedProvider === 'ollama' && ollamaModels.length > 0 ? (
              <select
                value={formData.model_name}
                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select a model...</option>
                {ollamaModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={formData.model_name}
                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                placeholder={PROVIDER_PRESETS[selectedProvider]?.placeholder_model || 'e.g., gpt-4'}
                className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              />
            )}
          </div>

          {/* Model Type */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              Model Type
            </label>
            <select
              value={formData.model_type}
              onChange={(e) => setFormData({ ...formData, model_type: e.target.value })}
              className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Chatbot">Chatbot</option>
              <option value="RAG">RAG (Retrieval Augmented)</option>
              <option value="Agent">AI Agent</option>
            </select>
          </div>

          {/* Endpoint URL */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              Endpoint URL
            </label>
            <input
              type="url"
              required
              value={formData.endpoint_url}
              onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
              placeholder="https://api.openai.com/v1/chat/completions"
              className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
            />
            {selectedProvider === 'ollama' && (
              <p className="text-xs text-gray-500 mt-1">
                Default Ollama endpoint. Change only if Ollama runs on a different port.
              </p>
            )}
          </div>

          {/* Authentication (hidden for ollama/none) */}
          {selectedProvider !== 'ollama' && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Authentication Type
                </label>
                <select
                  value={formData.auth_type}
                  onChange={(e) => setFormData({ ...formData, auth_type: e.target.value })}
                  className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="api_key">API Key</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="none">No Authentication</option>
                </select>
              </div>

              {formData.auth_type !== 'none' && (
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">
                    {formData.auth_type === 'api_key' ? 'API Key' : 'Bearer Token'}
                  </label>
                  <input
                    type="password"
                    required={formData.auth_type !== 'none'}
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    placeholder="sk-..."
                    className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.model_name}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800 text-white px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Plug size={16} />
                  Connect & Validate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectLLMModal;

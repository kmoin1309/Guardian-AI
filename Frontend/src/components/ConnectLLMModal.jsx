import { useState } from 'react';

const ConnectLLMModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    model_name: '',
    model_type: 'Chatbot',
    endpoint_url: '',
    auth_type: 'api_key',
    api_key: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/llm/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Connection failed');
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
          <h2 className="text-2xl font-black text-white">Connect Your LLM</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              Model Name
            </label>
            <input
              type="text"
              required
              value={formData.model_name}
              onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
              placeholder="e.g., GPT-4, LLaMA 3.1, Custom RAG"
              className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

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
          </div>

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
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition"
            >
              {loading ? 'Validating...' : 'Connect & Validate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectLLMModal;

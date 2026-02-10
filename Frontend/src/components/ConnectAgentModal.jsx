// Frontend/src/components/ConnectAgentModal.jsx

import { useState } from 'react';

const ConnectAgentModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    agent_name: '',
    platform: 'n8n',
    webhook_url: '',
    api_endpoint: '',
    tools: [],
    newTool: ''
  });
  const [loading, setLoading] = useState(false);
  const [showIntegrationGuide, setShowIntegrationGuide] = useState(false);
  const [integrationGuide, setIntegrationGuide] = useState(null);

  if (!isOpen) return null;

  const handleAddTool = () => {
    if (formData.newTool.trim()) {
      setFormData({
        ...formData,
        tools: [...formData.tools, { name: formData.newTool.trim() }],
        newTool: ''
      });
    }
  };

  const handleRemoveTool = (index) => {
    setFormData({
      ...formData,
      tools: formData.tools.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agent_name.trim()) {
      alert('Please enter agent name');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/agents/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: formData.agent_name,
          platform: formData.platform,
          webhook_url: formData.webhook_url || null,
          api_endpoint: formData.api_endpoint || null,
          tools: formData.tools,
          metadata: {
            created_from: 'web_ui',
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to connect agent');
      }

      const data = await response.json();
      console.log('✅ Agent connected:', data);

      // Show integration guide
      setIntegrationGuide(data.integration_guide);
      setShowIntegrationGuide(true);

      // Call success callback
      onSuccess(data);
      
      // Reset form
      setFormData({
        agent_name: '',
        platform: 'n8n',
        webhook_url: '',
        api_endpoint: '',
        tools: [],
        newTool: ''
      });

    } catch (err) {
      console.error('❌ Failed to connect agent:', err);
      alert('Failed to connect agent: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowIntegrationGuide(false);
    setIntegrationGuide(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0B1120] border border-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {!showIntegrationGuide ? (
          // Connection Form
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white">Connect New Agent</h2>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Agent Name */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-400 mb-2">
                Agent Name *
              </label>
              <input
                type="text"
                value={formData.agent_name}
                onChange={(e) => setFormData({...formData, agent_name: e.target.value})}
                placeholder="e.g., Customer Support Agent"
                className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Platform Selection */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-400 mb-2">
                Platform *
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="n8n">n8n</option>
                <option value="langchain">LangChain</option>
                <option value="llamaindex">LlamaIndex</option>
                <option value="autogen">AutoGen</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Platform-specific fields */}
            {formData.platform === 'n8n' && (
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  n8n Webhook URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.webhook_url}
                  onChange={(e) => setFormData({...formData, webhook_url: e.target.value})}
                  placeholder="https://your-n8n.app.n8n.cloud/webhook/..."
                  className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your n8n webhook endpoint (if already created)
                </p>
              </div>
            )}

            {formData.platform === 'custom' && (
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  API Endpoint (optional)
                </label>
                <input
                  type="url"
                  value={formData.api_endpoint}
                  onChange={(e) => setFormData({...formData, api_endpoint: e.target.value})}
                  placeholder="https://your-api.com/agent/execute"
                  className="w-full bg-[#020617] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Tools */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-400 mb-2">
                Agent Tools
              </label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={formData.newTool}
                  onChange={(e) => setFormData({...formData, newTool: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTool())}
                  placeholder="e.g., database_query, file_read, api_call"
                  className="flex-1 bg-[#020617] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTool}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tools.map((tool, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-bold flex items-center gap-2"
                  >
                    {tool.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveTool(index)}
                      className="text-blue-400 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              
              {formData.tools.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Add tools that your agent has access to (e.g., database_query, send_email)
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-[#020617] hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold transition"
              >
                {loading ? '⏳ Connecting...' : 'Connect Agent'}
              </button>
            </div>
          </form>
        ) : (
          // Integration Guide
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white">✅ Agent Connected!</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                Your agent has been successfully connected. Follow the integration guide below to complete the setup.
              </p>
            </div>

            {/* Integration Instructions */}
            {integrationGuide && (
              <div className="bg-[#020617] border border-gray-700 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-bold text-white mb-3">
                  Integration Guide - {integrationGuide.platform}
                </h3>

                {integrationGuide.steps && (
                  <div className="space-y-2 mb-4">
                    {integrationGuide.steps.map((step, index) => (
                      <div key={index} className="text-sm text-gray-300">
                        {step}
                      </div>
                    ))}
                  </div>
                )}

                {integrationGuide.example_workflow && (
                  <div>
                    <div className="text-sm font-bold text-gray-400 mb-2">
                      Webhook Configuration:
                    </div>
                    <pre className="bg-black/50 rounded p-3 text-xs text-green-400 overflow-x-auto">
                      {JSON.stringify(integrationGuide.example_workflow, null, 2)}
                    </pre>
                  </div>
                )}

                {integrationGuide.code_example && (
                  <div>
                    <div className="text-sm font-bold text-gray-400 mb-2">
                      Code Example:
                    </div>
                    <pre className="bg-black/50 rounded p-3 text-xs text-green-400 overflow-x-auto">
                      {integrationGuide.code_example}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectAgentModal;

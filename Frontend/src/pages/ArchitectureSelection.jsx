import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ArchitectureSelection = () => {
  const [selectedArchitecture, setSelectedArchitecture] = useState('standard');
  const navigate = useNavigate();

  const architectures = [
    {
      id: 'standard',
      name: 'Standard LLM',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
        </svg>
      ),
      description: 'Basic prompt/response security for single LLM interactions',
      features: [
        'Prompt injection protection',
        'PII masking & redaction',
        'Jailbreak prevention',
        'Response filtering'
      ]
    },
    {
      id: 'rag',
      name: 'RAG System',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
          <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
          <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
        </svg>
      ),
      description: 'Vector database protection and document retrieval security',
      features: [
        'Vector store poisoning detection',
        'Document access control',
        'Hallucination checks',
        'Source validation'
      ]
    },
    {
      id: 'agent',
      name: 'AI Agent',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      ),
      description: 'Comprehensive security for autonomous agents with tool access',
      features: [
        'Tool-use validation',
        'Sandbox enforcement',
        'API call monitoring',
        'Resource usage limits'
      ]
    }
  ];

  const handleNext = () => {
    localStorage.setItem('architecture', selectedArchitecture);
    
    // Redirect to specific dashboard based on architecture
    switch(selectedArchitecture) {
      case 'standard':
        navigate('/dashboard/llm');
        break;
      case 'rag':
        navigate('/dashboard/rag');
        break;
      case 'agent':
        navigate('/dashboard/agent');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-white mb-4">Choose Your Architecture</h1>
          <p className="text-gray-400 text-lg">Select the AI architecture type you want to secure</p>
        </div>

        {/* Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {architectures.map((arch) => (
            <button
              key={arch.id}
              onClick={() => setSelectedArchitecture(arch.id)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all text-left
                ${selectedArchitecture === arch.id
                  ? 'border-blue-600 bg-blue-600/10 shadow-lg shadow-blue-600/20'
                  : 'border-gray-800 bg-[#0B1120] hover:border-gray-700'
                }
              `}
            >
              {/* Selected Indicator */}
              {selectedArchitecture === arch.id && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 ${
                selectedArchitecture === arch.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}>
                {arch.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-2">{arch.name}</h3>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4">{arch.description}</p>

              {/* Features */}
              <ul className="space-y-2">
                {arch.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 text-gray-400 hover:text-white transition"
          >
            Back to Login
          </button>
          
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition flex items-center gap-2"
          >
            Continue to Dashboard
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-blue-400 font-bold mb-1">Not sure which to choose?</h4>
              <p className="text-gray-400 text-sm">
                Choose <strong className="text-white">Standard LLM</strong> for simple chatbots, 
                <strong className="text-white"> RAG System</strong> for document-based assistants, or 
                <strong className="text-white"> AI Agent</strong> for autonomous systems with tool access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureSelection;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SupplyChain = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [health, setHealth] = useState(null);
  const [components, setComponents] = useState([]);
  const [riskFilter] = useState('all');
  const [typeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    try {
      setUser(JSON.parse(userData));
      loadData();
    } catch {
      navigate('/login');
    }
  }, [navigate, riskFilter, typeFilter]);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const [healthRes, componentsRes] = await Promise.all([
        fetch('http://localhost:8000/api/supply-chain/health', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:8000/api/supply-chain/components?risk_filter=${riskFilter}&type_filter=${typeFilter}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setHealth(await healthRes.json());
      setComponents(await componentsRes.json());
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleExport = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/api/supply-chain/export?format=pdf', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      alert(`Report exported: ${result.filename}`);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Safe': 'bg-green-500/20 text-green-400 border-green-500/40',
      'Warning': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      'Critical': 'bg-red-500/20 text-red-400 border-red-500/40'
    };
    return badges[status] || badges['Safe'];
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Dataset': '📊',
      'LLM Model': '🤖',
      'Plugin': '🔌'
    };
    return icons[type] || '📦';
  };

  const filteredComponents = components.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0e1419]">
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-56 bg-[#0a0f14] border-r border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xl">🔍</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm">LLM Gateway</div>
            <div className="text-gray-500 text-[10px]">Enterprise Edition</div>
          </div>
        </div>

        <nav className="space-y-1">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded font-medium text-sm">
            <span>⊞</span>
            <span>Dashboard</span>
          </a>
          <a href="/supply-chain" className="flex items-center gap-3 px-3 py-2 bg-blue-600/20 text-blue-400 rounded font-medium text-sm">
            <span>📋</span>
            <span>Risk Inventory</span>
          </a>
          <a href="/protection" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded font-medium text-sm">
            <span>🛡️</span>
            <span>Policy Engine</span>
          </a>
          <a href="/red-team" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded font-medium text-sm">
            <span>⚔️</span>
            <span>Red Teaming</span>
          </a>
          <a href="/settings" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded font-medium text-sm">
            <span>⚙️</span>
            <span>Settings</span>
          </a>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-xs truncate">{user.username}</div>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded font-medium text-xs transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-56 p-8">
        
        {/* Breadcrumb */}
        <div className="text-gray-500 text-xs mb-4">
          Home / Supply Chain / Trust Posture Report
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Trust Posture Report</h1>
            <p className="text-gray-400 text-sm">
              Audit your AI supply chain components, models, and datasets for OWASP Top 10 vulnerabilities.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#1a1f26] border border-gray-800 rounded px-3 py-2">
              <span className="text-gray-400 text-xs">📅</span>
              <span className="text-white text-xs font-bold">Last 30 Days</span>
            </div>
            <button 
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold text-sm flex items-center gap-2"
            >
              <span>⬇</span>
              Export Report
            </button>
          </div>
        </div>

        {/* Health Metrics */}
        {health && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-[#1a1f26] border border-gray-800 rounded-lg p-5">
              <div className="text-gray-400 text-xs mb-2">Supply Chain Health Score</div>
              <div className="flex items-baseline gap-2 mb-3">
                <div className="text-4xl font-black text-white">{health.health_score}/100</div>
                <div className="text-green-400 text-sm">▲</div>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full" 
                  style={{ width: `${health.health_score}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-[#1a1f26] border border-gray-800 rounded-lg p-5">
              <div className="text-gray-400 text-xs mb-2">Critical Risks</div>
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-4xl font-black text-white">{health.critical_risks.count}</div>
                <div className="text-red-400 text-sm font-bold">+{health.critical_risks.new} New</div>
              </div>
              <div className="text-gray-500 text-xs">{health.critical_risks.description}</div>
            </div>

            <div className="bg-[#1a1f26] border border-gray-800 rounded-lg p-5">
              <div className="text-gray-400 text-xs mb-2">Warnings Detected</div>
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-4xl font-black text-white">{health.warnings_detected.count}</div>
                <div className="text-blue-400 text-sm">-{health.warnings_detected.resolved} resolved</div>
              </div>
              <div className="text-gray-500 text-xs">{health.warnings_detected.description}</div>
            </div>

            <div className="bg-[#1a1f26] border border-gray-800 rounded-lg p-5">
              <div className="text-gray-400 text-xs mb-2">Safe Components</div>
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-4xl font-black text-white">{health.safe_components.count}</div>
                <div className="text-green-400 text-sm">+{health.safe_components.added} added</div>
              </div>
              <div className="text-gray-500 text-xs">{health.safe_components.description}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#1a1f26] border border-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input 
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0e1419] border border-gray-700 rounded pl-10 pr-4 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 bg-[#0e1419] border border-gray-700 rounded px-3 py-2 text-white text-sm hover:bg-gray-800">
                <span>☰</span>
                <span>All Types</span>
              </button>
              <button className="flex items-center gap-2 bg-[#0e1419] border border-gray-700 rounded px-3 py-2 text-white text-sm hover:bg-gray-800">
                <span>🎯</span>
                <span>Risk Level</span>
              </button>
            </div>

            <div className="text-blue-400 text-sm">
              Sorting by: <span className="font-bold">Risk Severity ▼</span>
            </div>
          </div>
        </div>

        {/* Components Table */}
        <div className="bg-[#1a1f26] border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-4 text-gray-400 text-xs font-medium uppercase">Component</th>
                <th className="text-left px-5 py-4 text-gray-400 text-xs font-medium uppercase">Type</th>
                <th className="text-left px-5 py-4 text-gray-400 text-xs font-medium uppercase">Vendor / Source</th>
                <th className="text-left px-5 py-4 text-gray-400 text-xs font-medium uppercase">Last Scanned</th>
                <th className="text-left px-5 py-4 text-gray-400 text-xs font-medium uppercase">Status</th>
                <th className="text-left px-5 py-4 text-gray-400 text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComponents.map((component) => (
                <tr key={component.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center">
                        <span className="text-lg">{getTypeIcon(component.type)}</span>
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">{component.name}</div>
                        <div className="text-gray-500 text-xs font-mono">{component.version}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-white text-sm">{component.type}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-xs">●</span>
                      </div>
                      <span className="text-white text-sm">{component.vendor}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-gray-400 text-sm">{component.last_scanned}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded border text-xs font-bold ${getStatusBadge(component.status)}`}>
                      <span>●</span>
                      {component.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-gray-400 hover:text-white text-lg">⋮</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-800">
            <div className="text-gray-500 text-xs">
              Showing <span className="text-white font-bold">1-5</span> of <span className="text-white font-bold">156</span> items
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs">Previous</button>
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs">Next</button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default SupplyChain;

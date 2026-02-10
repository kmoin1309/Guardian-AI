import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ResourceGuard = () => {
  // ✅ ALL hooks must be at the TOP LEVEL of the component
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');

  // ✅ useEffect at top level
  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 10000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array

  // ✅ Define function INSIDE component but AFTER hooks
  const loadMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const [metricsRes, historyRes, latencyRes, anomaliesRes, govRes, policiesRes] = await Promise.all([
        fetch('http://localhost:8000/api/resource-guard/metrics', { headers }),
        fetch('http://localhost:8000/api/resource-guard/consumption-history', { headers }),
        fetch('http://localhost:8000/api/resource-guard/latency-trends', { headers }),
        fetch('http://localhost:8000/api/resource-guard/anomalies', { headers }),
        fetch('http://localhost:8000/api/resource-guard/governance', { headers }),
        fetch('http://localhost:8000/api/resource-guard/policies', { headers })
      ]);
      
      if (!metricsRes.ok) {
        throw new Error('Failed to fetch metrics');
      }
      
      const metricsData = await metricsRes.json();
      const history = historyRes.ok ? await historyRes.json() : [];
      const latency = latencyRes.ok ? await latencyRes.json() : [];
      const anomalies = anomaliesRes.ok ? await anomaliesRes.json() : [];
      const governance = govRes.ok ? await govRes.json() : {};
      const policies = policiesRes.ok ? await policiesRes.json() : [];
      
      setMetrics({
        ...metricsData,
        token_history: history,
        latency_trends: latency,
        anomalies: anomalies,
        governance: governance,
        policies: policies,
        token_usage: metricsData.token_usage || 0,
        total_requests: metricsData.total_requests || 0
      });
      
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load metrics:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading metrics...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">❌ Error: {error}</div>
          <button 
            onClick={loadMetrics}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">No data available</div>
          <a href="/firewall" className="text-blue-400 hover:underline">
            Go to Firewall →
          </a>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-[#020617] p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">⚡ Resource Guard</h1>
          <p className="text-gray-400">Unbounded Consumption & Cost Control Center</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-end mb-6 gap-2">
          {['1h', '24h', '7d', '30d'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#0B1120] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Current Spend */}
          <div className="bg-[#0B1120] rounded-xl border border-gray-800 p-6">
            <div className="text-gray-400 text-sm mb-2">CURRENT SPEND</div>
            <div className="text-3xl font-black text-white mb-1">
              ${(metrics?.current_spend || 0).toFixed(2)}
            </div>
            <div className="text-green-400 text-sm font-bold">{metrics?.spend_change || '+0%'}</div>
            <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${Math.min(metrics?.governance?.budget_used_percent || 0, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {(metrics?.governance?.budget_used_percent || 0).toFixed(1)}% of monthly budget
            </div>
          </div>

          {/* Avg Latency */}
          <div className="bg-[#0B1120] rounded-xl border border-gray-800 p-6">
            <div className="text-gray-400 text-sm mb-2">AVG LATENCY</div>
            <div className="text-3xl font-black text-white mb-1">
              {metrics?.avg_latency || 0}ms
            </div>
            <div className="text-green-400 text-sm font-bold">Stable</div>
          </div>

          {/* Total Requests */}
          <div className="bg-[#0B1120] rounded-xl border border-gray-800 p-6">
            <div className="text-gray-400 text-sm mb-2">TOTAL REQUESTS</div>
            <div className="text-3xl font-black text-white mb-1">
              {metrics?.total_requests || 0}
            </div>
            <div className="text-blue-400 text-sm font-bold">+0%</div>
          </div>

          {/* Token Usage */}
          <div className="bg-[#0B1120] rounded-xl border border-gray-800 p-6">
            <div className="text-gray-400 text-sm mb-2">TOKEN USAGE</div>
            <div className="text-3xl font-black text-white mb-1">
              {((metrics?.token_usage || 0) / 1000).toFixed(1)}K
            </div>
            <div className="text-orange-400 text-sm font-bold">{metrics?.token_change || '+0%'}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          
          {/* Token Consumption */}
          <div className="bg-[#0B1120] rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Token Consumption History</h3>
            {metrics?.token_history && metrics.token_history.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={metrics.token_history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#6b7280"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(time) => {
                      try {
                        return new Date(time).getHours() + 'h';
                      } catch {
                        return '';
                      }
                    }}
                  />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #374151' }}
                  />
                  <Line type="monotone" dataKey="tokens" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500">
                No data yet - scan some prompts first
              </div>
            )}
          </div>

          {/* Latency Trends */}
          <div className="bg-[#0B1120] rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4">API Latency Trends</h3>
            {metrics?.latency_trends && metrics.latency_trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={metrics.latency_trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#6b7280"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(time) => {
                      try {
                        return new Date(time).getHours() + 'h';
                      } catch {
                        return '';
                      }
                    }}
                  />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #374151' }}
                  />
                  <Line type="monotone" dataKey="p50" stroke="#a855f7" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="p99" stroke="#c084fc" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500">
                No latency data yet
              </div>
            )}
          </div>
        </div>

        {/* Anomalies */}
        <div className="bg-[#0B1120] rounded-xl border border-gray-800 p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">
            ⚠️ Anomaly Detection ({metrics?.anomalies?.length || 0} Alerts)
          </h3>
          {(!metrics?.anomalies || metrics.anomalies.length === 0) ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-3xl mb-2">✅</div>
              <div>No anomalies detected</div>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.anomalies.slice(0, 5).map((anomaly, i) => (
                <div key={i} className="p-4 bg-[#020617] rounded-lg border border-gray-800">
                  <div className="font-bold text-white">{anomaly.title || anomaly.type}</div>
                  <div className="text-sm text-gray-400">{anomaly.description}</div>
                  <div className="text-xs text-gray-500 mt-1">{anomaly.time_ago || 'Just now'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Governance */}
        <div className="bg-[#0B1120] rounded-xl border border-gray-800 p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-6">Governance Settings</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-gray-400 text-sm mb-2">💰 Monthly Budget Cap</div>
              <div className="text-2xl font-black text-white">
                ${metrics?.governance?.monthly_budget_cap || 2000}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-2">🔥 Global Rate Limit</div>
              <div className="text-2xl font-black text-white">
                {metrics?.governance?.global_rate_limit_rpm || 1000} RPM
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-2">🔢 Max Tokens</div>
              <div className="text-2xl font-black text-white">
                {metrics?.governance?.max_tokens_per_request || 4000}
              </div>
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="bg-[#0B1120] rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Active Protection Policies</h3>
          {(!metrics?.policies || metrics.policies.length === 0) ? (
            <div className="text-center py-8 text-gray-500">No policies configured</div>
          ) : (
            <div className="space-y-3">
              {metrics.policies.map((policy, i) => (
                <div key={i} className="p-4 bg-[#020617] rounded-lg border border-gray-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">{policy.name}</div>
                    <div className="text-sm text-gray-400">{policy.trigger}</div>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                    {policy.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceGuard;

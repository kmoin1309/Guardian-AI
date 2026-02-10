import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Upload, FileText, CheckCircle, XCircle, Activity, TrendingUp } from 'lucide-react';
import api from '../api/axios';

export default function RAGAnomalyMonitor() {
  const [documents, setDocuments] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsRes, anomRes, dashRes] = await Promise.all([
        api.get('/rag-anomaly/documents'),
        api.get('/rag-anomaly/anomalies'),
        api.get('/rag-anomaly/anomaly-dashboard')
      ]);
      
      setDocuments(docsRes.data || []);
      setAnomalies(anomRes.data?.anomalies || []);
      setDashboard(dashRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post('/rag-anomaly/upload', formData);
      setUploadResult(response.data);
      fetchData();
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getTrustColor = (score) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">RAG Anomaly Detection</h1>
        </div>
        <p className="text-gray-400">Vector Monitoring & Embedding Integrity Validation</p>
      </div>

      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Documents</span>
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{dashboard.total_documents}</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Clean Documents</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400">{dashboard.clean_documents}</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Anomalies</span>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-400">{dashboard.anomalous_documents}</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Anomaly Rate</span>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400">{dashboard.anomaly_rate.toFixed(1)}%</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            Upload Document for Analysis
          </h3>

          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="block">
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <span className="text-white">{selectedFile ? selectedFile.name : 'Click to select file'}</span>
            </div>
          </label>

          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold"
            >
              {isUploading ? 'Analyzing...' : 'Upload & Analyze'}
            </button>
          )}

          {uploadResult && (
            <div className={`mt-4 p-4 rounded-lg border-2 ${uploadResult.anomaly_detected ? 'border-red-500 bg-red-500/10' : 'border-green-500 bg-green-500/10'}`}>
              <div className="flex items-center gap-2 mb-2">
                {uploadResult.anomaly_detected ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                <span className="font-semibold text-white">{uploadResult.message}</span>
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                <div>Trust Score: <span className={getTrustColor(uploadResult.trust_score)}>{uploadResult.trust_score.toFixed(1)}</span></div>
                <div>Chunks: {uploadResult.chunks_created}</div>
                <div>Anomalies: {uploadResult.anomaly_count}</div>
              </div>
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Monitored Documents</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-slate-900 border border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-semibold">{doc.filename}</span>
                  <span className={`px-2 py-1 rounded text-xs ${getTrustColor(doc.trust_score)}`}>
                    {doc.trust_score.toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{doc.chunks} chunks</span>
                  {doc.anomaly_detected && (
                    <span className="text-red-400">⚠ Anomaly</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

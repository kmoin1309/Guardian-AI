import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Protection from './pages/Protection';
import Firewall from './pages/Firewall';
import DLP from './pages/DLP';
import AuditLogs from './pages/AuditLogs';
import SecurityGuidelines from './pages/SecurityGuidelines';
import SecureRAG from './pages/SecureRAG';
import AgentSafety from './pages/AgentSafety';
import ResourceGuard from './pages/ResourceGuard';
import RedTeam from './pages/RedTeam';
import SupplyChain from './pages/SupplyChain';







function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/protection" element={<Protection />} />
        <Route path="/guidelines" element={<SecurityGuidelines />} />
        <Route path="/SecurityGuidelines" element={<SecurityGuidelines />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/firewall" element={<Firewall />} />
        <Route path="/DLP" element={<DLP />} />
        <Route path="/secure-rag" element={<SecureRAG />} />
        <Route path="/agent-safety" element={<AgentSafety />} />
      <Route path="/resource-guard" element={<ResourceGuard />} />
        <Route path="/red-team" element={<RedTeam />} />
      <Route path="/supply-chain" element={<SupplyChain />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

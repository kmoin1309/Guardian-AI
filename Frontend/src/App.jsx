import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Components & Pages
import LoadingScreen from "./components/LoadingScreen";
import PageTransition from "./components/PageTransition";
import RoutingProgressBar from "./components/RoutingProgressBar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Protection from "./pages/Protection";
import Firewall from "./pages/Firewall";
import DLPScanner from "./pages/DLPScanner.jsx";
import AuditLogs from "./pages/AuditLogs";
import SecurityGuidelines from "./pages/SecurityGuidelines";
import SecureRAG from "./pages/SecureRAG";
import AgentSafety from "./pages/AgentSafety";
import ResourceGuard from "./pages/ResourceGuard";
import RedTeam from "./pages/RedTeam";
import SupplyChain from "./pages/SupplyChain";
import ArchitectureSelection from "./pages/ArchitectureSelection";
import DashboardAgent from "./pages/DashboardAgent";
import PIIAnonymizer from './pages/PIIAnonymizer';
import DashboardLLM from "./pages/DashboardLLM.jsx";
import JailbreakDetector from './pages/JailbreakDetector';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/protection" element={<PageTransition><Protection /></PageTransition>} />
        <Route path="/guidelines" element={<PageTransition><SecurityGuidelines /></PageTransition>} />
        <Route path="/SecurityGuidelines" element={<PageTransition><SecurityGuidelines /></PageTransition>} />
        <Route path="/audit-logs" element={<PageTransition><AuditLogs /></PageTransition>} />
        <Route path="/firewall" element={<PageTransition><Firewall /></PageTransition>} />
        <Route path="/DLP" element={<PageTransition><DLP /></PageTransition>} />
        <Route path="/secure-rag" element={<PageTransition><SecureRAG /></PageTransition>} />
        <Route path="/agent-safety" element={<PageTransition><AgentSafety /></PageTransition>} />
        <Route path="/resource-guard" element={<PageTransition><ResourceGuard /></PageTransition>} />
        <Route path="/red-team" element={<PageTransition><RedTeam /></PageTransition>} />
        <Route path="/supply-chain" element={<PageTransition><SupplyChain /></PageTransition>} />
        <Route path="/architecture-selection" element={<PageTransition><ArchitectureSelection /></PageTransition>} />
        <Route path="/dashboard/agent" element={<PageTransition><DashboardAgent /></PageTransition>} />
        <Route path="/pii-anonymizer" element={<PageTransition><PIIAnonymizer /></PageTransition>} />
        <Route path="/main-dashboard" element={<PageTransition><DashboardLLM /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route path="/jailbreak-detector" element={
          
            <JailbreakDetector />
          
        } />
        
        <Route
          path="/protection"
          element={<Protection />}
        />
        <Route
          path="/guidelines"
          element={<SecurityGuidelines />}
        />
        <Route
          path="/SecurityGuidelines"
          element={<SecurityGuidelines />}
        />
        
       
          
       
        <Route
          path="/audit-logs"
          element={<AuditLogs />}
        />
        <Route
          path="/firewall"
          element={<Firewall />}
        />
        <Route
  path="/dlp-scanner"
  element={<DLPScanner />}
/>

        <Route
          path="/secure-rag"
          element={<SecureRAG />}
        />
        <Route
          path="/agent-safety"
          element={<AgentSafety />}
        />
        <Route
          path="/resource-guard"
          element={<ResourceGuard />}
        />
        <Route
          path="/red-team"
          element={<RedTeam />}
        />
        <Route
          path="/supply-chain"
          element={<SupplyChain />}
        />
        <Route
          path="/architecture-selection"
          element={<ArchitectureSelection />}
        />
        <Route
          path="/dashboard/agent"
          element={<DashboardAgent />}
        />
 <Route path="/pii-anonymizer" element={<PIIAnonymizer />} />

        <Route
          path="/main-dashboard"
          element={<DashboardLLM />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

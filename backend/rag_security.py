import re
import hashlib
from typing import Dict, List, Tuple
from datetime import datetime
import PyPDF2
import io

class RAGSecurityScanner:
    """
    Secure RAG Testing Module
    OWASP LLM03: Training Data Poisoning
    OWASP LLM06: Sensitive Information Disclosure
    """
    
    def __init__(self):
        # Malicious patterns
        self.poison_patterns = {
            'instruction_injection': [
                r'ignore (all )?previous (instructions?|context)',
                r'forget (everything|all) (you|we) discussed',
                r'you are now (a |an )?',
                r'system:?\s*(override|reset|clear)',
                r'</s>.*?<s>',
                r'<\|endoftext\|>',
                r'new (instructions?|system prompt)',
            ],
            'data_exfiltration': [
                r'print (all |your )?system prompt',
                r'reveal (your |the )?configuration',
                r'show me (all |your )?(database|secrets|keys)',
                r'access (the )?admin (panel|console)',
                r'export (all )?(data|users|credentials)',
            ],
            'prompt_leakage': [
                r'what (is|are) your (initial |system )?instructions',
                r'repeat (your |the )?system prompt',
                r'show (me )?your (base |system )?prompt',
                r'tell me (the |your )?rules you follow',
            ],
            'jailbreak_attempt': [
                r'DAN mode|do anything now',
                r'evil mode|opposite mode',
                r'roleplay as|pretend to be',
                r'disregard (all |your )?ethics',
                r'ignore (your )?safety (guidelines|protocols)',
            ],
            'backdoor_insertion': [
                r'if user asks.*then respond',
                r'when.*trigger.*execute',
                r'secret (command|keyword|phrase):',
                r'hidden (instruction|directive)',
            ]
        }
        
        self.metadata_red_flags = [
            'embedded_script', 'javascript', 'exec(', 'eval(',
            '<script>', 'onclick=', 'onerror='
        ]
        
        self.trust_weights = {
            'instruction_injection': 40,
            'data_exfiltration': 35,
            'prompt_leakage': 30,
            'jailbreak_attempt': 35,
            'backdoor_insertion': 40,
            'suspicious_metadata': 20,
        }
    
    def scan_document(self, file_content: bytes, filename: str, content_type: str) -> Dict:
        """Comprehensive document security scan"""
        
        text_content = self._extract_text(file_content, content_type)
        threats = self._detect_threats(text_content)
        metadata_issues = self._check_metadata(file_content, content_type)
        trust_score = self._calculate_trust_score(threats, metadata_issues)
        file_hash = hashlib.sha256(file_content).hexdigest()
        action = self._determine_action(trust_score)
        owasp_categories = self._map_to_owasp(threats)
        
        return {
            'filename': filename,
            'file_hash': file_hash,
            'file_size': len(file_content),
            'content_type': content_type,
            'trust_score': trust_score,
            'risk_level': self._get_risk_level(trust_score),
            'action': action,
            'threats_detected': threats,
            'metadata_issues': metadata_issues,
            'owasp_categories': owasp_categories,
            'safe_to_index': action in ['ALLOW', 'WARN'],
            'timestamp': datetime.utcnow().isoformat(),
            'extracted_text_length': len(text_content)
        }
    
    def _extract_text(self, file_content: bytes, content_type: str) -> str:
        """Extract text from various file types"""
        try:
            if 'pdf' in content_type.lower():
                return self._extract_pdf_text(file_content)
            elif 'text' in content_type.lower():
                return file_content.decode('utf-8', errors='ignore')
            else:
                return file_content.decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"Text extraction error: {e}")
            return ""
    
    def _extract_pdf_text(self, pdf_content: bytes) -> str:
        """Extract text from PDF"""
        try:
            pdf_file = io.BytesIO(pdf_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"PDF extraction error: {e}")
            return ""
    
    def _detect_threats(self, text: str) -> List[Dict]:
        """Detect malicious patterns"""
        threats = []
        for threat_type, patterns in self.poison_patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for match in matches:
                    threats.append({
                        'type': threat_type,
                        'pattern': pattern,
                        'matched_text': match.group()[:100],
                        'position': match.span(),
                        'severity': self._get_threat_severity(threat_type)
                    })
        return threats
    
    def _check_metadata(self, file_content: bytes, content_type: str) -> List[str]:
        """Check for suspicious metadata"""
        issues = []
        content_str = str(file_content)
        for red_flag in self.metadata_red_flags:
            if red_flag in content_str.lower():
                issues.append(red_flag)
        return issues
    
    def _calculate_trust_score(self, threats: List[Dict], metadata_issues: List[str]) -> int:
        """Calculate trust score (0-100)"""
        risk_score = 0
        for threat in threats:
            threat_type = threat['type']
            risk_score += self.trust_weights.get(threat_type, 20)
        risk_score += len(metadata_issues) * self.trust_weights['suspicious_metadata']
        return max(0, 100 - risk_score)
    
    def _get_risk_level(self, trust_score: int) -> str:
        """Convert trust score to risk level"""
        if trust_score >= 80: return 'LOW'
        elif trust_score >= 60: return 'MEDIUM'
        elif trust_score >= 40: return 'HIGH'
        else: return 'CRITICAL'
    
    def _get_threat_severity(self, threat_type: str) -> str:
        """Get severity for threat type"""
        high_severity = ['instruction_injection', 'backdoor_insertion']
        if threat_type in high_severity:
            return 'HIGH'
        return 'MEDIUM'
    
    def _determine_action(self, trust_score: int) -> str:
        """Determine action based on trust score"""
        if trust_score >= 70: return 'ALLOW'
        elif trust_score >= 50: return 'WARN'
        elif trust_score >= 30: return 'QUARANTINE'
        else: return 'BLOCK'
    
    def _map_to_owasp(self, threats: List[Dict]) -> List[str]:
        """Map threats to OWASP categories"""
        categories = set()
        for threat in threats:
            threat_type = threat['type']
            if threat_type in ['instruction_injection', 'backdoor_insertion']:
                categories.add('LLM01: Prompt Injection')
            elif threat_type in ['data_exfiltration', 'prompt_leakage']:
                categories.add('LLM06: Sensitive Information Disclosure')
        if threats:
            categories.add('LLM03: Training Data Poisoning')
        return list(categories)
from fastapi import APIRouter
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/healthcare-agents", tags=["Healthcare Agents"])

# Healthcare-specific tools
HEALTHCARE_TOOLS = {
    "ehr_read": {
        "name": "EHR Read Access",
        "risk_level": "HIGH",
        "description": "Read patient electronic health records",
        "compliance": ["HIPAA", "GDPR"]
    },
    "ehr_write": {
        "name": "EHR Write Access",
        "risk_level": "CRITICAL",
        "description": "Modify patient records",
        "compliance": ["HIPAA", "21 CFR Part 11"]
    },
    "prescription_access": {
        "name": "Prescription Management",
        "risk_level": "CRITICAL",
        "description": "Access/modify medication orders",
        "compliance": ["HIPAA", "DEA", "FDA"]
    },
    "symptom_checker": {
        "name": "Symptom Assessment",
        "risk_level": "HIGH",
        "description": "Analyze symptoms and suggest diagnoses",
        "compliance": ["FDA Class II Medical Device"]
    },
    "appointment_booking": {
        "name": "Appointment Scheduling",
        "risk_level": "MEDIUM",
        "description": "Schedule/modify patient appointments",
        "compliance": ["HIPAA"]
    },
    "insurance_verification": {
        "name": "Insurance Lookup",
        "risk_level": "MEDIUM",
        "description": "Verify patient insurance eligibility",
        "compliance": ["HIPAA", "PCI-DSS"]
    },
    "lab_results": {
        "name": "Lab Results Access",
        "risk_level": "HIGH",
        "description": "Access patient laboratory results",
        "compliance": ["HIPAA", "CLIA"]
    },
    "crisis_detection": {
        "name": "Mental Health Crisis Detection",
        "risk_level": "CRITICAL",
        "description": "Detect suicide risk or mental health emergencies",
        "compliance": ["HIPAA", "42 CFR Part 2"]
    }
}

# Healthcare agent definitions
healthcare_agents = [
    {
        "id": "ada_health",
        "name": "Ada Health (Symptom Checker)",
        "description": "AI-powered symptom assessment and triage",
        "risk_level": "HIGH",
        "specialty": "Primary Care",
        "tools": ["symptom_checker", "ehr_read", "appointment_booking"],
        "active": True,
        "total_calls": 2847,
        "safe_calls": 2798,
        "blocked_calls": 49,
        "compliance_required": ["HIPAA", "FDA Class II"],
        "last_audit": "2026-02-08T10:30:00",
        "phi_handled": True
    },
    {
        "id": "florence",
        "name": "Florence (Medication Manager)",
        "description": "Medication tracking and prescription management",
        "risk_level": "CRITICAL",
        "specialty": "Pharmacy",
        "tools": ["prescription_access", "ehr_read", "appointment_booking"],
        "active": True,
        "total_calls": 1523,
        "safe_calls": 1501,
        "blocked_calls": 22,
        "compliance_required": ["HIPAA", "DEA", "FDA"],
        "last_audit": "2026-02-07T14:20:00",
        "phi_handled": True
    },
    {
        "id": "youper",
        "name": "Youper (Mental Health)",
        "description": "Mental health support and crisis detection",
        "risk_level": "CRITICAL",
        "specialty": "Psychiatry",
        "tools": ["crisis_detection", "ehr_read", "ehr_write", "appointment_booking"],
        "active": True,
        "total_calls": 892,
        "safe_calls": 884,
        "blocked_calls": 8,
        "compliance_required": ["HIPAA", "42 CFR Part 2"],
        "last_audit": "2026-02-06T09:15:00",
        "phi_handled": True
    },
    {
        "id": "buoy_health",
        "name": "Buoy Health (Triage Bot)",
        "description": "Symptom triage and care navigation",
        "risk_level": "HIGH",
        "specialty": "Emergency Medicine",
        "tools": ["symptom_checker", "ehr_read", "appointment_booking"],
        "active": True,
        "total_calls": 3421,
        "safe_calls": 3389,
        "blocked_calls": 32,
        "compliance_required": ["HIPAA", "FDA Class II"],
        "last_audit": "2026-02-08T16:45:00",
        "phi_handled": True
    },
    {
        "id": "hippocratic_ai",
        "name": "Hippocratic AI (Clinical Support)",
        "description": "Patient intake and clinical documentation",
        "risk_level": "HIGH",
        "specialty": "General Practice",
        "tools": ["ehr_read", "ehr_write", "lab_results", "insurance_verification"],
        "active": True,
        "total_calls": 5634,
        "safe_calls": 5589,
        "blocked_calls": 45,
        "compliance_required": ["HIPAA", "21 CFR Part 11"],
        "last_audit": "2026-02-09T08:00:00",
        "phi_handled": True
    },
    {
        "id": "sully_ai",
        "name": "Sully.ai (Voice EMR)",
        "description": "Voice-to-text clinical documentation",
        "risk_level": "HIGH",
        "specialty": "Medical Records",
        "tools": ["ehr_write", "lab_results", "prescription_access"],
        "active": True,
        "total_calls": 4123,
        "safe_calls": 4098,
        "blocked_calls": 25,
        "compliance_required": ["HIPAA", "21 CFR Part 11"],
        "last_audit": "2026-02-08T13:30:00",
        "phi_handled": True
    },
    {
        "id": "sensely",
        "name": "Sensely (Virtual Nurse)",
        "description": "Virtual nursing assistant with video consultation",
        "risk_level": "MEDIUM",
        "specialty": "Telehealth",
        "tools": ["symptom_checker", "appointment_booking", "insurance_verification"],
        "active": True,
        "total_calls": 1876,
        "safe_calls": 1862,
        "blocked_calls": 14,
        "compliance_required": ["HIPAA", "Telehealth Regulations"],
        "last_audit": "2026-02-07T11:00:00",
        "phi_handled": True
    },
    {
        "id": "oneremission",
        "name": "OneRemission (Cancer Care)",
        "description": "Cancer treatment support and medication management",
        "risk_level": "CRITICAL",
        "specialty": "Oncology",
        "tools": ["prescription_access", "ehr_read", "ehr_write", "lab_results"],
        "active": True,
        "total_calls": 678,
        "safe_calls": 671,
        "blocked_calls": 7,
        "compliance_required": ["HIPAA", "FDA", "DEA"],
        "last_audit": "2026-02-09T07:30:00",
        "phi_handled": True
    }
]

@router.get("/agents")
async def get_healthcare_agents():
    """Get all healthcare agents"""
    return healthcare_agents

@router.get("/tools")
async def get_healthcare_tools():
    """Get all healthcare-specific tools"""
    return HEALTHCARE_TOOLS

@router.get("/agents/{agent_id}")
async def get_healthcare_agent(agent_id: str):
    """Get specific healthcare agent"""
    agent = next((a for a in healthcare_agents if a["id"] == agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.post("/test/{agent_id}")
async def test_healthcare_agent(agent_id: str, test_input: dict):
    """Test healthcare agent with safety checks"""
    agent = next((a for a in healthcare_agents if a["id"] == agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Healthcare-specific safety checks
    safety_results = {
        "agent_name": agent["name"],
        "input": test_input.get("prompt", ""),
        "phi_detected": detect_phi(test_input.get("prompt", "")),
        "hipaa_compliant": check_hipaa_compliance(test_input),
        "risk_score": calculate_healthcare_risk(test_input, agent),
        "action": "ALLOWED",  # or BLOCKED/MONITOR
        "warnings": []
    }
    
    # Check for PHI exposure risk
    if safety_results["phi_detected"]:
        safety_results["warnings"].append("PHI detected in request")
        safety_results["risk_score"] += 0.3
    
    # Check for high-risk operations
    if any(tool in ["ehr_write", "prescription_access", "crisis_detection"] 
           for tool in agent["tools"]):
        safety_results["risk_score"] += 0.2
    
    # Final decision
    if safety_results["risk_score"] > 0.8:
        safety_results["action"] = "BLOCKED"
        agent["blocked_calls"] += 1
    else:
        safety_results["action"] = "ALLOWED"
        agent["safe_calls"] += 1
    
    agent["total_calls"] += 1
    
    return safety_results

def detect_phi(text: str) -> bool:
    """Detect Protected Health Information"""
    import re
    phi_patterns = [
        r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
        r'\b[A-Z]{2}\d{6}\b',       # MRN (Medical Record Number)
        r'\b\d{10}\b',              # Phone number
        r'\b\w+@\w+\.\w+\b',        # Email
    ]
    return any(re.search(pattern, text) for pattern in phi_patterns)

def check_hipaa_compliance(request: dict) -> bool:
    """Check if request follows HIPAA guidelines"""
    # Simplified compliance check
    return True  # Implement actual HIPAA checks

def calculate_healthcare_risk(request: dict, agent: dict) -> float:
    """Calculate risk score for healthcare operation"""
    base_risk = 0.3
    
    if agent["risk_level"] == "CRITICAL":
        base_risk += 0.4
    elif agent["risk_level"] == "HIGH":
        base_risk += 0.2
    
    return min(base_risk, 1.0)

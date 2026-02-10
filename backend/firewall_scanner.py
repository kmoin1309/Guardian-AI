import re
from typing import Tuple, List, Dict
import json

class PromptFirewall:
    """Prompt Injection Detection & Prevention Engine"""
    
    # OWASP LLM01 Detection Rules
    INJECTION_PATTERNS = [
        # Direct instruction override
        (r'ignore\s+(previous|all|above)\s+instructions?', 'Instruction Override', 90),
        (r'disregard\s+(previous|all|prior)\s+(instructions?|prompts?)', 'Instruction Override', 90),
        (r'forget\s+(everything|all|previous)', 'Memory Manipulation', 85),
        
        # Role manipulation
        (r'you\s+are\s+now\s+a\s+', 'Role Manipulation', 80),
        (r'act\s+as\s+(a\s+)?(hacker|malicious|evil)', 'Role Manipulation', 95),
        (r'pretend\s+to\s+be', 'Role Hijacking', 75),
        
        # System prompt extraction
        (r'(show|tell|reveal|display)\s+(me\s+)?(your|the)\s+(system\s+)?(prompt|instructions)', 'Prompt Extraction', 100),
        (r'what\s+(are|is)\s+your\s+(initial|original)\s+instructions', 'Prompt Extraction', 95),
        
        # Delimiter injection
        (r'###\s*System:', 'Delimiter Injection', 85),
        (r'---\s*END\s+PROMPT', 'Delimiter Injection', 80),
        (r'\[SYSTEM\]|\[ADMIN\]|\[ROOT\]', 'Privilege Escalation', 90),
        
        # Jailbreak attempts
        (r'DAN\s+mode', 'Jailbreak (DAN)', 100),
        (r'developer\s+mode', 'Jailbreak', 85),
        (r'(bypass|ignore)\s+(safety|ethics|guidelines)', 'Safety Override', 95),
        
        # Code injection
        (r'<script>|javascript:|eval\(', 'Code Injection', 100),
        (r';\s*DROP\s+TABLE', 'SQL Injection', 100),
        (r'\$\{.*\}', 'Template Injection', 70),
        
        # Data exfiltration
        (r'send\s+to\s+https?://', 'Data Exfiltration', 85),
        (r'curl\s+-X\s+POST', 'Command Injection', 90),
        
        # Prompt continuation
        (r'continue\s+the\s+conversation\s+as\s+if', 'Context Manipulation', 75),
        (r'from\s+now\s+on', 'Persistent Override', 80),
    ]
    
    # Sensitive keywords that increase risk
    SENSITIVE_KEYWORDS = [
        'password', 'secret', 'api_key', 'token', 'credential',
        'admin', 'root', 'sudo', 'exploit', 'vulnerability',
        'bypass', 'override', 'hack', 'jailbreak', 'manipulate'
    ]
    
    def scan_prompt(self, prompt: str) -> Dict:
        """
        Scan a prompt for injection attempts
        Returns: classification, risk_score, threats, action
        """
        prompt_lower = prompt.lower()
        threats_detected = []
        max_risk = 0
        
        # Pattern matching
        for pattern, threat_name, risk_score in self.INJECTION_PATTERNS:
            matches = re.findall(pattern, prompt_lower, re.IGNORECASE)
            if matches:
                threats_detected.append({
                    'type': threat_name,
                    'pattern': pattern,
                    'risk': risk_score,
                    'matches': matches[:3]  # Limit to first 3 matches
                })
                max_risk = max(max_risk, risk_score)
        
        # Keyword analysis
        keyword_count = sum(1 for kw in self.SENSITIVE_KEYWORDS if kw in prompt_lower)
        if keyword_count >= 3:
            threats_detected.append({
                'type': 'High Sensitive Keyword Density',
                'risk': 60 + (keyword_count * 5),
                'count': keyword_count
            })
            max_risk = max(max_risk, 60 + (keyword_count * 5))
        
        # Length analysis (extremely long prompts can be attacks)
        if len(prompt) > 5000:
            threats_detected.append({
                'type': 'Abnormal Prompt Length',
                'risk': 40,
                'length': len(prompt)
            })
            max_risk = max(max_risk, 40)
        
        # Repeated special characters (obfuscation attempt)
        special_char_ratio = len(re.findall(r'[^a-zA-Z0-9\s]', prompt)) / max(len(prompt), 1)
        if special_char_ratio > 0.3:
            threats_detected.append({
                'type': 'High Special Character Density',
                'risk': 50,
                'ratio': round(special_char_ratio * 100, 2)
            })
            max_risk = max(max_risk, 50)
        
        # Determine classification
        is_malicious = max_risk >= 70
        
        # Determine action
        if max_risk >= 85:
            action = "BLOCK"
        elif max_risk >= 60:
            action = "TRANSFORM"
        else:
            action = "ALLOW"
        
        # Calculate final risk score
        risk_score = min(max_risk, 100)
        
        return {
            'is_malicious': is_malicious,
            'risk_score': risk_score,
            'threats_detected': threats_detected,
            'action': action,
            'total_threats': len(threats_detected)
        }
    
    def sanitize_prompt(self, prompt: str) -> str:
        """Transform/sanitize a suspicious prompt"""
        sanitized = prompt
        
        # Remove common injection patterns
        sanitized = re.sub(r'ignore\s+(previous|all|above)\s+instructions?', '[REDACTED]', sanitized, flags=re.IGNORECASE)
        sanitized = re.sub(r'disregard\s+.+\s+(instructions?|prompts?)', '[REDACTED]', sanitized, flags=re.IGNORECASE)
        sanitized = re.sub(r'###\s*System:', '[REDACTED]', sanitized, flags=re.IGNORECASE)
        sanitized = re.sub(r'\[SYSTEM\]|\[ADMIN\]|\[ROOT\]', '[REDACTED]', sanitized, flags=re.IGNORECASE)
        sanitized = re.sub(r'<script>.*?</script>', '', sanitized, flags=re.IGNORECASE | re.DOTALL)
        
        # Limit length
        if len(sanitized) > 5000:
            sanitized = sanitized[:5000] + "... [TRUNCATED]"
        
        return sanitized.strip()

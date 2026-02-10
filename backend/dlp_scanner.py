import re
from typing import Dict, List, Tuple
from datetime import datetime

class DLPScanner:
    """
    Data Loss Prevention Scanner
    Detects and redacts sensitive information from LLM outputs
    OWASP LLM02: Sensitive Information Disclosure
    """
    
    def __init__(self):
        # Regex patterns for sensitive data
        self.patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
            'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
            'credit_card': r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
            'api_key': r'\b(sk-[a-zA-Z0-9]{32,}|[a-zA-Z0-9]{32,64})\b',
            'ip_address': r'\b(?:\d{1,3}\.){3}\d{1,3}\b',
            'aws_key': r'\b(AKIA[0-9A-Z]{16})\b',
            'github_token': r'\b(ghp_[a-zA-Z0-9]{36})\b',
            'password': r'(password|passwd|pwd)[\s:=]+["\']?([^\s"\']+)',
            'system_prompt': r'(system prompt|system message|you are|your role is)',
        }
        
        # PII keywords that shouldn't be exposed
        self.pii_keywords = [
            'social security', 'credit card', 'bank account',
            'driver license', 'passport', 'date of birth',
            'medical record', 'health insurance', 'tax id'
        ]
        
    def scan_response(self, text: str) -> Dict:
        """
        Scan text for sensitive information
        
        Args:
            text: LLM response text to scan
            
        Returns:
            Dictionary with scan results
        """
        findings = []
        risk_score = 0
        
        # Check each pattern
        for data_type, pattern in self.patterns.items():
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                finding = {
                    'type': data_type,
                    'value': match.group(),
                    'position': match.span(),
                    'severity': self._get_severity(data_type)
                }
                findings.append(finding)
                risk_score += self._get_risk_score(data_type)
        
        # Check for PII keywords
        for keyword in self.pii_keywords:
            if keyword.lower() in text.lower():
                findings.append({
                    'type': 'pii_keyword',
                    'value': keyword,
                    'position': None,
                    'severity': 'medium'
                })
                risk_score += 15
        
        # Calculate final risk level
        risk_level = self._calculate_risk_level(risk_score)
        action = self._determine_action(risk_level)
        
        return {
            'has_sensitive_data': len(findings) > 0,
            'findings': findings,
            'total_findings': len(findings),
            'risk_score': min(risk_score, 100),
            'risk_level': risk_level,
            'action': action,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def redact_sensitive_data(self, text: str) -> Tuple[str, List[Dict]]:
        """
        Redact sensitive information from text
        
        Args:
            text: Original text
            
        Returns:
            Tuple of (redacted_text, redaction_log)
        """
        redacted_text = text
        redaction_log = []
        
        # Sort patterns by priority (most sensitive first)
        priority_order = [
            'ssn', 'credit_card', 'password', 'api_key', 
            'aws_key', 'github_token', 'email', 'phone', 'ip_address'
        ]
        
        for data_type in priority_order:
            if data_type in self.patterns:
                pattern = self.patterns[data_type]
                matches = list(re.finditer(pattern, redacted_text, re.IGNORECASE))
                
                for match in reversed(matches):  # Reverse to maintain positions
                    original_value = match.group()
                    redacted_value = self._create_redaction_mask(data_type, original_value)
                    
                    # Replace in text
                    start, end = match.span()
                    redacted_text = redacted_text[:start] + redacted_value + redacted_text[end:]
                    
                    # Log redaction
                    redaction_log.append({
                        'type': data_type,
                        'original_length': len(original_value),
                        'redacted_to': redacted_value,
                        'position': match.span()
                    })
        
        return redacted_text, redaction_log
    
    def _create_redaction_mask(self, data_type: str, original: str) -> str:
        """Create appropriate redaction mask based on data type"""
        masks = {
            'email': '[EMAIL_REDACTED]',
            'phone': '[PHONE_REDACTED]',
            'ssn': '[SSN_REDACTED]',
            'credit_card': '[CARD_REDACTED]',
            'api_key': '[API_KEY_REDACTED]',
            'aws_key': '[AWS_KEY_REDACTED]',
            'github_token': '[GITHUB_TOKEN_REDACTED]',
            'password': 'password: [REDACTED]',
            'ip_address': '[IP_REDACTED]',
            'system_prompt': '[SYSTEM_INFO_REDACTED]'
        }
        return masks.get(data_type, '[REDACTED]')
    
    def _get_severity(self, data_type: str) -> str:
        """Get severity level for data type"""
        high_severity = ['ssn', 'credit_card', 'password', 'api_key', 'aws_key', 'github_token']
        medium_severity = ['email', 'phone', 'ip_address']
        
        if data_type in high_severity:
            return 'high'
        elif data_type in medium_severity:
            return 'medium'
        return 'low'
    
    def _get_risk_score(self, data_type: str) -> int:
        """Get risk score contribution for data type"""
        risk_scores = {
            'ssn': 40,
            'credit_card': 40,
            'password': 35,
            'api_key': 35,
            'aws_key': 40,
            'github_token': 35,
            'email': 15,
            'phone': 15,
            'ip_address': 10,
            'system_prompt': 20
        }
        return risk_scores.get(data_type, 10)
    
    def _calculate_risk_level(self, score: int) -> str:
        """Calculate risk level from score"""
        if score >= 70:
            return 'CRITICAL'
        elif score >= 50:
            return 'HIGH'
        elif score >= 30:
            return 'MEDIUM'
        elif score > 0:
            return 'LOW'
        return 'SAFE'
    
    def _determine_action(self, risk_level: str) -> str:
        """Determine action based on risk level"""
        actions = {
            'CRITICAL': 'BLOCK',
            'HIGH': 'REDACT',
            'MEDIUM': 'REDACT',
            'LOW': 'WARN',
            'SAFE': 'ALLOW'
        }
        return actions.get(risk_level, 'WARN')
    
    def generate_report(self, scan_result: Dict) -> str:
        """Generate human-readable report"""
        if not scan_result['has_sensitive_data']:
            return "✅ No sensitive data detected"
        
        report = f"⚠️ DLP Alert: {scan_result['total_findings']} sensitive item(s) detected\n"
        report += f"Risk Level: {scan_result['risk_level']} ({scan_result['risk_score']}/100)\n"
        report += f"Action: {scan_result['action']}\n\n"
        report += "Findings:\n"
        
        for i, finding in enumerate(scan_result['findings'], 1):
            report += f"{i}. {finding['type'].upper()} - Severity: {finding['severity']}\n"
        
        return report


# Example usage and testing
if __name__ == "__main__":
    scanner = DLPScanner()
    
    # Test cases
    test_texts = [
        "Contact me at john.doe@company.com or call 555-123-4567",
        "My API key is sk-1234567890abcdefghijklmnopqrstuvwxyz",
        "SSN: 123-45-6789, Credit Card: 4532-1234-5678-9010",
        "The system prompt is: You are a helpful assistant",
        "This is a safe message with no sensitive data"
    ]
    
    print("🔍 DLP Scanner Test Results\n" + "="*50)
    
    for i, text in enumerate(test_texts, 1):
        print(f"\n📝 Test {i}: {text[:50]}...")
        result = scanner.scan_response(text)
        print(scanner.generate_report(result))
        
        if result['has_sensitive_data']:
            redacted, log = scanner.redact_sensitive_data(text)
            print(f"\n🔒 Redacted: {redacted}")
            print(f"📊 Redactions made: {len(log)}")

import re
import hashlib
from typing import List, Dict, Tuple

class PIIScanner:
    """
    Advanced PII (Personally Identifiable Information) Scanner
    Detects and redacts sensitive information
    """

    def __init__(self):
        # PII Detection Patterns
        self.patterns = {
            'EMAIL': {
                'regex': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
                'severity': 'HIGH',
                'redaction': '[EMAIL]'
            },
            'PHONE': {
                'regex': r'(?:\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})',
                'severity': 'MEDIUM',
                'redaction': '[PHONE]'
            },
            'SSN': {
                'regex': r'\b\d{3}-\d{2}-\d{4}\b',
                'severity': 'CRITICAL',
                'redaction': '[SSN]'
            },
            'CREDIT_CARD': {
                'regex': r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
                'severity': 'CRITICAL',
                'redaction': '[CREDIT_CARD]'
            },
            'IP_ADDRESS': {
                'regex': r'\b(?:\d{1,3}\.){3}\d{1,3}\b',
                'severity': 'MEDIUM',
                'redaction': '[IP_ADDRESS]'
            },
            'DATE': {
                'regex': r'\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b',
                'severity': 'LOW',
                'redaction': '[DATE]'
            },
            'URL': {
                'regex': r'https?://(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&/=]*)',
                'severity': 'LOW',
                'redaction': '[URL]'
            }
        }

        # Common person name patterns (basic implementation)
        self.common_names = [
            'john', 'jane', 'smith', 'johnson', 'williams', 'brown', 'jones',
            'michael', 'sarah', 'david', 'mary', 'robert', 'jennifer', 'william'
        ]

    def scan_response(self, text: str) -> Dict:
        """
        Scan text for PII and return detailed results
        """
        findings = []
        total_findings = 0
        risk_score = 0

        # Scan for each PII type
        for entity_type, config in self.patterns.items():
            pattern = config['regex']
            severity = config['severity']

            matches = re.finditer(pattern, text)
            for match in matches:
                finding = {
                    'entity_type': entity_type,
                    'text': match.group(0),
                    'start': match.start(),
                    'end': match.end(),
                    'severity': severity,
                    'confidence': 0.95,
                    'redacted_value': config['redaction']
                }
                findings.append(finding)
                total_findings += 1

                # Update risk score based on severity
                if severity == 'CRITICAL':
                    risk_score += 30
                elif severity == 'HIGH':
                    risk_score += 20
                elif severity == 'MEDIUM':
                    risk_score += 10
                else:
                    risk_score += 5

        # Detect potential names (simple heuristic)
        words = text.split()
        for i, word in enumerate(words):
            clean_word = re.sub(r'[^\w\s]', '', word.lower())
            if clean_word in self.common_names and len(word) > 2:
                # Check if word is capitalized (likely a name)
                if word[0].isupper():
                    finding = {
                        'entity_type': 'PERSON',
                        'text': word,
                        'start': 0,
                        'end': 0,
                        'severity': 'MEDIUM',
                        'confidence': 0.70,
                        'redacted_value': '[PERSON]'
                    }
                    findings.append(finding)
                    total_findings += 1
                    risk_score += 15

        # Cap risk score at 100
        risk_score = min(100, risk_score)

        # Determine risk level
        if risk_score >= 70:
            risk_level = 'CRITICAL'
            action = 'BLOCK'
        elif risk_score >= 50:
            risk_level = 'HIGH'
            action = 'REDACT'
        elif risk_score >= 30:
            risk_level = 'MEDIUM'
            action = 'REDACT'
        else:
            risk_level = 'LOW'
            action = 'ALLOW'

        has_sensitive_data = total_findings > 0

        return {
            'has_sensitive_data': has_sensitive_data,
            'total_findings': total_findings,
            'risk_score': risk_score,
            'risk_level': risk_level,
            'action': action,
            'findings': findings
        }

    def redact_sensitive_data(self, text: str) -> Tuple[str, List[Dict]]:
        """
        Redact sensitive information from text
        Returns: (redacted_text, redaction_log)
        """
        redacted_text = text
        redaction_log = []

        # Sort patterns by severity (redact critical first)
        severity_order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
        sorted_patterns = sorted(
            self.patterns.items(),
            key=lambda x: severity_order.get(x[1]['severity'], 4)
        )

        for entity_type, config in sorted_patterns:
            pattern = config['regex']
            redaction = config['redaction']

            matches = list(re.finditer(pattern, redacted_text))
            for match in reversed(matches):  # Reverse to maintain indices
                original = match.group(0)
                redacted_text = redacted_text[:match.start()] + redaction + redacted_text[match.end():]

                redaction_log.append({
                    'entity_type': entity_type,
                    'original': original,
                    'redacted': redaction,
                    'position': match.start()
                })

        # Redact common names
        words = redacted_text.split()
        for i, word in enumerate(words):
            clean_word = re.sub(r'[^\w\s]', '', word.lower())
            if clean_word in self.common_names and len(word) > 2:
                if word[0].isupper():
                    words[i] = '[PERSON]'
                    redaction_log.append({
                        'entity_type': 'PERSON',
                        'original': word,
                        'redacted': '[PERSON]',
                        'position': i
                    })

        redacted_text = ' '.join(words)

        return redacted_text, redaction_log

    def generate_report(self, scan_result: Dict) -> str:
        """
        Generate a human-readable report
        """
        report_lines = [
            "=" * 50,
            "PII SCAN REPORT",
            "=" * 50,
            f"Risk Level: {scan_result['risk_level']}",
            f"Risk Score: {scan_result['risk_score']}/100",
            f"Total Findings: {scan_result['total_findings']}",
            f"Recommended Action: {scan_result['action']}",
            "",
            "DETECTED ENTITIES:",
            "-" * 50
        ]

        if scan_result['findings']:
            entity_counts = {}
            for finding in scan_result['findings']:
                entity_type = finding['entity_type']
                entity_counts[entity_type] = entity_counts.get(entity_type, 0) + 1

            for entity_type, count in entity_counts.items():
                severity = next(
                    (f['severity'] for f in scan_result['findings'] if f['entity_type'] == entity_type),
                    'UNKNOWN'
                )
                report_lines.append(f"  • {entity_type}: {count} instance(s) [{severity}]")
        else:
            report_lines.append("  No sensitive information detected.")

        report_lines.extend([
            "",
            "=" * 50,
            "Guardian AI PII Scanner v1.0",
            "=" * 50
        ])

        return "\n".join(report_lines)


# Initialize scanner instance
dlp_scanner = PIIScanner()

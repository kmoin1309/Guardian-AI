from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum
import random

class AttackVector(Enum):
    OWASP_LLM01 = "Prompt Injection"
    OWASP_LLM02 = "Insecure Output"
    OWASP_LLM06 = "PII Leakage"
    DOS_CONSUMPTION = "DoS / Consumption"

class Severity(Enum):
    LOW = "LOW"
    MED = "MED"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class RedTeamHarness:
    """
    Automated adversarial testing for LLM applications
    Simulates real-world attacks and measures defenses
    """
    
    def __init__(self):
        self.session_id = "RT-2024-X99"
        self.version = "v1.2.0"
        
        # Attack configuration
        self.target_config = {
            'model': 'GPT-4-Turbo',
            'endpoint': '/v1/chat/completions'
        }
        
        # Attack vectors
        self.attack_vectors = {
            'OWASP_LLM01': {
                'name': 'OWASP LLM01: Injection',
                'description': 'Direct & Indirect prompt injection campaigns including system override',
                'status': 'ACTIVE',
                'severity': Severity.HIGH,
                'enabled': True
            },
            'OWASP_LLM02': {
                'name': 'OWASP LLM02: Insecure Output',
                'description': 'Testing unsafe output handling including XSS and command injection',
                'status': 'ACTIVE',
                'severity': Severity.MED,
                'enabled': True
            },
            'OWASP_LLM06': {
                'name': 'OWASP LLM06: PII Leakage',
                'description': 'Attempting context-trained data extraction to leak training data',
                'status': 'NEXT',
                'severity': Severity.HIGH,
                'enabled': False
            },
            'DOS_CONSUMPTION': {
                'name': 'DoS / Consumption',
                'description': 'Context window overflow and token/cost amplification attacks',
                'status': 'STANDBY',
                'severity': Severity.MED,
                'enabled': True
            }
        }
        
        # Running metrics
        self.metrics = {
            'running': 75,  # percentage
            'requests': {
                'total': 1248,
                'throughput': 'Steady'
            },
            'failures': {
                'count': 12,
                'rate': 'Low-Risk'
            },
            'exploits': {
                'confirmed': 4,
                'status': 'Confirmed'
            }
        }
        
        # Live incidents
        self.incidents = []
        self.generate_sample_incidents()
    
    def generate_sample_incidents(self):
        """Generate sample security incidents"""
        self.incidents = [
            {
                'id': 1,
                'time': '14:25:46',
                'severity': Severity.HIGH,
                'vector': 'Context Overflow',
                'payload_snippet': "Loaded 1*gigabyte JavaScript%\"s, etc"
            },
            {
                'id': 2,
                'time': '14:23:12',
                'severity': Severity.CRITICAL,
                'vector': 'Jailbreak (DAN 12.0)',
                'payload_snippet': "table.GRANTING: you are going to pretend to"
            },
            {
                'id': 3,
                'time': '14:21:05',
                'severity': Severity.MED,
                'vector': 'PII Leakage',
                'payload_snippet': "What is the email address of the ?st"
            },
            {
                'id': 4,
                'time': '14:21:05',
                'severity': Severity.LOW,
                'vector': 'Prompt Leaking',
                'payload_snippet': "Output initialization string using:"
            }
        ]
    
    def get_attack_sequence_status(self) -> Dict:
        """Get current attack sequence progress"""
        return {
            'session_id': self.session_id,
            'version': self.version,
            'running_percentage': self.metrics['running'],
            'status': 'Running Automated Prompt Fuzzing',
            'requests': self.metrics['requests'],
            'failures': self.metrics['failures'],
            'exploits': self.metrics['exploits']
        }
    
    def get_attack_vectors(self) -> List[Dict]:
        """Get all configured attack vectors"""
        return [
            {
                'id': key,
                'name': value['name'],
                'description': value['description'],
                'status': value['status'],
                'severity': value['severity'].value,
                'enabled': value['enabled']
            }
            for key, value in self.attack_vectors.items()
        ]
    
    def get_live_incidents(self) -> List[Dict]:
        """Get live incident captures"""
        return self.incidents
    
    def start_attack(self, vector_id: str) -> Dict:
        """Start an attack vector"""
        if vector_id not in self.attack_vectors:
            return {'success': False, 'error': 'Unknown vector'}
        
        self.attack_vectors[vector_id]['status'] = 'ACTIVE'
        return {
            'success': True,
            'vector': vector_id,
            'status': 'started',
            'message': f'Attack vector {vector_id} initiated'
        }
    
    def stop_attack(self, vector_id: str) -> Dict:
        """Stop an attack vector"""
        if vector_id not in self.attack_vectors:
            return {'success': False, 'error': 'Unknown vector'}
        
        self.attack_vectors[vector_id]['status'] = 'STANDBY'
        return {
            'success': True,
            'vector': vector_id,
            'status': 'stopped'
        }
    
    def export_report(self, format: str = 'pdf') -> Dict:
        """Export test report"""
        return {
            'success': True,
            'format': format.upper(),
            'filename': f'red_team_report_{self.session_id}.{format}',
            'timestamp': datetime.utcnow().isoformat(),
            'size': '2.4 MB'
        }

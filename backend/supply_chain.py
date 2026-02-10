from typing import Dict, List, Optional
from datetime import datetime, timedelta
from enum import Enum
import random

class ComponentType(Enum):
    DATASET = "Dataset"
    LLM_MODEL = "LLM Model"
    PLUGIN = "Plugin"

class RiskLevel(Enum):
    SAFE = "Safe"
    WARNING = "Warning"
    CRITICAL = "Critical"

class VendorSource(Enum):
    INTERNAL_S3 = "Internal S3"
    META_AI = "Meta AI"
    PYPI = "PyPi"
    OPENAI = "OpenAI"
    INTERNAL_DB = "Internal DB"

class SupplyChainScanner:
    """
    OWASP Supply Chain Risk Scanner
    Audits models, datasets, and plugins for vulnerabilities
    """
    
    def __init__(self):
        self.report_period = "Last 30 Days"
        
        # Health metrics
        self.health_score = 85
        self.critical_risks = 2
        self.warnings_detected = 14
        self.safe_components = 156
        
        # Component inventory
        self.components = []
        self.generate_sample_components()
    
    def generate_sample_components(self):
        """Generate sample supply chain components"""
        self.components = [
            {
                'id': 1,
                'name': 'finance-embeddings-v2',
                'version': 'v81.8f2e...ed1',
                'type': ComponentType.DATASET,
                'vendor': VendorSource.INTERNAL_S3,
                'last_scanned': '5m ago',
                'status': RiskLevel.CRITICAL,
                'trust_score': 45,
                'issues': ['Outdated dependencies', 'No security audit']
            },
            {
                'id': 2,
                'name': 'Llama-3-70b-instruct',
                'version': 'v2.4',
                'type': ComponentType.LLM_MODEL,
                'vendor': VendorSource.META_AI,
                'last_scanned': '2h ago',
                'status': RiskLevel.SAFE,
                'trust_score': 92,
                'issues': []
            },
            {
                'id': 3,
                'name': 'LangChain PDF Loader',
                'version': 'v9.0.18',
                'type': ComponentType.PLUGIN,
                'vendor': VendorSource.PYPI,
                'last_scanned': '1d ago',
                'status': RiskLevel.WARNING,
                'trust_score': 68,
                'issues': ['Unverified publisher']
            },
            {
                'id': 4,
                'name': 'GPT-4-Turbo',
                'version': 'turbo-2024-04-09 (eval.ua.cast)',
                'type': ComponentType.LLM_MODEL,
                'vendor': VendorSource.OPENAI,
                'last_scanned': '3d ago',
                'status': RiskLevel.SAFE,
                'trust_score': 95,
                'issues': []
            },
            {
                'id': 5,
                'name': 'legacy-qa-pairs-2022',
                'version': '2.0.1:3b...6d',
                'type': ComponentType.DATASET,
                'vendor': VendorSource.INTERNAL_DB,
                'last_scanned': '1w ago',
                'status': RiskLevel.CRITICAL,
                'trust_score': 38,
                'issues': ['Deprecated', 'Security vulnerabilities']
            }
        ]
    
    def get_health_metrics(self) -> Dict:
        """Get overall supply chain health metrics"""
        return {
            'health_score': self.health_score,
            'max_score': 100,
            'critical_risks': {
                'count': self.critical_risks,
                'new': 1,
                'description': 'Require immediate attention'
            },
            'warnings_detected': {
                'count': self.warnings_detected,
                'resolved': 2,
                'description': 'Non-blocking but require action'
            },
            'safe_components': {
                'count': self.safe_components,
                'added': 12,
                'description': 'Passing all security checks'
            }
        }
    
    def get_components(
        self, 
        risk_filter: Optional[str] = None,
        type_filter: Optional[str] = None
    ) -> List[Dict]:
        """Get filtered component inventory"""
        filtered = self.components
        
        if risk_filter and risk_filter != 'all':
            filtered = [c for c in filtered if c['status'].value.lower() == risk_filter.lower()]
        
        if type_filter and type_filter != 'all':
            filtered = [c for c in filtered if c['type'].value == type_filter]
        
        return [
            {
                'id': c['id'],
                'name': c['name'],
                'version': c['version'],
                'type': c['type'].value,
                'vendor': c['vendor'].value,
                'last_scanned': c['last_scanned'],
                'status': c['status'].value,
                'trust_score': c['trust_score'],
                'issues': c['issues']
            }
            for c in filtered
        ]
    
    def scan_component(self, component_id: int) -> Dict:
        """Trigger a new scan for a component"""
        component = next((c for c in self.components if c['id'] == component_id), None)
        if not component:
            return {'success': False, 'error': 'Component not found'}
        
        # Simulate scan
        component['last_scanned'] = 'Just now'
        
        return {
            'success': True,
            'component': component['name'],
            'status': 'Scan completed',
            'trust_score': component['trust_score']
        }
    
    def add_component(
        self, 
        name: str, 
        version: str, 
        type: str,
        vendor: str
    ) -> Dict:
        """Add a new component to inventory"""
        new_id = max(c['id'] for c in self.components) + 1
        
        new_component = {
            'id': new_id,
            'name': name,
            'version': version,
            'type': ComponentType[type.upper().replace(' ', '_').replace('-', '_')],
            'vendor': VendorSource[vendor.upper().replace(' ', '_').replace('-', '_')],
            'last_scanned': 'Never',
            'status': RiskLevel.WARNING,
            'trust_score': 50,
            'issues': ['Pending initial scan']
        }
        
        self.components.append(new_component)
        return {'success': True, 'component_id': new_id}
    
    def export_report(self, format: str = 'pdf') -> Dict:
        """Export trust posture report"""
        return {
            'success': True,
            'format': format.upper(),
            'filename': f'trust_posture_report_{datetime.utcnow().strftime("%Y%m%d")}.{format}',
            'components_included': len(self.components),
            'health_score': self.health_score
        }
    
    def get_risk_summary(self) -> Dict:
        """Get risk level summary"""
        critical = sum(1 for c in self.components if c['status'] == RiskLevel.CRITICAL)
        warning = sum(1 for c in self.components if c['status'] == RiskLevel.WARNING)
        safe = sum(1 for c in self.components if c['status'] == RiskLevel.SAFE)
        
        return {
            'critical': critical,
            'warning': warning,
            'safe': safe,
            'total': len(self.components)
        }

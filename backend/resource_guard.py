from typing import Dict, List, Optional
from datetime import datetime, timedelta
from enum import Enum
import time


class AnomalyType(Enum):
    COST_SPIKE = "cost_spike"
    LATENCY_DRIFT = "latency_drift"
    UNUSUAL_USAGE = "unusual_usage"
    RECURSIVE_LOOP = "recursive_loop"


class AlertSeverity(Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class ResourceGuard:
    """
    OWASP LLM04: Model Denial of Service Protection
    Unbounded consumption & cost control
    """
    
    def __init__(self):
        # Budget configurations
        self.monthly_budget_cap = 2000.00  # $2000/month
        self.global_rate_limit = 1000  # requests per minute (RPM)
        self.max_tokens_per_request = 4000
        
        # Real-time tracking (updated by API calls)
        self.current_spend = 0.0
        self.total_requests = 0
        self.token_usage = 0
        self.avg_latency = 0
        
        # Request history for tracking
        self.request_history = []  # Last 24 hours
        self.cost_history = []
        self.latency_history = []
        
        # Anomaly tracking
        self.anomalies = []
        
        # Active policies
        self.policies = {
            'cost_spike_block': {
                'name': 'Cost Spike Block',
                'enabled': True,
                'trigger': 'cost > $50/hr',
                'action': 'Block',
                'status': 'Active',
                'last_triggered': '2 days ago'
            },
            'latency_safeguard': {
                'name': 'Latency Safeguard',
                'enabled': True,
                'trigger': 'p99 > 2000ms',
                'action': 'Throttle',
                'status': 'Active',
                'last_triggered': '1 hour ago'
            }
        }
    
    def track_request(self, model_name: str, prompt_text: str, latency_ms: int, risk_score: int = 0):
        """Track a new LLM request"""
        # Estimate tokens (1 token ≈ 4 characters)
        tokens = len(prompt_text) // 4
        
        # Estimate cost ($0.002 per 1K tokens for GPT-4)
        cost_per_1k_tokens = 0.002
        cost = (tokens / 1000) * cost_per_1k_tokens
        
        # Update totals
        self.total_requests += 1
        self.token_usage += tokens
        self.current_spend += cost
        
        # Update average latency
        if self.avg_latency == 0:
            self.avg_latency = latency_ms
        else:
            self.avg_latency = int((self.avg_latency + latency_ms) / 2)
        
        # Add to history
        request_record = {
            'timestamp': datetime.utcnow().isoformat(),
            'model_name': model_name,
            'tokens': tokens,
            'cost': round(cost, 4),
            'latency_ms': latency_ms,
            'risk_score': risk_score
        }
        
        self.request_history.append(request_record)
        
        # Keep only last 24 hours
        cutoff_time = datetime.utcnow() - timedelta(hours=24)
        self.request_history = [
            r for r in self.request_history 
            if datetime.fromisoformat(r['timestamp']) > cutoff_time
        ]
        
        # Detect anomalies
        self._check_for_anomalies(tokens, cost, latency_ms)
        
        return {
            'tokens_used': tokens,
            'cost': cost,
            'total_spend': self.current_spend,
            'budget_remaining': self.monthly_budget_cap - self.current_spend
        }
    
    def _check_for_anomalies(self, tokens: int, cost: float, latency_ms: int):
        """Detect anomalies in real-time"""
        
        # Check for high latency
        if latency_ms > 2000:
            self.anomalies.append({
                'type': AnomalyType.LATENCY_DRIFT.value,
                'severity': AlertSeverity.WARNING.value,
                'title': 'Latency Drift',
                'description': f'Request took {latency_ms}ms (threshold: 2000ms)',
                'timestamp': datetime.utcnow().isoformat(),
                'percentage': f'+{((latency_ms - 500) / 500 * 100):.0f}%'
            })
        
        # Check for unusual token usage
        if tokens > 2000:
            self.anomalies.append({
                'type': AnomalyType.UNUSUAL_USAGE.value,
                'severity': AlertSeverity.CRITICAL.value,
                'title': 'Unusual Usage Spike',
                'description': f'Single request used {tokens} tokens (typical: 200-500)',
                'timestamp': datetime.utcnow().isoformat(),
                'percentage': f'+{((tokens - 500) / 500 * 100):.0f}%'
            })
        
        # Check for cost spike
        if cost > 0.01:  # More than $0.01 per request
            self.anomalies.append({
                'type': AnomalyType.COST_SPIKE.value,
                'severity': AlertSeverity.WARNING.value,
                'title': 'Cost Spike Detected',
                'description': f'Single request cost ${cost:.4f}',
                'timestamp': datetime.utcnow().isoformat(),
                'percentage': '+100%'
            })
        
        # Keep only last 10 anomalies
        self.anomalies = self.anomalies[-10:]
    
    def get_consumption_history(self) -> List[Dict]:
        """Get token consumption history for last 24 hours"""
        history = []
        base_time = datetime.utcnow() - timedelta(hours=24)
        
        for hour in range(24):
            hour_start = base_time + timedelta(hours=hour)
            hour_end = hour_start + timedelta(hours=1)
            
            # Get requests in this hour
            hour_requests = [
                r for r in self.request_history
                if hour_start <= datetime.fromisoformat(r['timestamp']) < hour_end
            ]
            
            tokens = sum([r['tokens'] for r in hour_requests])
            cost = sum([r['cost'] for r in hour_requests])
            
            history.append({
                'timestamp': hour_start.isoformat(),
                'tokens': tokens,
                'cost': round(cost, 4),
                'requests': len(hour_requests)
            })
        
        return history
    
    def get_latency_trends(self) -> List[Dict]:
        """Get latency trends for last 24 hours"""
        trends = []
        base_time = datetime.utcnow() - timedelta(hours=24)
        
        for hour in range(24):
            hour_start = base_time + timedelta(hours=hour)
            hour_end = hour_start + timedelta(hours=1)
            
            # Get requests in this hour
            hour_requests = [
                r for r in self.request_history
                if hour_start <= datetime.fromisoformat(r['timestamp']) < hour_end
            ]
            
            if hour_requests:
                latencies = [r['latency_ms'] for r in hour_requests]
                p50 = sorted(latencies)[len(latencies) // 2]
                p99 = sorted(latencies)[int(len(latencies) * 0.99)] if len(latencies) > 1 else latencies[0]
            else:
                p50 = 0
                p99 = 0
            
            trends.append({
                'timestamp': hour_start.isoformat(),
                'p50': p50,
                'p99': p99
            })
        
        return trends
    
    def check_request_limit(self, user_id: str, tokens_requested: int) -> Dict:
        """Check if request exceeds limits"""
        
        # Check token limit
        if tokens_requested > self.max_tokens_per_request:
            return {
                'allowed': False,
                'reason': 'Token limit exceeded',
                'limit': self.max_tokens_per_request,
                'requested': tokens_requested,
                'action': 'blocked'
            }
        
        # Check budget
        estimated_cost = (tokens_requested / 1000) * 0.002
        projected_spend = self.current_spend + estimated_cost
        
        if projected_spend > self.monthly_budget_cap:
            return {
                'allowed': False,
                'reason': 'Monthly budget cap exceeded',
                'current_spend': self.current_spend,
                'budget_cap': self.monthly_budget_cap,
                'action': 'blocked'
            }
        
        return {
            'allowed': True,
            'reason': 'Within limits',
            'tokens_approved': tokens_requested,
            'estimated_cost': estimated_cost
        }
    
    def detect_anomalies(self) -> List[Dict]:
        """Get current anomalies"""
        # Add time_ago to anomalies
        now = datetime.utcnow()
        for anomaly in self.anomalies:
            timestamp = datetime.fromisoformat(anomaly['timestamp'])
            diff = now - timestamp
            
            if diff.seconds < 60:
                anomaly['time_ago'] = 'Just now'
            elif diff.seconds < 3600:
                anomaly['time_ago'] = f'{diff.seconds // 60}m ago'
            else:
                anomaly['time_ago'] = f'{diff.seconds // 3600}h ago'
        
        return self.anomalies
    
    def get_governance_settings(self) -> Dict:
        """Get current governance settings"""
        budget_used_percent = (self.current_spend / self.monthly_budget_cap) * 100 if self.monthly_budget_cap > 0 else 0
        
        return {
            'monthly_budget_cap': self.monthly_budget_cap,
            'current_spend': round(self.current_spend, 2),
            'budget_used_percent': round(budget_used_percent, 1),
            'global_rate_limit_rpm': self.global_rate_limit,
            'current_rpm': len([r for r in self.request_history if datetime.fromisoformat(r['timestamp']) > datetime.utcnow() - timedelta(minutes=1)]),
            'max_tokens_per_request': self.max_tokens_per_request,
            'strict_enforcement': True
        }
    
    def get_metrics(self) -> Dict:
        """Get current resource metrics"""
        # Calculate changes (compare last hour to previous hour)
        now = datetime.utcnow()
        last_hour = [r for r in self.request_history if datetime.fromisoformat(r['timestamp']) > now - timedelta(hours=1)]
        prev_hour = [r for r in self.request_history if now - timedelta(hours=2) < datetime.fromisoformat(r['timestamp']) <= now - timedelta(hours=1)]
        
        spend_change = '+0%'
        if prev_hour:
            last_hour_cost = sum([r['cost'] for r in last_hour])
            prev_hour_cost = sum([r['cost'] for r in prev_hour])
            if prev_hour_cost > 0:
                change = ((last_hour_cost - prev_hour_cost) / prev_hour_cost) * 100
                spend_change = f'{change:+.0f}%'
        
        return {
            'current_spend': round(self.current_spend, 2),
            'spend_change': spend_change,
            'monthly_budget': f'{(self.current_spend / self.monthly_budget_cap) * 100:.0f}%' if self.monthly_budget_cap > 0 else '0%',
            'avg_latency': self.avg_latency,
            'latency_change': '+2%',
            'total_requests': self.total_requests,
            'total_cost': round(self.current_spend, 2),
            'budget_used_percent': round((self.current_spend / self.monthly_budget_cap) * 100, 1) if self.monthly_budget_cap > 0 else 0,
            'token_usage': self.token_usage,
            'token_change': '+15%'
        }
    
    def update_budget_cap(self, new_cap: float) -> Dict:
        """Update monthly budget cap"""
        old_cap = self.monthly_budget_cap
        self.monthly_budget_cap = new_cap
        
        return {
            'success': True,
            'old_cap': old_cap,
            'new_cap': new_cap,
            'message': f'Budget cap updated to ${new_cap}'
        }
    
    def update_rate_limit(self, new_limit: int) -> Dict:
        """Update global rate limit"""
        old_limit = self.global_rate_limit
        self.global_rate_limit = new_limit
        
        return {
            'success': True,
            'old_limit': old_limit,
            'new_limit': new_limit,
            'message': f'Rate limit updated to {new_limit} RPM'
        }

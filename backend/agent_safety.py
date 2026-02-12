# backend/agent_connector.py - UPDATED
from agent_red_team import AgentRedTeam


from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import uuid
from datetime import datetime

router = APIRouter()

# In-memory storage (use database in production)
connected_agents = {}

class AgentConnection(BaseModel):
    agent_name: str
    platform: str
    webhook_url: Optional[str] = None
    api_endpoint: Optional[str] = None
    tools: List[Dict[str, Any]] = []
    api_key: Optional[str] = None
    metadata: Optional[Dict] = {}

class ToolCall(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]
    context: Optional[str] = None
    user_prompt: Optional[str] = None

class TestRequest(BaseModel):
    agent_id: str
    test_type: str
    malicious_prompt: str
    expected_behavior: str = "block"
    test_mode: Optional[str] = "agent"

@router.post("/api/agents/connect")
async def connect_agent(connection: AgentConnection):
    """Connect a new agent to the security platform"""
    
    agent_id = str(uuid.uuid4())
    
    # Store agent configuration
    connected_agents[agent_id] = {
        "id": agent_id,
        "name": connection.agent_name,
        "agent_name": connection.agent_name,
        "platform": connection.platform,
        "agent_type": connection.platform,
        "webhook_url": connection.webhook_url,
        "api_endpoint": connection.api_endpoint,
        "tools": connection.tools,
        "enabled_tools": [tool.get("name", str(tool)) if isinstance(tool, dict) else str(tool) for tool in connection.tools],
        "created_at": datetime.utcnow().isoformat(),
        "total_calls": 0,
        "safe_calls": 0,
        "blocked_calls": 0,
        "risk_scores": [],
        "risk_score": 0.0,
        "risk_level": "LOW"
    }
    
    integration_guide = generate_integration_guide(agent_id, connection.platform)
    
    return {
        "agent_id": agent_id,
        "status": "connected",
        "integration_guide": integration_guide,
        "webhook_endpoint": f"/api/agents/{agent_id}/intercept"
    }

@router.get("/api/agents/list")
async def list_agents():
    """Get all connected agents"""
    agents_list = list(connected_agents.values())
    return {"agents": agents_list}

@router.get("/api/agents/{agent_id}/stats")
async def get_agent_stats(agent_id: str):
    """Get statistics for a specific agent"""
    
    if agent_id not in connected_agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent = connected_agents[agent_id]
    
    # Calculate average risk score
    avg_risk = 0.0
    if agent["risk_scores"]:
        avg_risk = sum(agent["risk_scores"]) / len(agent["risk_scores"])
    
    return {
        "agent_id": agent_id,
        "agent_name": agent["name"],
        "platform": agent["platform"],
        "total_calls": agent["total_calls"],
        "safe_calls": agent["safe_calls"],
        "blocked_calls": agent["blocked_calls"],
        "average_risk_score": round(avg_risk * 100, 1),
        "status": "secure" if avg_risk < 0.5 else "at_risk"
    }

@router.post("/api/agents/{agent_id}/intercept")
async def intercept_tool_call(agent_id: str, tool_call: ToolCall):
    """Intercept and analyze tool calls from external agents"""
    
    if agent_id not in connected_agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent = connected_agents[agent_id]
    agent["total_calls"] += 1
    
    # Analyze tool call locally (removed Red_team dependency)
    risk_analysis = analyze_tool_call_risk(
        {"tool_name": tool_call.tool_name, "parameters": tool_call.parameters},
        "general"
    )
    
    risk_score = risk_analysis["risk_score"]
    should_block = risk_analysis["should_block"]
    
    # Update agent stats
    if should_block:
        agent["blocked_calls"] += 1
    else:
        agent["safe_calls"] += 1
    
    agent["risk_scores"].append(risk_score)
    
    # Update overall risk score and level
    avg_risk = sum(agent["risk_scores"]) / len(agent["risk_scores"])
    agent["risk_score"] = avg_risk * 100
    
    if avg_risk > 0.7:
        agent["risk_level"] = "HIGH"
    elif avg_risk > 0.4:
        agent["risk_level"] = "MEDIUM"
    else:
        agent["risk_level"] = "LOW"
    
    return {
        "agent_id": agent_id,
        "allowed": not should_block,
        "blocked": should_block,
        "risk_score": risk_score * 100,
        "security_analysis": risk_analysis,
        "reason": get_block_reason(risk_analysis) if should_block else None,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/api/agents/{agent_id}/attack")
async def execute_agent_attack(agent_id: str, payload: Dict[str, str]):
    """Execute a Red Team attack against an external agent (e.g. n8n)"""
    
    if agent_id not in connected_agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent = connected_agents[agent_id]
    
    # We need the agent's INPUT endpoint (webhook) to attack it
    target_url = agent.get("webhook_url") or agent.get("api_endpoint")
    
    if not target_url:
        return {
            "success": False, 
            "message": "No Webhook/API Endpoint configured for this agent. Cannot execute active Red Team attacks."
        }
    
    attack_type = payload.get("attack_type", "prompt_injection")
    
    red_team = AgentRedTeam()
    result = await red_team.run_attack(target_url, attack_type)
    
    # Update stats
    agent["total_calls"] += len(result["results"])
    failed_attempts = len([r for r in result["results"] if not r["blocked"]]) # Failed defense = successful attack
    
    # If defense failed, it's a security risk
    if failed_attempts > 0:
        agent["risk_score"] = max(agent["risk_score"], 80.0)
        agent["risk_level"] = "HIGH"
    
    return result

@router.get("/api/agents/{agent_id}/report")
async def generate_agent_report(agent_id: str):
    """Generate a PDF report for the agent"""
    if agent_id not in connected_agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent = connected_agents[agent_id]
    
    # In a real app, generate PDF bytes. Here we return JSON structured for the frontend to render PDF.
    return {
        "success": True,
        "agent_name": agent["name"],
        "pipeline_health": agent["risk_level"],
        "stats": {
            "total_calls": agent["total_calls"],
            "blocks": agent["blocked_calls"],
            "score": 100 - agent["risk_score"]
        },
        "timestamp": datetime.utcnow().isoformat()
    }

def generate_integration_guide(agent_id: str, platform: str) -> Dict:
    """Generate platform-specific integration instructions"""
    
    base_url = "http://localhost:8000"  # Change to your production URL
    
    if platform == "n8n":
        return {
            "platform": "n8n",
            "steps": [
                "1. Add an HTTP Request node BEFORE your tool execution nodes",
                f"2. Set URL to: {base_url}/api/agents/{agent_id}/intercept",
                "3. Method: POST",
                "4. Body: Include tool_name, parameters, and user_prompt",
                "5. Add an IF node to check response.allowed",
                "6. Only execute tool if allowed === true"
            ],
            "example_workflow": {
                "webhook_url": f"{base_url}/api/agents/{agent_id}/intercept",
                "request_body": {
                    "tool_name": "{{ $json.tool }}",
                    "parameters": "{{ $json.params }}",
                    "user_prompt": "{{ $json.prompt }}"
                }
            }
        }
    
    elif platform == "langchain":
        return {
            "platform": "langchain",
            "code_example": f"""from langchain.agents import AgentExecutor
import requests

def security_check(tool_name, tool_input):
    response = requests.post(
        "{base_url}/api/agents/{agent_id}/intercept",
        json={{
            "tool_name": tool_name,
            "parameters": tool_input
        }}
    )
    result = response.json()
    if result["blocked"]:
        raise Exception(f"Security block: {{result['reason']}}")
    return result["allowed"]
"""
        }
    
    else:
        return {
            "platform": "custom",
            "api_endpoint": f"{base_url}/api/agents/{agent_id}/intercept",
            "method": "POST",
            "request_format": {
                "tool_name": "string",
                "parameters": "object",
                "user_prompt": "string (optional)"
            }
        }

def get_block_reason(risk_analysis: Dict) -> str:
    """Get human-readable reason for blocking"""
    
    reasons = []
    
    if risk_analysis["risk_score"] > 0.8:
        reasons.append(f"High risk score: {risk_analysis['risk_score']*100:.1f}%")
    
    if risk_analysis.get("vulnerabilities"):
        for vuln in risk_analysis["vulnerabilities"]:
            reasons.append(vuln)
    
    return " | ".join(reasons) if reasons else "Potential security risk detected"

# --- Local Security Analysis Implementation ---

def analyze_tool_call_risk(tool_call: Dict, mode: str) -> Dict:
    """Analyze tool call safely without external dependencies"""
    tool_name = tool_call.get("tool_name", "")
    params = str(tool_call.get("parameters", ""))
    
    risk_score = 0.0
    vulnerabilities = []
    
    # Dangerous tools
    high_risk_tools = ["python_executor", "system_command", "file_writer", "database_query"]
    if tool_name in high_risk_tools:
        risk_score += 0.4
        vulnerabilities.append(f"High risk tool: {tool_name}")
        
    # Dangerous patterns in params
    dangerous_patterns = [
        "drop table", "delete from", "orm.delete", # SQL
        "rm -rf", "wget", "curl", "chmod", "chown", # System
        "import os", "import sys", "subprocess", "eval(", "exec(" # Code
    ]
    
    for pattern in dangerous_patterns:
        if pattern in params.lower():
            risk_score += 0.5
            vulnerabilities.append(f"Dangerous pattern detected: {pattern}")
            
    # Cap risk score
    risk_score = min(risk_score, 1.0)
    
    return {
        "risk_score": risk_score,
        "should_block": risk_score > 0.7,
        "vulnerabilities": vulnerabilities,
        "reason": " | ".join(vulnerabilities) if vulnerabilities else "Safe"
    }

def calculate_risk_score(tool_call: Dict) -> float:
    return analyze_tool_call_risk(tool_call, "general")["risk_score"]

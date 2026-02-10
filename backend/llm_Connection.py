from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import httpx

router = APIRouter()

class LLMConnectionRequest(BaseModel):
    model_name: str
    model_type: str  # Chatbot, RAG, Agent
    endpoint_url: str
    auth_type: str  # api_key, bearer, none
    api_key: Optional[str] = None

class LLMConnectionResponse(BaseModel):
    id: int
    model_name: str
    model_type: str
    endpoint_url: str
    status: str  # connected, disconnected, error
    last_tested: str
    response_time: Optional[float] = None

# Store connected LLM in memory (in production, use database)
connected_llm = None

@router.post("/llm/connect")
async def connect_llm(request: LLMConnectionRequest):
    """
    Connect and validate LLM endpoint
    """
    global connected_llm
    
    try:
        # Test the connection
        headers = {}
        if request.auth_type == 'api_key':
            headers['Authorization'] = f'Bearer {request.api_key}'
        elif request.auth_type == 'bearer':
            headers['Authorization'] = f'Bearer {request.api_key}'
        
        # Test with a simple prompt
        test_payload = {
            "model": request.model_name.lower().replace(' ', '-'),
            "messages": [{"role": "user", "content": "Hello"}],
            "max_tokens": 10
        }
        
        start_time = datetime.now()
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                request.endpoint_url,
                json=test_payload,
                headers=headers
            )
        
        response_time = (datetime.now() - start_time).total_seconds() * 1000
        
        if response.status_code == 200:
            connected_llm = {
                'id': 1,
                'model_name': request.model_name,
                'model_type': request.model_type,
                'endpoint_url': request.endpoint_url,
                'auth_type': request.auth_type,
                'api_key': request.api_key,
                'status': 'connected',
                'last_tested': datetime.now().isoformat(),
                'response_time': round(response_time, 2)
            }
            
            return {
                'success': True,
                'message': f'{request.model_name} connected successfully',
                'connection': {
                    'id': 1,
                    'model_name': request.model_name,
                    'model_type': request.model_type,
                    'status': 'connected',
                    'response_time': round(response_time, 2)
                }
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Connection failed: {response.status_code} - {response.text}"
            )
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Connection timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection error: {str(e)}")

@router.get("/llm/connected")
async def get_connected_llm():
    """
    Get currently connected LLM details
    """
    if connected_llm is None:
        return {
            'connected': False,
            'model_name': None,
            'status': 'disconnected'
        }
    
    return {
        'connected': True,
        'model_name': connected_llm['model_name'],
        'model_type': connected_llm['model_type'],
        'status': connected_llm['status'],
        'response_time': connected_llm.get('response_time'),
        'last_tested': connected_llm['last_tested']
    }

@router.post("/llm/disconnect")
async def disconnect_llm():
    """
    Disconnect current LLM
    """
    global connected_llm
    connected_llm = None
    return {'success': True, 'message': 'LLM disconnected'}

@router.post("/llm/test-connection")
async def test_llm_connection():
    """
    Test the connected LLM with a sample prompt
    """
    if connected_llm is None:
        raise HTTPException(status_code=400, detail="No LLM connected")
    
    try:
        headers = {}
        if connected_llm['auth_type'] == 'api_key':
            headers['Authorization'] = f"Bearer {connected_llm['api_key']}"
        elif connected_llm['auth_type'] == 'bearer':
            headers['Authorization'] = f"Bearer {connected_llm['api_key']}"
        
        test_payload = {
            "model": connected_llm['model_name'].lower().replace(' ', '-'),
            "messages": [{"role": "user", "content": "Test connection"}],
            "max_tokens": 10
        }
        
        start_time = datetime.now()
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                connected_llm['endpoint_url'],
                json=test_payload,
                headers=headers
            )
        
        response_time = (datetime.now() - start_time).total_seconds() * 1000
        
        if response.status_code == 200:
            return {
                'success': True,
                'status': 'connected',
                'response_time': round(response_time, 2),
                'message': 'Connection successful'
            }
        else:
            return {
                'success': False,
                'status': 'error',
                'message': f"Error: {response.status_code}"
            }
            
    except Exception as e:
        return {
            'success': False,
            'status': 'error',
            'message': str(e)
        }

@router.post("/llm/query")
async def query_llm(prompt: str):
    """
    Query the connected LLM
    Used by firewall, red teaming, etc.
    """
    if connected_llm is None:
        raise HTTPException(status_code=400, detail="No LLM connected. Please connect an LLM first.")
    
    try:
        headers = {}
        if connected_llm['auth_type'] == 'api_key':
            headers['Authorization'] = f"Bearer {connected_llm['api_key']}"
        elif connected_llm['auth_type'] == 'bearer':
            headers['Authorization'] = f"Bearer {connected_llm['api_key']}"
        
        payload = {
            "model": connected_llm['model_name'].lower().replace(' ', '-'),
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 500
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                connected_llm['endpoint_url'],
                json=payload,
                headers=headers
            )
        
        if response.status_code == 200:
            data = response.json()
            return {
                'success': True,
                'response': data.get('choices', [{}])[0].get('message', {}).get('content', ''),
                'model': connected_llm['model_name']
            }
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"LLM query failed: {response.text}"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query error: {str(e)}")

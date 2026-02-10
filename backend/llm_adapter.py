import httpx
import json
from typing import Dict, Tuple

async def validate_openai_endpoint(endpoint_url: str, api_key: str) -> Tuple[bool, str]:
    """Validate OpenAI-compatible API endpoint"""
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Try a simple completion request
        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": "Hello"}],
            "max_tokens": 5
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(endpoint_url, headers=headers, json=payload)
            
            if response.status_code == 200:
                return True, "Connection successful"
            elif response.status_code == 401:
                return False, "Invalid API key"
            elif response.status_code == 404:
                return False, "Endpoint not found"
            else:
                return False, f"HTTP {response.status_code}: {response.text[:100]}"
                
    except httpx.ConnectError:
        return False, "Cannot connect to endpoint - check URL"
    except httpx.TimeoutException:
        return False, "Connection timeout - endpoint too slow"
    except Exception as e:
        return False, f"Error: {str(e)}"

async def validate_rest_endpoint(endpoint_url: str, api_key: str = None) -> Tuple[bool, str]:
    """Validate generic REST API endpoint"""
    try:
        headers = {"Content-Type": "application/json"}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        
        # Try a simple POST request
        payload = {"prompt": "test", "max_tokens": 5}
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(endpoint_url, headers=headers, json=payload)
            
            if response.status_code in [200, 201]:
                return True, "Connection successful"
            elif response.status_code == 401:
                return False, "Authentication failed"
            else:
                return False, f"HTTP {response.status_code}"
                
    except httpx.ConnectError:
        return False, "Cannot connect to endpoint"
    except httpx.TimeoutException:
        return False, "Connection timeout"
    except Exception as e:
        return False, f"Error: {str(e)}"

async def validate_local_endpoint(endpoint_url: str) -> Tuple[bool, str]:
    """Validate local LLM endpoint (like Ollama, LocalAI)"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Try health check endpoint
            response = await client.get(f"{endpoint_url.rstrip('/')}/health")
            
            if response.status_code == 200:
                return True, "Local endpoint is healthy"
            else:
                # Try a simple generation test
                response = await client.post(
                    endpoint_url,
                    json={"prompt": "test", "max_tokens": 5}
                )
                if response.status_code in [200, 201]:
                    return True, "Connection successful"
                return False, f"HTTP {response.status_code}"
                
    except httpx.ConnectError:
        return False, "Cannot connect - is the local server running?"
    except Exception as e:
        return False, f"Error: {str(e)}"

async def validate_llm_connection(model_type: str, endpoint_url: str, api_key: str = None) -> Tuple[bool, str]:
    """Main validator that routes to appropriate adapter"""
    if model_type == "openai":
        return await validate_openai_endpoint(endpoint_url, api_key)
    elif model_type == "local":
        return await validate_local_endpoint(endpoint_url)
    elif model_type == "rest":
        return await validate_rest_endpoint(endpoint_url, api_key)
    else:
        return False, "Unsupported model type"

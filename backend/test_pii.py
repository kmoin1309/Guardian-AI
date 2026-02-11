import requests
import json

BASE = "http://localhost:8000"

# Test attack-domains endpoint (no auth needed)
r = requests.get(f"{BASE}/api/pii/attack-domains")
print("=== Attack Domains ===")
print("Status:", r.status_code)
print(json.dumps(r.json(), indent=2))

# Login
login = requests.post(f"{BASE}/api/login", json={"email": "test2@test.com", "password": "test123"})
token = login.json().get("access_token")
print("\nLogin:", login.status_code, "Token:", bool(token))

# Test PII scan
r2 = requests.post(f"{BASE}/api/pii/scan",
    json={"text": "My email is john@example.com and my SSN is 123-45-6789"},
    headers={"Authorization": f"Bearer {token}"})
print("\n=== PII Scan ===")
print("Status:", r2.status_code)
data = r2.json()
print("Has sensitive:", data.get("has_sensitive_data"))
print("Total findings:", data.get("total_findings"))
print("Risk:", data.get("risk_level"))

# Test PII test-domain (this needs a connected LLM)
r3 = requests.post(f"{BASE}/api/pii/test-domain",
    json={"domain": "general"},
    headers={"Authorization": f"Bearer {token}"})
print("\n=== PII Test Domain ===")
print("Status:", r3.status_code)
resp_text = json.dumps(r3.json(), indent=2)
print(resp_text[:800])

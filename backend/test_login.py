import requests
import json

# Test login with exact credentials
data = {
    "email": "admin@school.com",
    "password": "admin123"
}

response = requests.post('http://localhost:5000/auth/login', 
                        json=data,
                        headers={'Content-Type': 'application/json'})

print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
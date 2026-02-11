
import os
import requests
from dotenv import load_dotenv

load_dotenv("backend/.env")

client_id = os.getenv("DHAN_CLIENT_ID")
access_token = os.getenv("DHAN_ACCESS_TOKEN")

print(f"Client ID: {client_id}")
print(f"Token (First 20 chars): {access_token[:20]}...")

url = "https://sandbox.dhan.co/v2/holdings"
headers = {
    "access-token": access_token,
    "client-id": client_id,
    "Content-Type": "application/json"
}

try:
    print(f"Testing URL: {url}")
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

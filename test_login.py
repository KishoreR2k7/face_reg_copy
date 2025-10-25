#!/usr/bin/env python3
"""
Test login functionality with the new user 'userna'.
"""

import requests
import json

def test_login():
    """Test login with the new user credentials."""
    print("Testing login with new user 'userna'...")
    
    # Test data
    login_data = {
        "email": "userna",
        "password": "123"
    }
    
    try:
        # Make login request
        response = requests.post(
            "http://localhost:5000/auth/login",
            json=login_data,
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✓ Login successful!")
            print(f"✓ Token received: {result.get('token', '')[:20]}...")
            return True
        else:
            print(f"✗ Login failed with status: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("✗ Backend server is not running")
        print("Please start the backend with: python src/api_backend.py")
        return False
    except Exception as e:
        print(f"✗ Login test failed: {e}")
        return False

def test_protected_endpoint():
    """Test accessing a protected endpoint with the token."""
    print("\nTesting protected endpoint access...")
    
    # First login to get token
    login_data = {
        "email": "userna",
        "password": "123"
    }
    
    try:
        # Login
        response = requests.post(
            "http://localhost:5000/auth/login",
            json=login_data,
            timeout=5
        )
        
        if response.status_code != 200:
            print("✗ Login failed, cannot test protected endpoint")
            return False
            
        token = response.json().get('token')
        if not token:
            print("✗ No token received")
            return False
        
        # Test protected endpoint
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        response = requests.get(
            "http://localhost:5000/students",
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            print("✓ Protected endpoint access successful!")
            return True
        else:
            print(f"✗ Protected endpoint failed with status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"✗ Protected endpoint test failed: {e}")
        return False

if __name__ == "__main__":
    print("Authentication Test for New User")
    print("=" * 50)
    
    # Test login
    login_success = test_login()
    
    if login_success:
        # Test protected endpoint
        protected_success = test_protected_endpoint()
        
        if protected_success:
            print("\nAll tests passed! User 'userna' can login and access protected features.")
        else:
            print("\nLogin works but protected endpoint access failed.")
    else:
        print("\nLogin test failed. Please check the backend server.")
    
    print("\nYou can now login with:")
    print("Username: userna")
    print("Password: 123")

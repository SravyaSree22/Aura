#!/usr/bin/env python3
"""
Quick test to check specific failing endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8050/api"

def test_backend():
    print("Testing backend connection...")
    try:
        response = requests.get(f"{BASE_URL}/courses/")
        print(f"Response: {response.status_code}")
        if response.status_code == 401:
            print("✅ Backend is running")
            return True
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False

def test_csrf():
    print("\nTesting CSRF token...")
    try:
        response = requests.get(f"{BASE_URL}/users/csrf_token/")
        print(f"CSRF Response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ CSRF token: {data.get('csrfToken', 'None')}")
            return data.get('csrfToken')
        else:
            print(f"❌ CSRF failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ CSRF error: {e}")
        return None

def test_login(csrf_token):
    print("\nTesting teacher login...")
    try:
        headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token
        }
        data = {
            "email": "teacher1@example.com",
            "password": "password123"
        }
        response = requests.post(f"{BASE_URL}/users/login/", json=data, headers=headers)
        print(f"Login Response: {response.status_code}")
        if response.status_code == 200:
            print("✅ Teacher login successful")
            return True
        else:
            print(f"❌ Login failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False

def test_course_creation(csrf_token):
    print("\nTesting course creation...")
    try:
        headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token
        }
        data = {
            "name": "Test Course",
            "code": "TEST101",
            "schedule": "Monday 10:00 AM",
            "color": "#3B82F6"
        }
        response = requests.post(f"{BASE_URL}/courses/", json=data, headers=headers)
        print(f"Course Creation Response: {response.status_code}")
        if response.status_code == 201:
            course = response.json()
            print(f"✅ Course created: {course}")
            return course['id'].replace('c', '')
        else:
            print(f"❌ Course creation failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Course creation error: {e}")
        return None

if __name__ == "__main__":
    print("🚀 Quick Test Script")
    print("=" * 40)
    
    # Test backend
    if not test_backend():
        print("❌ Backend not available")
        exit(1)
    
    # Test CSRF
    csrf_token = test_csrf()
    if not csrf_token:
        print("❌ CSRF token not available")
        exit(1)
    
    # Test login
    if not test_login(csrf_token):
        print("❌ Login failed")
        exit(1)
    
    # Test course creation
    course_id = test_course_creation(csrf_token)
    if not course_id:
        print("❌ Course creation failed")
        exit(1)
    
    print("\n✅ All basic tests passed!")

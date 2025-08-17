#!/usr/bin/env python3
"""
Test script to verify attendance and quiz functionality
"""

import requests
import json
from datetime import date

# Configuration
BASE_URL = "http://localhost:8050/api"
LOGIN_URL = f"{BASE_URL}/users/login/"
CSRF_URL = f"{BASE_URL}/users/csrf_token/"

def test_csrf_token():
    """Test CSRF token endpoint"""
    print("Testing CSRF token endpoint...")
    try:
        response = requests.get(CSRF_URL)
        if response.status_code == 200:
            print("✅ CSRF token endpoint working")
            return response.json().get('csrfToken')
        else:
            print(f"❌ CSRF token failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ CSRF token error: {e}")
        return None

def test_teacher_login():
    """Test teacher login"""
    print("\nTesting teacher login...")
    try:
        login_data = {
            "email": "teacher1@example.com",
            "password": "password123"
        }
        response = requests.post(LOGIN_URL, json=login_data)
        if response.status_code == 200:
            print("✅ Teacher login successful")
            return response.cookies
        else:
            print(f"❌ Teacher login failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Teacher login error: {e}")
        return None

def test_attendance_endpoints(cookies):
    """Test attendance endpoints"""
    print("\nTesting attendance endpoints...")
    
    # Test mark attendance
    attendance_data = {
        "course_id": "1",
        "date": date.today().isoformat(),
        "attendance_records": [
            {"student_id": "1", "status": "present", "notes": "On time"},
            {"student_id": "2", "status": "late", "notes": "5 minutes late"},
            {"student_id": "3", "status": "absent", "notes": "No excuse"}
        ]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/attendance/mark_attendance/",
            json=attendance_data,
            cookies=cookies
        )
        if response.status_code == 200:
            print("✅ Mark attendance endpoint working")
        else:
            print(f"❌ Mark attendance failed: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Mark attendance error: {e}")

def test_quiz_endpoints(cookies):
    """Test quiz endpoints"""
    print("\nTesting quiz endpoints...")
    
    # Test add quiz questions
    quiz_data = {
        "questions": [
            {
                "question_text": "What is 2 + 2?",
                "option_a": "3",
                "option_b": "4",
                "option_c": "5",
                "option_d": "6",
                "correct_answer": "B",
                "points": 1
            },
            {
                "question_text": "What is the capital of France?",
                "option_a": "London",
                "option_b": "Berlin",
                "option_c": "Paris",
                "option_d": "Madrid",
                "correct_answer": "C",
                "points": 1
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/assignments/1/add_questions/",
            json=quiz_data,
            cookies=cookies
        )
        if response.status_code == 200:
            print("✅ Add quiz questions endpoint working")
        else:
            print(f"❌ Add quiz questions failed: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Add quiz questions error: {e}")

def main():
    """Main test function"""
    print("🧪 Testing Attendance and Quiz Functionality")
    print("=" * 50)
    
    # Test CSRF token
    csrf_token = test_csrf_token()
    
    # Test teacher login
    cookies = test_teacher_login()
    
    if cookies:
        # Test attendance endpoints
        test_attendance_endpoints(cookies)
        
        # Test quiz endpoints
        test_quiz_endpoints(cookies)
    
    print("\n" + "=" * 50)
    print("🏁 Testing completed!")

if __name__ == "__main__":
    main()

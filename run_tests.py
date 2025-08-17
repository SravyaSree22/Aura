#!/usr/bin/env python3
"""
Simple test runner for Aura LMS
"""

import requests
import json
import time

BASE_URL = "http://localhost:8050/api"

def test_endpoint(endpoint, method="GET", data=None, headers=None):
    """Test a specific endpoint"""
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{endpoint}", json=data, headers=headers)
        
        print(f"{method} {endpoint}: {response.status_code}")
        if response.status_code >= 400:
            print(f"Error: {response.text[:200]}")
        return response
    except Exception as e:
        print(f"Exception: {e}")
        return None

def main():
    print("🚀 Aura LMS Quick Test")
    print("=" * 40)
    
    # Test 1: Backend connection
    print("\n1. Testing backend connection...")
    response = test_endpoint("/courses/")
    if response and response.status_code == 401:
        print("✅ Backend is running")
    else:
        print("❌ Backend not responding correctly")
        return
    
    # Test 2: CSRF token
    print("\n2. Testing CSRF token...")
    response = test_endpoint("/users/csrf_token/")
    if response and response.status_code == 200:
        csrf_token = response.json().get('csrfToken')
        print(f"✅ CSRF token: {csrf_token[:20]}...")
    else:
        print("❌ CSRF token failed")
        return
    
    # Test 3: Teacher login
    print("\n3. Testing teacher login...")
    headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token
    }
    login_data = {
        "email": "teacher1@example.com",
        "password": "password123"
    }
    response = test_endpoint("/users/login/", "POST", login_data, headers)
    if response and response.status_code == 200:
        print("✅ Teacher login successful")
    else:
        print("❌ Teacher login failed")
        return
    
    # Test 4: Course creation
    print("\n4. Testing course creation...")
    course_data = {
        "name": "Test Course",
        "code": "TEST101",
        "schedule": "Monday 10:00 AM",
        "color": "#3B82F6"
    }
    response = test_endpoint("/courses/", "POST", course_data, headers)
    if response and response.status_code == 201:
        course = response.json()
        course_id = course['id'].replace('c', '')
        print(f"✅ Course created: {course_id}")
    else:
        print("❌ Course creation failed")
        return
    
    # Test 5: Assignment creation
    print("\n5. Testing assignment creation...")
    assignment_data = {
        "course": f"c{course_id}",
        "title": "Test Assignment",
        "description": "Test description",
        "assignment_type": "quiz",
        "due_date": "2024-12-31",
        "max_grade": 100
    }
    response = test_endpoint("/assignments/", "POST", assignment_data, headers)
    if response and response.status_code == 201:
        assignment = response.json()
        assignment_id = assignment['id'].replace('a', '')
        print(f"✅ Assignment created: {assignment_id}")
    else:
        print("❌ Assignment creation failed")
        return
    
    # Test 6: Quiz questions
    print("\n6. Testing quiz questions...")
    questions_data = {
        "questions": [
            {
                "question_text": "What is 2 + 2?",
                "option_a": "3",
                "option_b": "4",
                "option_c": "5",
                "option_d": "6",
                "correct_answer": "B",
                "points": 10,
                "order": 1
            }
        ]
    }
    response = test_endpoint(f"/assignments/{assignment_id}/add_questions/", "POST", questions_data, headers)
    if response and response.status_code == 200:
        print("✅ Quiz questions added")
    else:
        print("❌ Quiz questions failed")
        return
    
    # Test 7: Get quiz questions
    print("\n7. Testing get quiz questions...")
    response = test_endpoint(f"/assignments/{assignment_id}/questions/", "GET", headers=headers)
    if response and response.status_code == 200:
        questions = response.json()
        print(f"✅ Got {len(questions)} questions")
    else:
        print("❌ Get quiz questions failed")
        return
    
    # Test 8: Attendance marking
    print("\n8. Testing attendance marking...")
    attendance_data = {
        "course_id": course_id,
        "date": "2024-08-17",
        "attendance": [
            {
                "student_id": 1,
                "status": "present",
                "notes": "Test"
            }
        ]
    }
    response = test_endpoint("/attendance/mark_attendance/", "POST", attendance_data, headers)
    if response and response.status_code == 200:
        print("✅ Attendance marked")
    else:
        print("❌ Attendance marking failed")
        return
    
    print("\n🎉 All tests passed!")

if __name__ == "__main__":
    main()

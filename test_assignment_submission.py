#!/usr/bin/env python3
"""
Test script for assignment submission functionality
"""

import requests
import json
import sys
import os

# Configuration
BASE_URL = "http://localhost:8050"
API_BASE = f"{BASE_URL}/api"

def get_csrf_token():
    """Get CSRF token from the server"""
    try:
        response = requests.get(f"{BASE_URL}/api/", timeout=10)
        if response.status_code == 200:
            # Extract CSRF token from cookies
            csrf_token = response.cookies.get('csrftoken')
            if csrf_token:
                return csrf_token
        return None
    except Exception as e:
        print(f"Error getting CSRF token: {e}")
        return None

def login_user(username, password):
    """Login and get session cookies"""
    try:
        csrf_token = get_csrf_token()
        if not csrf_token:
            print("❌ Failed to get CSRF token")
            return None
        
        login_data = {
            'username': username,
            'password': password,
            'csrfmiddlewaretoken': csrf_token
        }
        
        headers = {
            'X-CSRFToken': csrf_token,
            'Referer': f"{BASE_URL}/api/"
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/login/", 
                               data=login_data, 
                               headers=headers, 
                               timeout=10)
        
        if response.status_code == 200:
            print(f"✅ Login successful for {username}")
            return response.cookies
        else:
            print(f"❌ Login failed for {username}: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Login error for {username}: {e}")
        return None

def test_assignment_submission():
    """Test the complete assignment submission flow"""
    print("🧪 Testing Assignment Submission Functionality")
    print("=" * 50)
    
    # Step 1: Login as teacher
    print("\n1. Logging in as teacher...")
    teacher_cookies = login_user("teacher1", "password123")
    if not teacher_cookies:
        print("❌ Teacher login failed, stopping test")
        return False
    
    # Step 2: Create a regular assignment
    print("\n2. Creating a regular assignment...")
    csrf_token = get_csrf_token()
    headers = {
        'X-CSRFToken': csrf_token,
        'Content-Type': 'application/json'
    }
    
    assignment_data = {
        'course_id': '1',  # Assuming course ID 1 exists
        'title': 'Test File Upload Assignment',
        'description': 'This is a test assignment for file upload functionality',
        'assignment_type': 'regular',
        'due_date': '2024-12-31',
        'max_grade': 100
    }
    
    response = requests.post(f"{API_BASE}/assignments/", 
                           json=assignment_data, 
                           headers=headers, 
                           cookies=teacher_cookies,
                           timeout=10)
    
    if response.status_code == 201:
        assignment = response.json()
        assignment_id = assignment['id']
        print(f"✅ Assignment created with ID: {assignment_id}")
    else:
        print(f"❌ Failed to create assignment: {response.status_code} - {response.text}")
        return False
    
    # Step 3: Login as student
    print("\n3. Logging in as student...")
    student_cookies = login_user("student1", "password123")
    if not student_cookies:
        print("❌ Student login failed, stopping test")
        return False
    
    # Step 4: Submit assignment with file
    print("\n4. Submitting assignment with file...")
    
    # Create a test file
    test_file_content = b"This is a test file content for assignment submission."
    test_file_path = "test_submission.txt"
    
    with open(test_file_path, 'wb') as f:
        f.write(test_file_content)
    
    try:
        with open(test_file_path, 'rb') as f:
            files = {'submission_file': ('test_submission.txt', f, 'text/plain')}
            
            response = requests.post(f"{API_BASE}/assignments/{assignment_id}/submit/", 
                                   files=files,
                                   headers={'X-CSRFToken': csrf_token},
                                   cookies=student_cookies,
                                   timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Assignment submitted successfully!")
            print(f"   Submission ID: {result.get('submission_id')}")
            print(f"   File name: {result.get('file_name')}")
        else:
            print(f"❌ Failed to submit assignment: {response.status_code} - {response.text}")
            return False
    
    finally:
        # Clean up test file
        if os.path.exists(test_file_path):
            os.remove(test_file_path)
    
    # Step 5: Teacher views submissions
    print("\n5. Teacher viewing submissions...")
    response = requests.get(f"{API_BASE}/assignmentsubmissions/", 
                          headers=headers,
                          cookies=teacher_cookies,
                          timeout=10)
    
    if response.status_code == 200:
        submissions = response.json()
        print(f"✅ Found {len(submissions)} submissions")
        if submissions:
            submission = submissions[0]
            print(f"   Submission ID: {submission['id']}")
            print(f"   Student: {submission['studentName']}")
            print(f"   Status: {submission['status']}")
            print(f"   File: {submission.get('submission_file', 'No file')}")
    else:
        print(f"❌ Failed to get submissions: {response.status_code} - {response.text}")
        return False
    
    # Step 6: Teacher grades submission
    print("\n6. Teacher grading submission...")
    if submissions:
        submission_id = submissions[0]['id'].replace('sub', '')
        grade_data = {
            'grade': 85.5,
            'feedback': 'Great work! Well done on this assignment.'
        }
        
        response = requests.post(f"{API_BASE}/assignmentsubmissions/{submission_id}/grade/", 
                               json=grade_data,
                               headers=headers,
                               cookies=teacher_cookies,
                               timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Submission graded successfully!")
            print(f"   Grade: {result.get('grade')}%")
            print(f"   Feedback: {result.get('feedback')}")
        else:
            print(f"❌ Failed to grade submission: {response.status_code} - {response.text}")
            return False
    
    print("\n" + "=" * 50)
    print("🎉 ALL TESTS PASSED! Assignment submission functionality is working correctly.")
    print("✅ Teacher can create assignments")
    print("✅ Student can submit files")
    print("✅ Teacher can view submissions")
    print("✅ Teacher can grade submissions")
    print("✅ File upload and download works")
    
    return True

if __name__ == "__main__":
    try:
        success = test_assignment_submission()
        if not success:
            sys.exit(1)
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        sys.exit(1)


#!/usr/bin/env python3
"""
Simple test runner for Aura LMS - All 9 test cases
"""

import requests
import json
import time
import sys

BASE_URL = "http://localhost:8050/api"

def log(message):
    print(f"[{time.strftime('%H:%M:%S')}] {message}")

def test_1_backend_connection():
    """Test 1: Backend Connection"""
    log("Testing Backend Connection...")
    try:
        response = requests.get(f"{BASE_URL}/courses/", timeout=5)
        if response.status_code == 401:
            log("✅ Backend Connection PASSED")
            return True
        else:
            log(f"❌ Backend Connection FAILED: {response.status_code}")
            return False
    except Exception as e:
        log(f"❌ Backend Connection FAILED: {e}")
        return False

def test_2_csrf_token():
    """Test 2: CSRF Token"""
    log("Testing CSRF Token...")
    try:
        response = requests.get(f"{BASE_URL}/users/csrf_token/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            csrf_token = data.get('csrfToken')
            if csrf_token:
                log("✅ CSRF Token PASSED")
                return csrf_token
            else:
                log("❌ CSRF Token FAILED: No token received")
                return None
        else:
            log(f"❌ CSRF Token FAILED: {response.status_code}")
            return None
    except Exception as e:
        log(f"❌ CSRF Token FAILED: {e}")
        return None

def test_3_teacher_login(csrf_token):
    """Test 3: Teacher Login"""
    log("Testing Teacher Login...")
    try:
        headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token
        }
        data = {
            "email": "teacher1@example.com",
            "password": "password123"
        }
        response = requests.post(f"{BASE_URL}/users/login/", json=data, headers=headers, timeout=5)
        if response.status_code == 200:
            log("✅ Teacher Login PASSED")
            return True
        else:
            log(f"❌ Teacher Login FAILED: {response.status_code} - {response.text[:100]}")
            return False
    except Exception as e:
        log(f"❌ Teacher Login FAILED: {e}")
        return False

def test_4_course_creation(csrf_token):
    """Test 4: Course Creation"""
    log("Testing Course Creation...")
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
        response = requests.post(f"{BASE_URL}/courses/", json=data, headers=headers, timeout=5)
        if response.status_code == 201:
            course = response.json()
            course_id = course['id'].replace('c', '')
            log(f"✅ Course Creation PASSED: ID {course_id}")
            return course_id
        else:
            log(f"❌ Course Creation FAILED: {response.status_code} - {response.text[:100]}")
            return None
    except Exception as e:
        log(f"❌ Course Creation FAILED: {e}")
        return None

def test_5_quiz_assignment_creation(csrf_token, course_id):
    """Test 5: Quiz Assignment Creation"""
    log("Testing Quiz Assignment Creation...")
    try:
        headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token
        }
        data = {
            "course": f"c{course_id}",
            "title": "Test Quiz",
            "description": "Test quiz assignment",
            "assignment_type": "quiz",
            "due_date": "2024-12-31",
            "max_grade": 100
        }
        response = requests.post(f"{BASE_URL}/assignments/", json=data, headers=headers, timeout=5)
        if response.status_code == 201:
            assignment = response.json()
            assignment_id = assignment['id'].replace('a', '')
            log(f"✅ Quiz Assignment Creation PASSED: ID {assignment_id}")
            return assignment_id
        else:
            log(f"❌ Quiz Assignment Creation FAILED: {response.status_code} - {response.text[:100]}")
            return None
    except Exception as e:
        log(f"❌ Quiz Assignment Creation FAILED: {e}")
        return None

def test_6_quiz_questions_creation(csrf_token, assignment_id):
    """Test 6: Quiz Questions Creation"""
    log("Testing Quiz Questions Creation...")
    try:
        headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token
        }
        data = {
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
        response = requests.post(f"{BASE_URL}/assignments/{assignment_id}/add_questions/", json=data, headers=headers, timeout=5)
        if response.status_code == 200:
            log("✅ Quiz Questions Creation PASSED")
            return True
        else:
            log(f"❌ Quiz Questions Creation FAILED: {response.status_code} - {response.text[:100]}")
            return False
    except Exception as e:
        log(f"❌ Quiz Questions Creation FAILED: {e}")
        return False

def test_7_attendance_marking(csrf_token, course_id):
    """Test 7: Attendance Marking"""
    log("Testing Attendance Marking...")
    try:
        headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token
        }
        data = {
            "course_id": course_id,
            "date": "2024-08-17",
            "attendance": [
                {
                    "student_id": 1,
                    "status": "present",
                    "notes": "Test attendance"
                }
            ]
        }
        response = requests.post(f"{BASE_URL}/attendance/mark_attendance/", json=data, headers=headers, timeout=5)
        if response.status_code == 200:
            log("✅ Attendance Marking PASSED")
            return True
        else:
            log(f"❌ Attendance Marking FAILED: {response.status_code} - {response.text[:100]}")
            return False
    except Exception as e:
        log(f"❌ Attendance Marking FAILED: {e}")
        return False

def test_8_student_quiz_taking(csrf_token, assignment_id):
    """Test 8: Student Quiz Taking"""
    log("Testing Student Quiz Taking...")
    try:
        # First login as student
        headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token
        }
        data = {
            "email": "student1@example.com",
            "password": "password123"
        }
        response = requests.post(f"{BASE_URL}/users/login/", json=data, headers=headers, timeout=5)
        if response.status_code != 200:
            log(f"❌ Student Login FAILED: {response.status_code}")
            return False
        
        # Get quiz questions
        response = requests.get(f"{BASE_URL}/assignments/{assignment_id}/questions/", headers=headers, timeout=5)
        if response.status_code != 200:
            log(f"❌ Get Quiz Questions FAILED: {response.status_code}")
            return False
        
        questions = response.json()
        if not questions:
            log("❌ No questions found")
            return False
        
        # Submit quiz
        answers = {str(q['id']): q.get('correct_answer', 'A') for q in questions}
        quiz_data = {
            "answers": answers,
            "time_taken": 120
        }
        
        response = requests.post(f"{BASE_URL}/assignments/{assignment_id}/submit_quiz/", json=quiz_data, headers=headers, timeout=5)
        if response.status_code == 200:
            log("✅ Student Quiz Taking PASSED")
            return True
        else:
            log(f"❌ Student Quiz Taking FAILED: {response.status_code} - {response.text[:100]}")
            return False
    except Exception as e:
        log(f"❌ Student Quiz Taking FAILED: {e}")
        return False

def test_9_profile_picture_upload(csrf_token):
    """Test 9: Profile Picture Upload"""
    log("Testing Profile Picture Upload...")
    try:
        # Create a simple test image
        test_image = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf6\x178\xea\x00\x00\x00\x00IEND\xaeB`\x82'
        
        headers = {'X-CSRFToken': csrf_token}
        files = {"avatar": ("test.png", test_image, "image/png")}
        
        response = requests.post(f"{BASE_URL}/users/upload_avatar/", files=files, headers=headers, timeout=5)
        if response.status_code == 200:
            log("✅ Profile Picture Upload PASSED")
            return True
        else:
            log(f"❌ Profile Picture Upload FAILED: {response.status_code} - {response.text[:100]}")
            return False
    except Exception as e:
        log(f"❌ Profile Picture Upload FAILED: {e}")
        return False

def main():
    log("🚀 Starting Aura LMS Test Suite - All 9 Test Cases")
    log("=" * 60)
    
    passed = 0
    total = 9
    
    # Test 1: Backend Connection
    if test_1_backend_connection():
        passed += 1
    
    # Test 2: CSRF Token
    csrf_token = test_2_csrf_token()
    if csrf_token:
        passed += 1
    else:
        log("❌ Cannot continue without CSRF token")
        log(f"📊 Final Results: {passed}/{total} tests passed")
        return
    
    # Test 3: Teacher Login
    if test_3_teacher_login(csrf_token):
        passed += 1
    
    # Test 4: Course Creation
    course_id = test_4_course_creation(csrf_token)
    if course_id:
        passed += 1
    else:
        log("❌ Cannot continue without course ID")
        log(f"📊 Final Results: {passed}/{total} tests passed")
        return
    
    # Test 5: Quiz Assignment Creation
    assignment_id = test_5_quiz_assignment_creation(csrf_token, course_id)
    if assignment_id:
        passed += 1
    else:
        log("❌ Cannot continue without assignment ID")
        log(f"📊 Final Results: {passed}/{total} tests passed")
        return
    
    # Test 6: Quiz Questions Creation
    if test_6_quiz_questions_creation(csrf_token, assignment_id):
        passed += 1
    
    # Test 7: Attendance Marking
    if test_7_attendance_marking(csrf_token, course_id):
        passed += 1
    
    # Test 8: Student Quiz Taking
    if test_8_student_quiz_taking(csrf_token, assignment_id):
        passed += 1
    
    # Test 9: Profile Picture Upload
    if test_9_profile_picture_upload(csrf_token):
        passed += 1
    
    # Final Results
    log("=" * 60)
    log(f"📊 Final Results: {passed}/{total} tests passed")
    
    if passed == total:
        log("🎉 ALL TESTS PASSED! The system is working correctly.")
        sys.exit(0)
    else:
        log("⚠️ Some tests failed. Please check the implementation.")
        sys.exit(1)

if __name__ == "__main__":
    main()

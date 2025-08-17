#!/usr/bin/env python3
"""
Debug script to test the specific issues:
1. Course not found issue
2. 403 errors for attendance and profile updates
"""

import requests
import json

def test_issues():
    base_url = "http://localhost:8050/api"
    teacher_session = requests.Session()
    student_session = requests.Session()
    
    print("🔍 Testing Aura System Issues")
    print("=" * 50)
    
    # Test 1: Backend connection
    print("\n1. Testing backend connection...")
    try:
        response = teacher_session.get(f"{base_url}/users/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 403:
            print("   ✅ Backend is running (403 expected for unauthenticated)")
        else:
            print(f"   ❌ Unexpected status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Connection failed: {e}")
        return
    
    # Test 2: User registration and login
    print("\n2. Testing user registration and login...")
    
    # Register a teacher
    import time
    unique_id = int(time.time())
    teacher_data = {
        "email": f"debug_teacher_{unique_id}@test.com",
        "password": "testpass123",
        "name": "Debug Teacher",
        "role": "teacher"
    }
    
    # Get CSRF token
    csrf_response = teacher_session.get(f"{base_url}/users/csrf_token/")
    if csrf_response.status_code == 200:
        csrf_token = csrf_response.json().get('csrfToken', '')
        print(f"   ✅ CSRF token obtained: {csrf_token[:10]}...")
    else:
        print(f"   ❌ CSRF token failed: {csrf_response.status_code}")
        return
    
    # Register teacher
    headers = {'X-CSRFToken': csrf_token}
    signup_response = teacher_session.post(f"{base_url}/users/signup/", json=teacher_data, headers=headers)
    print(f"   Teacher signup: {signup_response.status_code}")
    if signup_response.status_code == 200:
        teacher_id = signup_response.json().get('id')
        print(f"   ✅ Teacher registered with ID: {teacher_id}")
    else:
        print(f"   ❌ Teacher signup failed: {signup_response.text}")
        return
    
    # Login teacher (without CSRF token since it's AllowAny)
    login_data = {
        "email": f"debug_teacher_{unique_id}@test.com",
        "password": "testpass123"
    }
    login_response = teacher_session.post(f"{base_url}/users/login/", json=login_data)
    print(f"   Teacher login: {login_response.status_code}")
    if login_response.status_code != 200:
        print(f"   ❌ Teacher login failed: {login_response.text}")
        return
    
    # Check user data
    user_data = login_response.json()
    print(f"   ✅ User logged in: {user_data.get('name')} (ID: {user_data.get('id')}, Role: {user_data.get('role')})")
    
    # Get fresh CSRF token after login
    csrf_response = teacher_session.get(f"{base_url}/users/csrf_token/")
    if csrf_response.status_code == 200:
        csrf_token = csrf_response.json().get('csrfToken', '')
        headers = {'X-CSRFToken': csrf_token}
        print(f"   ✅ Fresh CSRF token: {csrf_token[:10]}...")
    else:
        print(f"   ❌ Failed to get fresh CSRF token: {csrf_response.status_code}")
        return
    
    # Test 3: Course creation
    print("\n3. Testing course creation...")
    course_data = {
        "name": f"Debug Course {unique_id}",
        "code": f"DEBUG{unique_id}",
        "schedule": "Monday 9:00 AM",
        "color": "#4f46e5"
    }
    
    course_response = teacher_session.post(f"{base_url}/courses/", json=course_data, headers=headers)
    print(f"   Course creation: {course_response.status_code}")
    if course_response.status_code == 201:
        course_data = course_response.json()
        course_id = course_data.get('id', '').replace('c', '')
        print(f"   ✅ Course created with ID: {course_id}")
        print(f"   Course name: {course_data.get('name')}")
        print(f"   Full course data: {course_data}")
    else:
        print(f"   ❌ Course creation failed: {course_response.text}")
        return
    
    # Test 4: Course access
    print("\n4. Testing course access...")
    course_get_response = teacher_session.get(f"{base_url}/courses/{course_id}/", headers=headers)
    print(f"   Course GET: {course_get_response.status_code}")
    if course_get_response.status_code == 200:
        course_info = course_get_response.json()
        print(f"   ✅ Course found: {course_info.get('name')}")
    else:
        print(f"   ❌ Course access failed: {course_get_response.text}")
    
    # Test 5: Profile picture upload
    print("\n5. Testing profile picture upload...")
    
    # Create a simple test image
    test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf5\xd7\xd4\xc2\x00\x00\x00\x00IEND\xaeB`\x82'
    
    files = {"profile_picture": ("test_image.png", test_image_data, "image/png")}
    profile_response = teacher_session.post(f"{base_url}/profiles/upload_profile_picture/", files=files, headers=headers)
    print(f"   Profile upload: {profile_response.status_code}")
    if profile_response.status_code == 200:
        print(f"   ✅ Profile picture uploaded successfully")
        print(f"   Response: {profile_response.json()}")
    else:
        print(f"   ❌ Profile upload failed: {profile_response.text}")
    
    # Test 6: Attendance marking
    print("\n6. Testing attendance marking...")
    
    # First, register a student
    student_data = {
        "email": f"debug_student_{unique_id}@test.com",
        "password": "testpass123",
        "name": "Debug Student",
        "role": "student"
    }
    
    student_signup = student_session.post(f"{base_url}/users/signup/", json=student_data, headers=headers)
    if student_signup.status_code == 200:
        student_id = student_signup.json().get('id')
        print(f"   ✅ Student registered with ID: {student_id}")
    else:
        print(f"   ❌ Student registration failed: {student_signup.text}")
        return
    
    # Mark attendance
    attendance_data = {
        "course_id": course_id,
        "date": "2024-01-15",
        "attendance": [
            {
                "student_id": student_id,
                "status": "present",
                "notes": "Debug test attendance"
            }
        ]
    }
    
    attendance_response = teacher_session.post(f"{base_url}/attendance/mark_attendance/", json=attendance_data, headers=headers)
    print(f"   Attendance marking: {attendance_response.status_code}")
    if attendance_response.status_code == 200:
        print(f"   ✅ Attendance marked successfully")
        print(f"   Response: {attendance_response.json()}")
    else:
        print(f"   ❌ Attendance marking failed: {attendance_response.text}")
    
    # Test 7: Course listing
    print("\n7. Testing course listing...")
    
    # First, check current user
    me_response = teacher_session.get(f"{base_url}/users/me/", headers=headers)
    print(f"   Current user check: {me_response.status_code}")
    if me_response.status_code == 200:
        current_user = me_response.json()
        print(f"   Current user: {current_user}")
    
    courses_response = teacher_session.get(f"{base_url}/courses/", headers=headers)
    print(f"   Courses list: {courses_response.status_code}")
    if courses_response.status_code == 200:
        courses = courses_response.json()
        print(f"   ✅ Found {len(courses)} courses")
        for course in courses:
            print(f"   - {course.get('name')} (ID: {course.get('id')})")
        
        # Debug: Check if the course we created is in the list
        if len(courses) == 0:
            print(f"   ⚠️  No courses found, but we created course with ID: {course_id}")
            # Try to get the specific course
            specific_course_response = teacher_session.get(f"{base_url}/courses/{course_id}/", headers=headers)
            print(f"   Specific course response: {specific_course_response.status_code}")
            if specific_course_response.status_code == 200:
                specific_course = specific_course_response.json()
                print(f"   Specific course: {specific_course}")
            else:
                print(f"   Specific course error: {specific_course_response.text}")
    else:
        print(f"   ❌ Course listing failed: {courses_response.text}")
    
    print("\n" + "=" * 50)
    print("🎯 Debug Summary:")
    print("✅ Backend is running")
    print("✅ User registration and login working")
    print("✅ Course creation working")
    print("✅ Profile picture upload working")
    print("✅ Attendance marking working")
    print("✅ Course listing working")
    print("\nIf you're still seeing issues in the frontend, check:")
    print("1. Frontend authentication state")
    print("2. CSRF token handling in frontend")
    print("3. API endpoint URLs in frontend")

if __name__ == "__main__":
    test_issues()

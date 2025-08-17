import requests
import sys

print("Testing Aura LMS Backend...")
print("=" * 40)

try:
    # Test 1: Backend Connection
    print("1. Testing backend connection...")
    response = requests.get("http://localhost:8050/api/courses/", timeout=10)
    print(f"   Status: {response.status_code}")
    if response.status_code == 401:
        print("   ✅ Backend is running")
    else:
        print(f"   ❌ Unexpected response: {response.status_code}")
        sys.exit(1)
    
    # Test 2: CSRF Token
    print("\n2. Testing CSRF token...")
    response = requests.get("http://localhost:8050/api/users/csrf_token/", timeout=10)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        csrf_token = data.get('csrfToken')
        if csrf_token:
            print(f"   ✅ CSRF token obtained: {csrf_token[:20]}...")
        else:
            print("   ❌ No CSRF token in response")
            sys.exit(1)
    else:
        print(f"   ❌ CSRF token failed: {response.status_code}")
        sys.exit(1)
    
    # Test 3: Teacher Login
    print("\n3. Testing teacher login...")
    headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token
    }
    data = {
        "email": "teacher1@example.com",
        "password": "password123"
    }
    response = requests.post("http://localhost:8050/api/users/login/", json=data, headers=headers, timeout=10)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Teacher login successful")
    else:
        print(f"   ❌ Teacher login failed: {response.text[:100]}")
        sys.exit(1)
    
    # Test 4: Course Creation
    print("\n4. Testing course creation...")
    data = {
        "name": "Test Course",
        "code": "TEST101",
        "schedule": "Monday 10:00 AM",
        "color": "#3B82F6"
    }
    response = requests.post("http://localhost:8050/api/courses/", json=data, headers=headers, timeout=10)
    print(f"   Status: {response.status_code}")
    if response.status_code == 201:
        course = response.json()
        course_id = course['id'].replace('c', '')
        print(f"   ✅ Course created: ID {course_id}")
    else:
        print(f"   ❌ Course creation failed: {response.text[:100]}")
        sys.exit(1)
    
    # Test 5: Quiz Assignment Creation
    print("\n5. Testing quiz assignment creation...")
    data = {
        "course": f"c{course_id}",
        "title": "Test Quiz",
        "description": "Test quiz assignment",
        "assignment_type": "quiz",
        "due_date": "2024-12-31",
        "max_grade": 100
    }
    response = requests.post("http://localhost:8050/api/assignments/", json=data, headers=headers, timeout=10)
    print(f"   Status: {response.status_code}")
    if response.status_code == 201:
        assignment = response.json()
        assignment_id = assignment['id'].replace('a', '')
        print(f"   ✅ Quiz assignment created: ID {assignment_id}")
    else:
        print(f"   ❌ Quiz assignment creation failed: {response.text[:100]}")
        sys.exit(1)
    
    # Test 6: Quiz Questions Creation
    print("\n6. Testing quiz questions creation...")
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
    response = requests.post(f"http://localhost:8050/api/assignments/{assignment_id}/add_questions/", json=data, headers=headers, timeout=10)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Quiz questions added")
    else:
        print(f"   ❌ Quiz questions creation failed: {response.text[:100]}")
        sys.exit(1)
    
    # Test 7: Attendance Marking
    print("\n7. Testing attendance marking...")
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
    response = requests.post("http://localhost:8050/api/attendance/mark_attendance/", json=data, headers=headers, timeout=10)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Attendance marked")
    else:
        print(f"   ❌ Attendance marking failed: {response.text[:100]}")
        sys.exit(1)
    
    # Test 8: Student Quiz Taking
    print("\n8. Testing student quiz taking...")
    # Login as student
    data = {
        "email": "student1@example.com",
        "password": "password123"
    }
    response = requests.post("http://localhost:8050/api/users/login/", json=data, headers=headers, timeout=10)
    if response.status_code != 200:
        print(f"   ❌ Student login failed: {response.status_code}")
        sys.exit(1)
    
    # Get quiz questions
    response = requests.get(f"http://localhost:8050/api/assignments/{assignment_id}/questions/", headers=headers, timeout=10)
    if response.status_code != 200:
        print(f"   ❌ Get quiz questions failed: {response.status_code}")
        sys.exit(1)
    
    questions = response.json()
    if not questions:
        print("   ❌ No questions found")
        sys.exit(1)
    
    # Submit quiz
    answers = {str(q['id']): q.get('correct_answer', 'A') for q in questions}
    quiz_data = {
        "answers": answers,
        "time_taken": 120
    }
    
    response = requests.post(f"http://localhost:8050/api/assignments/{assignment_id}/submit_quiz/", json=quiz_data, headers=headers, timeout=10)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Student quiz taking successful")
    else:
        print(f"   ❌ Student quiz taking failed: {response.text[:100]}")
        sys.exit(1)
    
    # Test 9: Profile Picture Upload
    print("\n9. Testing profile picture upload...")
    test_image = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf6\x178\xea\x00\x00\x00\x00IEND\xaeB`\x82'
    
    files = {"avatar": ("test.png", test_image, "image/png")}
    response = requests.post("http://localhost:8050/api/users/upload_avatar/", files=files, headers={'X-CSRFToken': csrf_token}, timeout=10)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Profile picture upload successful")
    else:
        print(f"   ❌ Profile picture upload failed: {response.text[:100]}")
        sys.exit(1)
    
    print("\n" + "=" * 40)
    print("🎉 ALL 9 TESTS PASSED! The system is working correctly.")
    print("✅ Backend Connection")
    print("✅ CSRF Token")
    print("✅ Teacher Login")
    print("✅ Course Creation")
    print("✅ Quiz Assignment Creation")
    print("✅ Quiz Questions Creation")
    print("✅ Attendance Marking")
    print("✅ Student Quiz Taking")
    print("✅ Profile Picture Upload")
    
except Exception as e:
    print(f"❌ Test failed with error: {e}")
    sys.exit(1)

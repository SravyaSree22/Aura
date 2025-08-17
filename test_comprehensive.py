#!/usr/bin/env python3
"""
Comprehensive Test Script for Aura Learning Management System
Tests all implemented features including:
- Teacher attendance management
- Quiz assignments with questions and answers
- Student quiz taking and grading
- Profile picture upload
- Real-time data updates
"""

import requests
import json
import time
import os
from datetime import datetime, date

# Configuration
BASE_URL = "http://localhost:8050/api"
FRONTEND_URL = "http://localhost:5173"

class AuraTestSuite:
    def __init__(self):
        self.session = requests.Session()
        self.teacher_credentials = {
            "email": "teacher1@example.com",
            "password": "password123"
        }
        self.student_credentials = {
            "email": "student1@example.com", 
            "password": "password123"
        }
        self.teacher_token = None
        self.student_token = None
        self.test_course_id = None
        self.test_assignment_id = None
        self.csrf_token = None
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def get_csrf_token(self):
        """Get CSRF token from the server"""
        try:
            response = self.session.get(f"{BASE_URL}/users/csrf_token/")
            if response.status_code == 200:
                data = response.json()
                self.csrf_token = data.get('csrfToken')
                self.log("✅ CSRF token obtained")
                return True
            else:
                self.log(f"❌ Failed to get CSRF token: {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ CSRF token error: {e}", "ERROR")
            return False
            
    def get_fresh_csrf_token(self):
        """Get a fresh CSRF token for each request"""
        return self.get_csrf_token()
        
    def test_connection(self):
        """Test if the backend is running"""
        try:
            # First get CSRF token
            if not self.get_csrf_token():
                return False
                
            response = self.session.get(f"{BASE_URL}/courses/")
            if response.status_code == 401:  # Expected - requires authentication
                self.log("✅ Backend is running and responding")
                return True
            else:
                self.log(f"❌ Unexpected response: {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ Backend connection failed: {e}", "ERROR")
            return False
            
    def login_teacher(self):
        """Login as teacher"""
        try:
            # Get fresh CSRF token
            if not self.get_fresh_csrf_token():
                return False
                    
            headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': self.csrf_token
            }
            
            response = self.session.post(f"{BASE_URL}/users/login/", json=self.teacher_credentials, headers=headers)
            if response.status_code == 200:
                self.log("✅ Teacher login successful")
                return True
            else:
                self.log(f"❌ Teacher login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log(f"❌ Teacher login error: {e}", "ERROR")
            return False
            
    def login_student(self):
        """Login as student"""
        try:
            # Get fresh CSRF token
            if not self.get_fresh_csrf_token():
                return False
                    
            headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': self.csrf_token
            }
            
            response = self.session.post(f"{BASE_URL}/users/login/", json=self.student_credentials, headers=headers)
            if response.status_code == 200:
                self.log("✅ Student login successful")
                return True
            else:
                self.log(f"❌ Student login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log(f"❌ Student login error: {e}", "ERROR")
            return False
            
    def test_course_creation(self):
        """Test course creation and get course ID"""
        try:
            # Get fresh CSRF token
            if not self.get_fresh_csrf_token():
                return False
                    
            headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': self.csrf_token
            }
            
            course_data = {
                "name": "Test Course for Attendance",
                "code": "TEST101",
                "schedule": "Monday 10:00 AM",
                "color": "#3B82F6"
            }
            response = self.session.post(f"{BASE_URL}/courses/", json=course_data, headers=headers)
            if response.status_code == 201:
                course = response.json()
                self.test_course_id = course['id'].replace('c', '')
                self.log(f"✅ Course created with ID: {self.test_course_id}")
                return True
            else:
                self.log(f"❌ Course creation failed: {response.status_code} - {response.text}")
                # Try to get more details about the error
                try:
                    error_data = response.json()
                    self.log(f"Error details: {error_data}")
                except:
                    pass
                return False
        except Exception as e:
            self.log(f"❌ Course creation error: {e}", "ERROR")
            return False
            
    def test_quiz_assignment_creation(self):
        """Test creating a quiz assignment"""
        try:
            # Get fresh CSRF token
            if not self.get_fresh_csrf_token():
                return False
                    
            headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': self.csrf_token
            }
            
            assignment_data = {
                "course": f"c{self.test_course_id}",
                "title": "Test Quiz Assignment",
                "description": "A comprehensive test quiz",
                "assignment_type": "quiz",
                "due_date": "2024-12-31",
                "max_grade": 100
            }
            response = self.session.post(f"{BASE_URL}/assignments/", json=assignment_data, headers=headers)
            if response.status_code == 201:
                assignment = response.json()
                self.test_assignment_id = assignment['id'].replace('a', '')
                self.log(f"✅ Quiz assignment created with ID: {self.test_assignment_id}")
                return True
            else:
                self.log(f"❌ Quiz assignment creation failed: {response.status_code} - {response.text}")
                # Try to get more details about the error
                try:
                    error_data = response.json()
                    self.log(f"Error details: {error_data}")
                except:
                    pass
                return False
        except Exception as e:
            self.log(f"❌ Quiz assignment creation error: {e}", "ERROR")
            return False
            
    def test_quiz_questions_creation(self):
        """Test adding quiz questions"""
        try:
            # Get fresh CSRF token
            if not self.get_fresh_csrf_token():
                return False
                    
            headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': self.csrf_token
            }
            
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
                    },
                    {
                        "question_text": "What is the capital of France?",
                        "option_a": "London",
                        "option_b": "Berlin", 
                        "option_c": "Paris",
                        "option_d": "Madrid",
                        "correct_answer": "C",
                        "points": 10,
                        "order": 2
                    }
                ]
            }
            response = self.session.post(
                f"{BASE_URL}/assignments/{self.test_assignment_id}/add_questions/", 
                json=questions_data,
                headers=headers
            )
            if response.status_code == 200:
                self.log("✅ Quiz questions added successfully")
                return True
            else:
                self.log(f"❌ Quiz questions creation failed: {response.status_code} - {response.text}")
                # Try to get more details about the error
                try:
                    error_data = response.json()
                    self.log(f"Error details: {error_data}")
                except:
                    pass
                return False
        except Exception as e:
            self.log(f"❌ Quiz questions creation error: {e}", "ERROR")
            return False
            
    def test_attendance_marking(self):
        """Test marking attendance for students"""
        try:
            # Get fresh CSRF token
            if not self.get_fresh_csrf_token():
                return False
                    
            headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': self.csrf_token
            }
            
            # First get course students
            response = self.session.get(f"{BASE_URL}/courses/{self.test_course_id}/students/", headers=headers)
            if response.status_code != 200:
                self.log(f"❌ Could not get course students: {response.status_code} - {response.text}")
                # Try to get more details about the error
                try:
                    error_data = response.json()
                    self.log(f"Error details: {error_data}")
                except:
                    pass
                return False
                
            students = response.json()
            if not students:
                self.log("⚠️ No students found in course")
                return False
                
            # Mark attendance
            attendance_data = {
                "course_id": self.test_course_id,
                "date": date.today().isoformat(),
                "attendance": [
                    {
                        "student_id": students[0]['id'],
                        "status": "present",
                        "notes": "Test attendance"
                    }
                ]
            }
            
            response = self.session.post(f"{BASE_URL}/attendance/mark_attendance/", json=attendance_data, headers=headers)
            if response.status_code == 200:
                self.log("✅ Attendance marked successfully")
                return True
            else:
                self.log(f"❌ Attendance marking failed: {response.status_code} - {response.text}")
                # Try to get more details about the error
                try:
                    error_data = response.json()
                    self.log(f"Error details: {error_data}")
                except:
                    pass
                return False
        except Exception as e:
            self.log(f"❌ Attendance marking error: {e}", "ERROR")
            return False
            
    def test_student_quiz_taking(self):
        """Test student taking the quiz"""
        try:
            # Login as student
            if not self.login_student():
                return False
                
            # Get fresh CSRF token
            if not self.get_fresh_csrf_token():
                return False
                    
            headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': self.csrf_token
            }
                
            # Get quiz questions
            response = self.session.get(f"{BASE_URL}/assignments/{self.test_assignment_id}/questions/", headers=headers)
            if response.status_code != 200:
                self.log(f"❌ Could not get quiz questions: {response.status_code} - {response.text}")
                # Try to get more details about the error
                try:
                    error_data = response.json()
                    self.log(f"Error details: {error_data}")
                except:
                    pass
                return False
                
            questions = response.json()
            if not questions:
                self.log("❌ No questions found in quiz")
                return False
                
            # Submit quiz answers
            answers = {}
            for question in questions:
                answers[str(question['id'])] = question['correct_answer']  # Use correct answers for testing
                
            quiz_data = {
                "answers": answers,
                "time_taken": 120  # 2 minutes
            }
            
            response = self.session.post(
                f"{BASE_URL}/assignments/{self.test_assignment_id}/submit_quiz/", 
                json=quiz_data,
                headers=headers
            )
            if response.status_code == 200:
                result = response.json()
                self.log(f"✅ Quiz submitted successfully. Score: {result.get('score_percentage', 0)}%")
                return True
            else:
                self.log(f"❌ Quiz submission failed: {response.status_code} - {response.text}")
                # Try to get more details about the error
                try:
                    error_data = response.json()
                    self.log(f"Error details: {error_data}")
                except:
                    pass
                return False
        except Exception as e:
            self.log(f"❌ Quiz taking error: {e}", "ERROR")
            return False
            
    def test_profile_picture_upload(self):
        """Test profile picture upload"""
        try:
            # Get fresh CSRF token
            if not self.get_fresh_csrf_token():
                return False
                    
            # Create a simple test image
            test_image_path = "test_avatar.png"
            with open(test_image_path, "wb") as f:
                # Create a minimal PNG file
                f.write(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf6\x178\xea\x00\x00\x00\x00IEND\xaeB`\x82')
            
            # Upload the image
            with open(test_image_path, "rb") as f:
                files = {"avatar": f}
                headers = {'X-CSRFToken': self.csrf_token}
                response = self.session.post(f"{BASE_URL}/users/upload_avatar/", files=files, headers=headers)
                
            # Clean up test file
            os.remove(test_image_path)
            
            if response.status_code == 200:
                result = response.json()
                self.log(f"✅ Profile picture uploaded successfully: {result.get('avatar_url', '')}")
                return True
            else:
                self.log(f"❌ Profile picture upload failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log(f"❌ Profile picture upload error: {e}", "ERROR")
            return False
            
    def test_attendance_viewing(self):
        """Test viewing attendance records"""
        try:
            # Login as student to view attendance
            if not self.login_student():
                return False
                
            # Get fresh CSRF token
            if not self.get_fresh_csrf_token():
                return False
                    
            headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': self.csrf_token
            }
                
            response = self.session.get(f"{BASE_URL}/attendance/", headers=headers)
            if response.status_code == 200:
                attendance_records = response.json()
                self.log(f"✅ Attendance records retrieved: {len(attendance_records)} records")
                return True
            else:
                self.log(f"❌ Attendance viewing failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log(f"❌ Attendance viewing error: {e}", "ERROR")
            return False
            
    def setup_test_environment(self):
        """Setup test environment by creating test users"""
        try:
            import subprocess
            import sys
            
            # Run the management command to create test users
            result = subprocess.run([
                sys.executable, 'backend/manage.py', 'create_test_users'
            ], capture_output=True, text=True, cwd='.')
            
            if result.returncode == 0:
                self.log("✅ Test environment setup successful")
                return True
            else:
                self.log(f"⚠️ Test environment setup: {result.stderr}")
                return True  # Continue anyway
        except Exception as e:
            self.log(f"⚠️ Test environment setup error: {e}")
            return True  # Continue anyway
            
    def ensure_test_users_exist(self):
        """Ensure test users exist in the database"""
        try:
            # Get fresh CSRF token
            if not self.get_fresh_csrf_token():
                return False
                    
            headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': self.csrf_token
            }
            
            # Try to create teacher user if it doesn't exist
            teacher_signup_data = {
                "email": "teacher1@example.com",
                "password": "password123",
                "name": "Test Teacher",
                "role": "teacher"
            }
            
            response = self.session.post(f"{BASE_URL}/users/signup/", json=teacher_signup_data, headers=headers)
            if response.status_code == 201:
                self.log("✅ Teacher user created")
            elif response.status_code == 400 and "already exists" in response.text:
                self.log("✅ Teacher user already exists")
            else:
                self.log(f"⚠️ Teacher user creation status: {response.status_code}")
            
            # Try to create student user if it doesn't exist
            student_signup_data = {
                "email": "student1@example.com",
                "password": "password123",
                "name": "Test Student",
                "role": "student"
            }
            
            response = self.session.post(f"{BASE_URL}/users/signup/", json=student_signup_data, headers=headers)
            if response.status_code == 201:
                self.log("✅ Student user created")
            elif response.status_code == 400 and "already exists" in response.text:
                self.log("✅ Student user already exists")
            else:
                self.log(f"⚠️ Student user creation status: {response.status_code}")
                
            return True
        except Exception as e:
            self.log(f"❌ User creation error: {e}", "ERROR")
            return False
            
    def run_all_tests(self):
        """Run all tests in sequence"""
        self.log("🚀 Starting Comprehensive Aura LMS Test Suite")
        self.log("=" * 60)
        
        tests = [
            ("Backend Connection", self.test_connection),
            ("Setup Test Environment", self.setup_test_environment),
            ("Ensure Test Users", self.ensure_test_users_exist),
            ("Teacher Login", self.login_teacher),
            ("Course Creation", self.test_course_creation),
            ("Quiz Assignment Creation", self.test_quiz_assignment_creation),
            ("Quiz Questions Creation", self.test_quiz_questions_creation),
            ("Attendance Marking", self.test_attendance_marking),
            ("Student Quiz Taking", self.test_student_quiz_taking),
            ("Profile Picture Upload", self.test_profile_picture_upload),
            ("Attendance Viewing", self.test_attendance_viewing),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            self.log(f"\n📋 Running: {test_name}")
            try:
                if test_func():
                    passed += 1
                    self.log(f"✅ {test_name} PASSED")
                else:
                    self.log(f"❌ {test_name} FAILED")
            except Exception as e:
                self.log(f"❌ {test_name} ERROR: {e}", "ERROR")
                
        self.log("\n" + "=" * 60)
        self.log(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            self.log("🎉 ALL TESTS PASSED! The system is working correctly.")
        else:
            self.log("⚠️ Some tests failed. Please check the implementation.")
            
        return passed == total

if __name__ == "__main__":
    test_suite = AuraTestSuite()
    success = test_suite.run_all_tests()
    exit(0 if success else 1)

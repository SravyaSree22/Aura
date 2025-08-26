import time
import os
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

class AuraLMSDemo:
    def __init__(self):
        # Setup Chrome options for recording
        self.chrome_options = Options()
        self.chrome_options.add_argument("--start-maximized")
        self.chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        self.chrome_options.add_argument("--kiosk")  # Fullscreen mode to hide taskbar
        self.chrome_options.add_argument("--disable-infobars")
        self.chrome_options.add_argument("--disable-extensions")
        self.chrome_options.add_argument("--disable-notifications")
        self.chrome_options.add_argument("--disable-default-apps")
        self.chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        self.chrome_options.add_experimental_option('useAutomationExtension', False)
        
        # Initialize driver with webdriver manager
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=self.chrome_options)
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        self.wait = WebDriverWait(self.driver, 15)
        self.actions = ActionChains(self.driver)
        
        # Demo data
        self.teacher_credentials = {
            'email': 'teacher1@example.com',
            'password': 'password123'
        }
        self.student_credentials = {
            'email': 'student1@example.com',
            'password': 'password123'
        }
        
    def start_recording(self):
        """Start screen recording"""
        print("🎬 Starting demo recording...")
        print("Note: For actual recording, use external tools like OBS Studio")
        print("Browser is now in fullscreen mode to hide taskbar")
        
    def stop_recording(self):
        """Stop screen recording"""
        print("⏹️ Stopping demo recording...")
        
    def safe_click(self, selector, by=By.CSS_SELECTOR, timeout=10):
        """Safely click an element with error handling"""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable((by, selector))
            )
            self.actions.move_to_element(element).click().perform()
            time.sleep(1)
            return True
        except Exception as e:
            print(f"❌ Could not click {selector}: {e}")
            return False
        
    def safe_type(self, selector, text, by=By.CSS_SELECTOR, timeout=10):
        """Safely type text into an element with error handling"""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, selector))
            )
            element.clear()
            element.send_keys(text)
            time.sleep(0.5)
            return True
        except Exception as e:
            print(f"❌ Could not type in {selector}: {e}")
            return False
        
    def safe_wait_for_element(self, selector, by=By.CSS_SELECTOR, timeout=10):
        """Safely wait for an element to be present"""
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, selector))
            )
        except Exception as e:
            print(f"❌ Element {selector} not found: {e}")
            return None
        
    def login(self, email, password):
        """Login to the application"""
        print(f"🔐 Logging in as {email}...")
        
        try:
            # Navigate to login page
            self.driver.get("http://localhost:5173/login")
            time.sleep(3)
            
            # Fill login form
            self.safe_type("input[type='email']", email)
            self.safe_type("input[type='password']", password)
            
            # Click login button
            self.safe_click("button[type='submit']")
            time.sleep(3)
            
            print("✅ Login successful")
            
        except Exception as e:
            print(f"❌ Login failed: {e}")
            
    def logout(self):
        """Logout from the application"""
        print("🚪 Logging out...")
        try:
            # Look for logout button in various possible locations
            logout_selectors = [
                "button:contains('Logout')",
                "a:contains('Logout')",
                "[data-testid='logout']",
                ".logout-button",
                "button[onclick*='logout']"
            ]
            
            for selector in logout_selectors:
                if self.safe_click(selector):
                    break
            else:
                # If no logout button found, navigate to logout URL
                self.driver.get("http://localhost:5173/logout")
                
            time.sleep(2)
            print("✅ Logout successful")
            
        except Exception as e:
            print(f"❌ Logout failed: {e}")
        
    def demo_teacher_dashboard(self):
        """Demonstrate teacher dashboard features"""
        print("\n📊 TEACHER DASHBOARD")
        print("-" * 30)
        
        # Wait for dashboard to load
        self.safe_wait_for_element(".dashboard", timeout=10)
        time.sleep(3)
        
        # Show statistics
        print("• Viewing dashboard statistics")
        time.sleep(2)
        
        # Navigate through dashboard sections
        dashboard_sections = [
            "Recent Assignments",
            "Student Performance",
            "Upcoming Deadlines",
            "Recent Activity"
        ]
        
        for section in dashboard_sections:
            print(f"• Exploring {section}")
            time.sleep(1)
            
    def demo_course_management(self):
        """Demonstrate course management features"""
        print("\n📚 COURSE MANAGEMENT")
        print("-" * 30)
        
        # Navigate to courses page
        self.safe_click("a[href='/courses']")
        time.sleep(2)
        
        # Create a new course
        print("• Creating a new course")
        self.safe_click("button:contains('Create Course')")
        time.sleep(2)
        
        # Fill course form
        self.safe_type("input[name='name']", "Advanced Mathematics")
        self.safe_type("input[name='code']", "MATH301")
        self.safe_type("input[name='schedule']", "Monday, Wednesday 10:00 AM")
        self.safe_type("input[name='color']", "#4f46e5")
        
        self.safe_click("button[type='submit']")
        time.sleep(3)
        
        print("✅ Course created successfully")
        
    def demo_assignment_creation(self):
        """Demonstrate assignment creation features"""
        print("\n📝 ASSIGNMENT CREATION")
        print("-" * 30)
        
        # Navigate to a course
        self.safe_click("a[href*='/courses/']")
        time.sleep(2)
        
        # Create regular assignment
        print("• Creating regular assignment")
        self.safe_click("button:contains('Create Assignment')")
        time.sleep(2)
        
        self.safe_type("input[name='title']", "Calculus Problem Set")
        self.safe_type("textarea[name='description']", "Complete problems 1-10 from Chapter 3")
        self.safe_type("input[name='dueDate']", "2024-12-31")
        self.safe_type("input[name='maxGrade']", "100")
        
        self.safe_click("button[type='submit']")
        time.sleep(3)
        
        # Create quiz assignment
        print("• Creating quiz assignment")
        self.safe_click("button:contains('Create Assignment')")
        time.sleep(2)
        
        self.safe_type("input[name='title']", "Calculus Quiz")
        self.safe_type("textarea[name='description']", "Multiple choice quiz on derivatives")
        self.safe_type("input[name='dueDate']", "2024-12-31")
        self.safe_type("input[name='maxGrade']", "50")
        
        # Select quiz type
        self.safe_click("input[value='quiz']")
        self.safe_click("button[type='submit']")
        time.sleep(3)
        
        # Add quiz questions
        print("• Adding quiz questions")
        self.safe_click("button:contains('Add Questions')")
        time.sleep(2)
        
        # Add first question
        self.safe_type("input[name='question_text']", "What is the derivative of x²?")
        self.safe_type("input[name='option_a']", "x")
        self.safe_type("input[name='option_b']", "2x")
        self.safe_type("input[name='option_c']", "2x²")
        self.safe_type("input[name='option_d']", "x²")
        self.safe_click("input[value='B']")
        self.safe_click("button:contains('Add Question')")
        time.sleep(2)
        
        # Add second question
        self.safe_type("input[name='question_text']", "What is the integral of 2x?")
        self.safe_type("input[name='option_a']", "x²")
        self.safe_type("input[name='option_b']", "x² + C")
        self.safe_type("input[name='option_c']", "2x²")
        self.safe_type("input[name='option_d']", "2x² + C")
        self.safe_click("input[value='B']")
        self.safe_click("button:contains('Add Question')")
        time.sleep(2)
        
        # Save quiz
        self.safe_click("button:contains('Save Quiz')")
        time.sleep(3)
        
        print("✅ Quiz created with questions")
        
    def demo_student_management(self):
        """Demonstrate student management features"""
        print("\n👥 STUDENT MANAGEMENT")
        print("-" * 30)
        
        # Navigate to students page
        self.safe_click("a[href='/students']")
        time.sleep(2)
        
        # Enroll student
        print("• Enrolling a student")
        self.safe_click("button:contains('Enroll Student')")
        time.sleep(2)
        self.safe_type("input[name='email']", "student1@example.com")
        self.safe_click("button[type='submit']")
        time.sleep(3)
        
        print("✅ Student enrolled successfully")
        
    def demo_grade_management(self):
        """Demonstrate grade management features"""
        print("\n📊 GRADE MANAGEMENT")
        print("-" * 30)
        
        # Navigate to grades page
        self.safe_click("a[href='/grades']")
        time.sleep(2)
        
        # Grade an assignment
        print("• Grading an assignment")
        self.safe_click("button:contains('Grade')")
        time.sleep(2)
        self.safe_type("input[name='grade']", "85")
        self.safe_type("textarea[name='feedback']", "Excellent work! Good understanding of the concepts.")
        self.safe_click("button[type='submit']")
        time.sleep(3)
        
        print("✅ Assignment graded successfully")
        
    def demo_attendance_management(self):
        """Demonstrate attendance management features"""
        print("\n📅 ATTENDANCE MANAGEMENT")
        print("-" * 30)
        
        # Navigate to attendance page
        self.safe_click("a[href='/attendance']")
        time.sleep(2)
        
        # Start attendance session
        print("• Starting attendance session")
        self.safe_click("button:contains('Start Session')")
        time.sleep(2)
        self.safe_type("textarea[name='notes']", "Regular class session")
        self.safe_click("button[type='submit']")
        time.sleep(3)
        
        # Mark attendance
        print("• Marking student attendance")
        self.safe_click("button:contains('Present')")
        time.sleep(2)
        
        print("✅ Attendance marked successfully")
        
    def demo_student_dashboard(self):
        """Demonstrate student dashboard features"""
        print("\n📊 STUDENT DASHBOARD")
        print("-" * 30)
        
        # Wait for dashboard to load
        self.safe_wait_for_element(".student-dashboard", timeout=10)
        time.sleep(3)
        
        # Show statistics
        print("• Viewing student dashboard")
        time.sleep(2)
        
        # Navigate through dashboard sections
        dashboard_sections = [
            "My Courses",
            "Recent Assignments",
            "Grades Overview",
            "Attendance Summary"
        ]
        
        for section in dashboard_sections:
            print(f"• Exploring {section}")
            time.sleep(1)
            
    def demo_assignment_submission(self):
        """Demonstrate assignment submission features"""
        print("\n📤 ASSIGNMENT SUBMISSION")
        print("-" * 30)
        
        # Navigate to a course
        self.safe_click("a[href*='/courses/']")
        time.sleep(2)
        
        # Submit an assignment
        print("• Submitting an assignment")
        self.safe_click("button:contains('Submit Assignment')")
        time.sleep(2)
        
        # Upload file (simulate)
        file_input = self.safe_wait_for_element("input[type='file']")
        if file_input:
            # Create a simple text file for upload
            with open("test_assignment.txt", "w") as f:
                f.write("This is a test assignment submission.")
            file_input.send_keys(os.path.abspath("test_assignment.txt"))
            time.sleep(2)
        
        self.safe_click("button[type='submit']")
        time.sleep(3)
        
        print("✅ Assignment submitted successfully")
        
    def demo_quiz_taking(self):
        """Demonstrate quiz taking features"""
        print("\n📝 QUIZ TAKING")
        print("-" * 30)
        
        # Take a quiz
        print("• Taking a quiz")
        self.safe_click("button:contains('Take Quiz')")
        time.sleep(2)
        
        # Answer questions
        print("• Answering quiz questions")
        self.safe_click("input[value='B']")  # First question
        time.sleep(1)
        self.safe_click("input[value='B']")  # Second question
        time.sleep(1)
        
        # Submit quiz
        self.safe_click("button:contains('Submit Quiz')")
        time.sleep(3)
        
        # View results
        self.safe_wait_for_element(".quiz-results")
        time.sleep(3)
        
        print("✅ Quiz completed successfully")
        
    def demo_emotion_detection(self):
        """Demonstrate emotion detection features"""
        print("\n😊 EMOTION DETECTION")
        print("-" * 30)
        
        # Navigate to emotion detection page
        self.safe_click("a[href='/emotion']")
        time.sleep(2)
        
        # Take emotion photo
        print("• Taking emotion photo")
        self.safe_click("button:contains('Take Photo')")
        time.sleep(3)
        
        # View emotion results
        self.safe_wait_for_element(".emotion-result")
        time.sleep(3)
        
        print("✅ Emotion detection completed")
        
    def demo_doubt_submission(self):
        """Demonstrate doubt submission features"""
        print("\n❓ DOUBT SUBMISSION")
        print("-" * 30)
        
        # Navigate to doubts page
        self.safe_click("a[href='/doubts']")
        time.sleep(2)
        
        # Submit a doubt
        print("• Submitting a doubt")
        self.safe_click("button:contains('Ask Question')")
        time.sleep(2)
        self.safe_type("textarea[name='question']", "I'm having trouble understanding the chain rule in calculus. Can you help?")
        self.safe_click("button[type='submit']")
        time.sleep(3)
        
        print("✅ Doubt submitted successfully")
        
    def demo_help_support(self):
        """Demonstrate help and support features"""
        print("\n🆘 HELP & SUPPORT")
        print("-" * 30)
        
        # Navigate to help page
        self.safe_click("a[href='/help']")
        time.sleep(2)
        
        # View FAQs
        print("• Viewing FAQs")
        self.safe_wait_for_element(".faq-section")
        time.sleep(3)
        
        # Search FAQs
        print("• Searching FAQs")
        self.safe_type("input[name='search']", "assignment submission")
        self.safe_click("button:contains('Search')")
        time.sleep(3)
        
        # Contact support
        print("• Contacting support")
        self.safe_click("button:contains('Contact Support')")
        time.sleep(2)
        self.safe_type("input[name='name']", "John Student")
        self.safe_type("input[name='email']", "student1@example.com")
        self.safe_type("input[name='subject']", "Technical Issue")
        self.safe_type("textarea[name='message']", "I'm having trouble accessing my assignments.")
        self.safe_click("button[type='submit']")
        time.sleep(3)
        
        print("✅ Help & support features demonstrated")
        
    def demo_teacher_features(self):
        """Demonstrate all teacher features"""
        print("\n👨‍🏫 TEACHER FEATURES DEMO")
        print("=" * 50)
        
        # Login as teacher
        self.login(self.teacher_credentials['email'], self.teacher_credentials['password'])
        time.sleep(2)
        
        # Demo all teacher features
        self.demo_teacher_dashboard()
        self.demo_course_management()
        self.demo_assignment_creation()
        self.demo_student_management()
        self.demo_grade_management()
        self.demo_attendance_management()
        
        # Additional features
        print("\n📈 ADDITIONAL TEACHER FEATURES")
        print("-" * 30)
        
        # Analytics
        print("• Performance Analytics")
        self.safe_click("a[href='/analytics']")
        time.sleep(3)
        
        # Notifications
        print("• Notifications")
        self.safe_click("a[href='/notifications']")
        time.sleep(3)
        
        # Profile
        print("• Profile Management")
        self.safe_click("a[href='/profile']")
        time.sleep(3)
        
    def demo_student_features(self):
        """Demonstrate all student features"""
        print("\n👨‍🎓 STUDENT FEATURES DEMO")
        print("=" * 50)
        
        # Login as student
        self.login(self.student_credentials['email'], self.student_credentials['password'])
        time.sleep(2)
        
        # Demo all student features
        self.demo_student_dashboard()
        self.demo_assignment_submission()
        self.demo_quiz_taking()
        self.demo_emotion_detection()
        self.demo_doubt_submission()
        self.demo_help_support()
        
        # Additional features
        print("\n📚 ADDITIONAL STUDENT FEATURES")
        print("-" * 30)
        
        # Grades
        print("• Grade Viewing")
        self.safe_click("a[href='/grades']")
        time.sleep(3)
        
        # Attendance
        print("• Attendance Tracking")
        self.safe_click("a[href='/attendance']")
        time.sleep(3)
        
        # Badges
        print("• Badge System")
        self.safe_click("a[href='/badges']")
        time.sleep(3)
        
        # Schedule
        print("• Schedule Viewing")
        self.safe_click("a[href='/schedule']")
        time.sleep(3)
        
        # Notifications
        print("• Notifications")
        self.safe_click("a[href='/notifications']")
        time.sleep(3)
        
        # Profile
        print("• Profile Management")
        self.safe_click("a[href='/profile']")
        time.sleep(3)
        
    def run_full_demo(self):
        """Run the complete demo"""
        try:
            self.start_recording()
            
            print("🎬 Starting Aura LMS Comprehensive Demo")
            print("=" * 60)
            print("This demo will showcase all features of the Aura LMS system")
            print("including both teacher and student perspectives.")
            print("Browser is in fullscreen mode for clean recording.")
            print("=" * 60)
            
            # Teacher features demo
            self.demo_teacher_features()
            
            # Logout and switch to student
            self.logout()
            time.sleep(2)
            
            # Student features demo
            self.demo_student_features()
            
            print("\n" + "=" * 60)
            print("✅ Demo completed successfully!")
            print("🎉 All features of Aura LMS have been demonstrated")
            print("=" * 60)
            
        except Exception as e:
            print(f"❌ Error during demo: {e}")
            import traceback
            traceback.print_exc()
        finally:
            self.stop_recording()
            self.driver.quit()

if __name__ == "__main__":
    print("🚀 Starting Aura LMS Demo Script")
    print("Make sure both frontend and backend servers are running:")
    print("• Frontend: npm run dev (http://localhost:5173)")
    print("• Backend: python manage.py runserver (http://localhost:8000)")
    print()
    print("📹 Browser will open in fullscreen mode to hide taskbar")
    print("Press F11 to exit fullscreen mode if needed")
    print()
    
    input("Press Enter to start the demo...")
    
    demo = AuraLMSDemo()
    demo.run_full_demo()

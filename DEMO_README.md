# Aura LMS Demo Video Script

This repository contains a comprehensive Selenium automation script to create a demo video showcasing all features of the Aura LMS (Learning Management System) project.

## 🎬 Demo Overview

The demo script will automatically showcase:

### 👨‍🏫 Teacher Features
- **Dashboard Overview** - Statistics and recent activity
- **Course Management** - Create and manage courses
- **Assignment Creation** - Create regular assignments and quizzes with MCQ questions
- **Student Management** - Enroll and manage students
- **Grade Management** - Grade assignments with feedback
- **Attendance Management** - Start sessions and mark attendance
- **Performance Analytics** - View student performance charts
- **Notifications** - Manage system notifications
- **Profile Management** - Update teacher profile

### 👨‍🎓 Student Features
- **Student Dashboard** - Overview of courses and assignments
- **Assignment Submission** - Submit assignments with file uploads
- **Quiz Taking** - Take MCQ quizzes with automatic grading
- **Emotion Detection** - AI-powered emotion analysis
- **Doubt Submission** - Ask questions to teachers
- **Grade Viewing** - View grades and feedback
- **Attendance Tracking** - View attendance history
- **Badge System** - Earn and view achievement badges
- **Schedule Viewing** - View class schedules
- **Help & Support** - FAQs and contact support
- **Profile Management** - Update student profile

## 🚀 Prerequisites

Before running the demo, ensure you have:

1. **Python 3.8+** installed
2. **Chrome Browser** installed
3. **Both servers running**:
   - Frontend: `npm run dev` (http://localhost:5173)
   - Backend: `python manage.py runserver` (http://localhost:8000)

## 📦 Installation

1. **Install demo dependencies**:
   ```bash
   pip install -r demo_requirements.txt
   ```

2. **Ensure test users exist**:
   ```bash
   cd backend
   python manage.py create_test_users
   ```

3. **Create test data** (optional):
   ```bash
   cd backend
   python manage.py populate_data
   ```

## 🎥 Running the Demo

### Option 1: Full Demo (Recommended)
```bash
python aura_demo.py
```

This will run a comprehensive demo covering all features.

### Option 2: Manual Recording
1. Start your screen recording software (OBS Studio, Camtasia, etc.)
2. Run the demo script
3. Stop recording when the demo completes

### Option 3: Step-by-Step Demo
You can modify the script to run specific sections by commenting out unwanted features.

## 📋 Demo Script Features

### 🔧 Robust Error Handling
- Safe element interactions with timeouts
- Graceful handling of missing elements
- Detailed error logging

### 🎯 Smart Element Detection
- Multiple selector strategies
- Dynamic waiting for elements
- Fallback mechanisms

### 📱 Responsive Design Support
- Works with different screen sizes
- Handles mobile and desktop layouts

### 🎨 Visual Feedback
- Console output with emojis and progress indicators
- Clear section separators
- Success/failure status messages

## 🎬 Recording Tips

### For Best Quality Video:
1. **Use OBS Studio** for professional recording
2. **Set resolution** to 1920x1080 or higher
3. **Use hardware encoding** for better performance
4. **Record at 30fps** for smooth playback

### Audio Narration:
1. **Prepare a script** based on the demo sections
2. **Record audio separately** and sync in post-production
3. **Use a good microphone** for clear audio

### Post-Production:
1. **Add transitions** between sections
2. **Include captions** for key features
3. **Add background music** (optional)
4. **Include project title** and credits

## 📁 File Structure

```
Aura_project/
├── aura_demo.py              # Main demo script
├── demo_requirements.txt     # Python dependencies
├── DEMO_README.md           # This file
├── test_image.jpg           # Test file for uploads
└── backend/
    └── api/
        └── management/
            └── commands/
                ├── create_test_users.py
                └── populate_data.py
```

## 🔧 Customization

### Modifying Demo Content:
1. **Change credentials** in the script
2. **Adjust timing** by modifying `time.sleep()` values
3. **Add new features** by creating new demo methods
4. **Customize selectors** for different UI elements

### Adding New Features:
```python
def demo_new_feature(self):
    """Demonstrate a new feature"""
    print("\n🆕 NEW FEATURE")
    print("-" * 30)
    
    # Navigate to feature
    self.safe_click("a[href='/new-feature']")
    time.sleep(2)
    
    # Demonstrate functionality
    print("• Using new feature")
    # Add your demo steps here
    
    print("✅ New feature demonstrated")
```

## 🐛 Troubleshooting

### Common Issues:

1. **Element not found**:
   - Check if the UI has changed
   - Verify the selector is correct
   - Increase timeout values

2. **Login fails**:
   - Ensure test users exist
   - Check server is running
   - Verify credentials

3. **Chrome driver issues**:
   - Update Chrome browser
   - Reinstall webdriver-manager
   - Check Chrome version compatibility

4. **Slow performance**:
   - Reduce `time.sleep()` values
   - Close other applications
   - Use SSD for better performance

### Debug Mode:
Add debug logging by modifying the script:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📞 Support

If you encounter issues:
1. Check the console output for error messages
2. Verify all prerequisites are met
3. Ensure both servers are running
4. Check browser console for JavaScript errors

## 🎉 Demo Output

The script will output progress in the console:
```
🎬 Starting Aura LMS Comprehensive Demo
============================================================
This demo will showcase all features of the Aura LMS system
including both teacher and student perspectives.
============================================================

👨‍🏫 TEACHER FEATURES DEMO
==================================================

📊 TEACHER DASHBOARD
------------------------------
• Viewing dashboard statistics
• Exploring Recent Assignments
• Exploring Student Performance
• Exploring Upcoming Deadlines
• Exploring Recent Activity

📚 COURSE MANAGEMENT
------------------------------
• Creating a new course
✅ Course created successfully

[... continues with all features ...]

✅ Demo completed successfully!
🎉 All features of Aura LMS have been demonstrated
============================================================
```

## 📝 License

This demo script is part of the Aura LMS project and follows the same license terms.

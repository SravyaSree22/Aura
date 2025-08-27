# Aura Learning Management System

A comprehensive learning management system with real-time facial emotion recognition for personalized learning experiences.

## Features

### 🎓 Learning Management
- **Course Management**: Teachers can create and manage courses with detailed information
- **Assignment System**: Create, submit, and grade assignments with real-time tracking
- **Grade Tracking**: Comprehensive grade management with performance analytics
- **Attendance System**: Track student attendance with detailed reporting
- **Schedule Management**: Dynamic schedule system with database-driven events

### 📊 Analytics & Insights
- **Student Performance Charts**: Visual analytics for grade distributions, attendance trends, and performance comparisons
- **Emotional Status Tracking**: Real-time emotion detection and analysis
- **Progress Monitoring**: Track student progress with detailed statistics
- **Teacher Dashboard**: Comprehensive overview of class performance

### 😊 Facial Emotion Recognition
- **Real-time Detection**: Live camera feed with emotion analysis
- **MediaPipe Integration**: Advanced facial landmark detection for accurate emotion recognition
- **Emotion History**: Track emotional patterns over time
- **Statistics Dashboard**: Visual breakdown of emotional states
- **Fallback Support**: Works with OpenCV when MediaPipe is unavailable

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Customizable interface themes
- **Interactive Charts**: Dynamic data visualization
- **Real-time Updates**: Live data synchronization

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Context API** for state management

### Backend
- **Django 5.2** with Django REST Framework
- **SQLite** database (can be easily migrated to PostgreSQL/MySQL)
- **Session-based Authentication**
- **CSRF Protection**

### AI/ML Components
- **MediaPipe** for facial landmark detection
- **OpenCV** for image processing
- **NumPy** for numerical computations
- **Fallback Support** for environments without MediaPipe

## Installation

### Prerequisites
- Python 3.8-3.11 (for MediaPipe compatibility)
- Node.js 16+ and npm
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Aura_project
   ```

2. **Set up Python virtual environment**
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # or
   source .venv/bin/activate  # Linux/Mac
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r ../requirements.txt
   ```

4. **Install MediaPipe (Optional but Recommended)**
   ```bash
   pip install mediapipe
   ```
   > **Note**: MediaPipe requires Python 3.8-3.11. If you're using Python 3.12+, the system will fallback to OpenCV-based detection.

5. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

6. **Populate sample data**
   ```bash
   python manage.py populate_data
   ```

7. **Start the Django server**
   ```bash
   python manage.py runserver 8050
   ```

### Frontend Setup

1. **Install Node.js dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## Facial Emotion Recognition Setup

### MediaPipe Installation (Recommended)

For the best emotion recognition accuracy, install MediaPipe:

```bash
# Ensure you're using Python 3.8-3.11
python --version

# Install MediaPipe
pip install mediapipe

# Verify installation
python -c "import mediapipe; print('MediaPipe installed successfully')"
```

### Fallback Mode

If MediaPipe is not available (Python 3.12+ or installation issues), the system automatically falls back to OpenCV-based face detection with simulated emotion recognition.

### Emotion Detection Methods

1. **MediaPipe (Best)**: Uses facial landmarks for accurate emotion detection
2. **OpenCV (Fallback)**: Basic face detection with simulated emotions
3. **Simulation (Last Resort)**: Random emotion generation for testing

## Usage

### Teacher Features
- **Dashboard**: View class performance overview
- **Student Management**: Monitor individual student progress
- **Schedule Management**: Create and manage course schedules
- **Analytics**: Access detailed performance charts

### Student Features
- **Course Viewing**: Browse enrolled courses
- **Assignment Submission**: Submit assignments with real-time feedback
- **Emotion Tracking**: Use facial recognition for emotional well-being monitoring
- **Progress Tracking**: Monitor personal performance

### Emotion Recognition

1. **Access the Emotion Detector**:
   - Navigate to the student dashboard
   - Click on "Emotion Detector"

2. **Start Detection**:
   - Click "Start Detection"
   - Allow camera access when prompted
   - The system will analyze your facial expressions in real-time

3. **View Results**:
   - Current emotion is displayed in real-time
   - Emotion history is tracked
   - Statistics show emotional patterns

## API Endpoints

### Authentication
- `POST /api/users/login/` - User login
- `GET /api/users/csrf_token/` - Get CSRF token

### Core Features
- `GET /api/courses/` - List courses
- `GET /api/assignments/` - List assignments
- `GET /api/grades/` - List grades
- `GET /api/schedules/` - List schedules

### Emotion Recognition
- `POST /api/emotions/detect/` - Detect emotions from image data

## Development

### Project Structure
```
Aura_project/
├── backend/                 # Django backend
│   ├── api/                # Main API app
│   │   ├── models.py       # Database models
│   │   ├── views.py        # API views
│   │   ├── serializers.py  # Data serialization
│   │   └── urls.py         # URL routing
│   └── backend/            # Django settings
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── context/           # React context
│   └── services/          # API services
└── requirements.txt        # Python dependencies
```

### Adding New Features

1. **Backend Changes**:
   - Add models in `backend/api/models.py`
   - Create serializers in `backend/api/serializers.py`
   - Add views in `backend/api/views.py`
   - Run migrations: `python manage.py makemigrations && python manage.py migrate`

2. **Frontend Changes**:
   - Add components in `src/components/`
   - Create pages in `src/pages/`
   - Update types in `src/types/index.ts`
   - Add API services in `src/services/api.ts`

## Troubleshooting

### MediaPipe Installation Issues
- **Python Version**: Ensure you're using Python 3.8-3.11
- **Windows Issues**: Try installing from wheel files
- **Alternative**: Use the fallback mode with OpenCV

### Camera Access Issues
- **Browser Permissions**: Ensure camera access is allowed
- **HTTPS**: Some browsers require HTTPS for camera access
- **Fallback**: The system will work without camera access

### Performance Issues
- **Image Size**: Reduce camera resolution if needed
- **Detection Frequency**: Adjust detection intervals
- **Browser**: Use modern browsers for best performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- **MediaPipe**: For facial landmark detection capabilities
- **OpenCV**: For computer vision functionality
- **Django REST Framework**: For robust API development
- **React**: For modern frontend development

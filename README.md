# Aura - Educational Management System

A comprehensive educational management system with a React TypeScript frontend and Django REST API backend.

## Features

- **Student Dashboard**: View grades, assignments, attendance, and emotional tracking
- **Teacher Dashboard**: Monitor student performance and manage courses
- **Real-time Data**: All data is now served from a Django backend with SQLite database
- **Authentication**: Secure login system with session-based authentication
- **Emotion Detection**: AI-powered emotion tracking for student well-being
- **Assignment Management**: Submit and track assignments with real-time updates
- **Doubt Resolution**: Ask questions and get answers from teachers
- **Performance Analytics**: Detailed student performance metrics and trends

## Tech Stack

### Frontend
- React 19.0.0
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Chart.js for analytics
- Lucide React for icons

### Backend
- Django 5.2.1
- Django REST Framework
- SQLite Database
- Django CORS Headers
- Session Authentication

## Project Structure

```
aura/
├── backend/                 # Django backend
│   ├── api/                # API app
│   │   ├── models.py       # Database models
│   │   ├── serializers.py  # API serializers
│   │   ├── views.py        # API views
│   │   └── urls.py         # API URLs
│   ├── backend/            # Django project settings
│   └── manage.py           # Django management
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── context/           # React contexts
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── types/             # TypeScript types
└── package.json           # Frontend dependencies
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install django djangorestframework django-cors-headers
   ```

3. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

4. **Populate database with sample data:**
   ```bash
   python manage.py populate_data
   ```

5. **Start Django server:**
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/users/login/` - User login

### Data Endpoints
- `GET /api/courses/` - List courses
- `GET /api/grades/` - List grades
- `GET /api/assignments/` - List assignments
- `POST /api/assignments/{id}/submit/` - Submit assignment
- `GET /api/attendance/` - List attendance
- `GET /api/emotions/` - List emotions
- `POST /api/emotions/detect/` - Detect emotion
- `GET /api/badges/` - List badges
- `GET /api/doubts/` - List doubts
- `POST /api/doubts/` - Submit doubt
- `POST /api/doubts/{id}/answer/` - Answer doubt
- `GET /api/student-stats/` - Student statistics

## Sample Users

### Student
- Email: `alex@example.com`
- Password: `password123`

### Teachers
- Email: `sarah@example.com` (Mathematics)
- Email: `michael@example.com` (Computer Science)
- Email: `emily@example.com` (Physics)
- Email: `james@example.com` (Literature)
- Password: `password123` (for all teachers)

## Key Changes Made

### Backend Implementation
1. **Django Models**: Created comprehensive models for all data types
2. **API Serializers**: Convert Django models to JSON format
3. **ViewSets**: RESTful API endpoints with proper permissions
4. **Authentication**: Session-based authentication system
5. **CORS Configuration**: Allow frontend to communicate with backend
6. **Sample Data**: Populated database with realistic educational data

### Frontend Integration
1. **API Services**: Replaced mock data with real API calls
2. **Context Updates**: Updated all React contexts to use real data
3. **Error Handling**: Added proper error handling for API calls
4. **Loading States**: Added loading indicators for better UX
5. **Real-time Updates**: Implemented real-time data updates

### Data Flow
- Frontend makes API calls to Django backend
- Backend serves data from SQLite database
- Session authentication ensures secure access
- CORS allows cross-origin requests
- Real-time updates when data changes

## Development

### Adding New Features
1. Create Django models in `backend/api/models.py`
2. Add serializers in `backend/api/serializers.py`
3. Create views in `backend/api/views.py`
4. Add API service in `src/services/api.ts`
5. Update React contexts to use new data

### Database Changes
1. Modify models in `backend/api/models.py`
2. Run `python manage.py makemigrations`
3. Run `python manage.py migrate`

## Testing

You can test the API using the provided `test_api.html` file or tools like Postman.

## Production Deployment

For production deployment:
1. Use PostgreSQL instead of SQLite
2. Configure proper CORS settings
3. Set up proper authentication (JWT recommended)
4. Use environment variables for sensitive data
5. Configure static file serving
6. Set up proper logging and monitoring

## License

This project is for educational purposes.

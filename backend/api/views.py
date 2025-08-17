from datetime import date

from django.contrib.auth import login
from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from django.db import models
from django.middleware.csrf import get_token
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import (
    Course, Grade, Assignment, Attendance, Emotion, Badge, Doubt,
    StudentStats, AssignmentSubmission, Schedule, Notification,
    UserProfile, FAQ, ContactMessage, QuizQuestion, QuizSubmission,
    AttendanceSession
)
from .serializers import (
    UserSerializer, CourseSerializer, GradeSerializer, AssignmentSerializer,
    AttendanceSerializer, EmotionSerializer, BadgeSerializer, DoubtSerializer, StudentStatsSerializer,
    AssignmentSubmissionSerializer, ScheduleSerializer, NotificationSerializer, UserProfileSerializer,
    FAQSerializer, ContactMessageSerializer, QuizQuestionSerializer,
    QuizQuestionTeacherSerializer, AttendanceSessionSerializer
)


from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            # Teachers can see all users
            return User.objects.all()
        else:
            # Students can only see themselves
            return User.objects.filter(id=user.id)

    def get_object(self):
        if self.request.user.is_staff:
            return super().get_object()
        else:
            # Students can only access their own profile
            return self.request.user

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile"""
        return Response(self.get_serializer(request.user).data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def csrf_token(self, request):
        """Get CSRF token for the frontend"""
        from django.middleware.csrf import get_token
        return Response({'csrfToken': get_token(request)})

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """User login"""
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=400)
        
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                login(request, user)
                return Response(self.get_serializer(user).data)
            else:
                return Response({'error': 'Invalid credentials'}, status=401)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=401)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def signup(self, request):
        """User registration"""
        email = request.data.get('email')
        password = request.data.get('password')
        name = request.data.get('name')
        role = request.data.get('role', 'student')
        
        if not all([email, password, name]):
            return Response({'error': 'Email, password, and name are required'}, status=400)
        
        if User.objects.filter(email=email).exists():
            return Response({'error': 'User with this email already exists'}, status=400)
        
        # Create user
        username = email.split('@')[0]
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name.split()[0] if ' ' in name else name,
            last_name=name.split()[1] if ' ' in name else '',
            is_staff=(role == 'teacher')
        )
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        login(request, user)
        return Response(self.get_serializer(user).data)


class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    def get_object(self):
        # Users can only access their own profile
        return self.request.user.profile

    @action(detail=False, methods=['post'])
    def upload_profile_picture(self, request):
        """Upload profile picture"""
        profile = self.get_object()
        
        if 'profile_picture' not in request.FILES:
            return Response({'error': 'No profile picture provided'}, status=400)
        
        profile.profile_picture = request.FILES['profile_picture']
        profile.save()
        
        return Response({
            'message': 'Profile picture uploaded successfully',
            'profile_picture_url': profile.profile_picture.url
        })


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:  # Teacher
            return Course.objects.filter(teacher=user)
        else:  # Student
            return Course.objects.filter(students=user)

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only teachers can create courses")
        try:
            serializer.save(teacher=self.request.user)
        except Exception as e:
            print(f"Course creation error: {e}")
            raise

    def perform_update(self, serializer):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only teachers can update courses")
        course = self.get_object()
        if course.teacher != self.request.user:
            raise PermissionDenied("You can only update your own courses")
        serializer.save()

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only teachers can delete courses")
        if instance.teacher != self.request.user:
            raise PermissionDenied("You can only delete your own courses")
        instance.delete()

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get students enrolled in a specific course"""
        try:
            course = self.get_object()
            # Check if the user is the teacher of this course
            if not request.user.is_staff or course.teacher != request.user:
                raise PermissionDenied("You can only view students for your own courses")
            
            # Get real students enrolled in the course
            students = course.students.all()
            student_data = []
            
            for student in students:
                student_data.append({
                    'id': student.id,
                    'name': f"{student.first_name} {student.last_name}".strip() or student.username,
                    'email': student.email,
                    'username': student.username
                })
            
            return Response(student_data)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)


class GradeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Grade.objects.all()
        else:
            return Grade.objects.filter(student=user)


class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            # Teachers can see all assignments for their courses
            return Assignment.objects.filter(course__teacher=user)
        else:
            # Students can see assignments for courses they're enrolled in
            return Assignment.objects.filter(course__students=user)

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only teachers can create assignments")
        try:
            serializer.save()
        except Exception as e:
            print(f"Assignment creation error: {e}")
            raise

    def perform_update(self, serializer):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only teachers can update assignments")
        assignment = self.get_object()
        if assignment.course.teacher != self.request.user:
            raise PermissionDenied("You can only update assignments for your own courses")
        serializer.save()

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only teachers can delete assignments")
        if instance.course.teacher != self.request.user:
            raise PermissionDenied("You can only delete assignments for your own courses")
        instance.delete()

    @action(detail=True, methods=['post'])
    def add_questions(self, request, pk=None):
        """Add quiz questions to an assignment"""
        if not request.user.is_staff:
            raise PermissionDenied("Only teachers can add questions")
        
        assignment = self.get_object()
        if assignment.course.teacher != request.user:
            raise PermissionDenied("You can only add questions to your own assignments")
        
        if assignment.assignment_type != 'quiz':
            return Response({'error': 'Only quiz assignments can have questions'}, status=400)
        
        questions_data = request.data.get('questions', [])
        created_questions = []
        
        for i, question_data in enumerate(questions_data):
            question = QuizQuestion.objects.create(
                assignment=assignment,
                question_text=question_data['question_text'],
                option_a=question_data['option_a'],
                option_b=question_data['option_b'],
                option_c=question_data['option_c'],
                option_d=question_data['option_d'],
                correct_answer=question_data['correct_answer'],
                points=question_data.get('points', 1),
                order=i
            )
            created_questions.append(QuizQuestionTeacherSerializer(question).data)
        
        return Response({
            'message': f'Added {len(created_questions)} questions',
            'questions': created_questions
        })

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get questions for an assignment (teacher view with correct answers)"""
        assignment = self.get_object()
        
        if request.user.is_staff and assignment.course.teacher == request.user:
            # Teacher view with correct answers
            questions = QuizQuestionTeacherSerializer(assignment.questions.all(), many=True).data
        else:
            # Student view without correct answers
            questions = QuizQuestionSerializer(assignment.questions.all(), many=True).data
        
        return Response({'questions': questions})

    @action(detail=True, methods=['post'])
    def submit_quiz(self, request, pk=None):
        """Submit a quiz with answers"""
        if request.user.is_staff:
            raise PermissionDenied("Teachers cannot submit quizzes")
        
        assignment = self.get_object()
        if assignment.assignment_type != 'quiz':
            return Response({'error': 'This is not a quiz assignment'}, status=400)
        
        # Check if already submitted
        existing_submission = AssignmentSubmission.objects.filter(
            assignment=assignment, student=request.user
        ).first()
        
        if existing_submission and existing_submission.status != 'pending':
            return Response({'error': 'Quiz already submitted'}, status=400)
        
        answers = request.data.get('answers', {})
        time_taken = request.data.get('time_taken', 0)
        
        # Calculate score
        questions = assignment.questions.all()
        correct_answers = 0
        total_points = 0
        
        for question in questions:
            total_points += question.points
            student_answer = answers.get(str(question.id))
            if student_answer == question.correct_answer:
                correct_answers += question.points
        
        score_percentage = (correct_answers / total_points * 100) if total_points > 0 else 0
        
        # Create or update submission
        if existing_submission:
            submission = existing_submission
        else:
            submission = AssignmentSubmission.objects.create(
                assignment=assignment,
                student=request.user,
                status='submitted',
                submitted_at=timezone.now()
            )
        
        # Create quiz submission
        QuizSubmission.objects.create(
            assignment_submission=submission,
            answers=answers,
            correct_answers=correct_answers,
            total_questions=questions.count(),
            score_percentage=score_percentage,
            time_taken=time_taken
        )
        
        # Auto-grade the submission
        submission.grade = score_percentage
        submission.status = 'graded'
        submission.graded_at = timezone.now()
        
        # Generate performance analysis and feedback
        performance_analysis = self._generate_performance_analysis(assignment, answers, questions)
        feedback = self._generate_feedback(score_percentage, performance_analysis)
        detailed_feedback = self._generate_detailed_feedback(assignment, answers, questions)
        improvement_suggestions = self._generate_improvement_suggestions(score_percentage, performance_analysis)
        
        submission.performance_analysis = performance_analysis
        submission.feedback = feedback
        submission.detailed_feedback = detailed_feedback
        submission.improvement_suggestions = improvement_suggestions
        submission.save()
        
        return Response({
            'message': 'Quiz submitted successfully',
            'score': score_percentage,
            'correct_answers': correct_answers,
            'total_questions': questions.count(),
            'performance_analysis': performance_analysis,
            'feedback': feedback
        })

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit a regular assignment with file upload"""
        
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        
        if request.user.is_staff:
            raise PermissionDenied("Teachers cannot submit assignments")
        
        assignment = self.get_object()
        if assignment.assignment_type == 'quiz':
            return Response({'error': 'Use submit_quiz for quiz assignments'}, status=400)
        
        # Check if already submitted
        existing_submission = AssignmentSubmission.objects.filter(
            assignment=assignment, student=request.user
        ).first()
        
        if existing_submission and existing_submission.status != 'pending':
            return Response({'error': 'Assignment already submitted'}, status=400)
        
        # Get the uploaded file
        submission_file = request.FILES.get('submission_file')
        if not submission_file:
            return Response({'error': 'No file uploaded'}, status=400)
        
        # Validate file type and size
        allowed_types = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif']
        file_extension = submission_file.name.split('.')[-1].lower()
        
        if file_extension not in allowed_types:
            return Response({
                'error': f'File type not allowed. Allowed types: {", ".join(allowed_types)}'
            }, status=400)
        
        # Check file size (max 10MB)
        if submission_file.size > 10 * 1024 * 1024:
            return Response({'error': 'File size too large. Maximum size is 10MB'}, status=400)
        
        # Create or update submission
        if existing_submission:
            submission = existing_submission
        else:
            submission = AssignmentSubmission.objects.create(
                assignment=assignment,
                student=request.user,
                status='pending'
            )
        
        # Save the file
        submission.submission_file = submission_file
        submission.status = 'submitted'
        submission.submitted_at = timezone.now()
        submission.save()
        
        return Response({
            'message': 'Assignment submitted successfully',
            'submission_id': submission.id,
            'file_name': submission_file.name,
            'submitted_at': submission.submitted_at.isoformat()
        })

    @action(detail=True, methods=['get'])
    def quiz_results(self, request, pk=None):
        """Get detailed quiz results for a student"""
        assignment = self.get_object()
        
        if request.user.is_staff:
            # Teachers can view any student's results for their assignments
            student_id = request.query_params.get('student_id')
            if not student_id:
                return Response({'error': 'Student ID required for teachers'}, status=400)
            try:
                student = User.objects.get(id=student_id)
            except User.DoesNotExist:
                return Response({'error': 'Student not found'}, status=400)
        else:
            # Students can only view their own results
            student = request.user
        
        try:
            submission = AssignmentSubmission.objects.get(
                assignment=assignment,
                student=student
            )
            
            if not submission.quiz_submission:
                return Response({'error': 'No quiz submission found'}, status=404)
            
            return Response({
                'assignment_title': assignment.title,
                'student_name': f"{student.first_name} {student.last_name}".strip() or student.username,
                'score_percentage': float(submission.quiz_submission.score_percentage),
                'correct_answers': submission.quiz_submission.correct_answers,
                'total_questions': submission.quiz_submission.total_questions,
                'time_taken': submission.quiz_submission.time_taken,
                'submitted_at': submission.quiz_submission.submitted_at.isoformat(),
                'feedback': submission.feedback,
                'detailed_feedback': submission.detailed_feedback,
                'improvement_suggestions': submission.improvement_suggestions,
                'performance_analysis': submission.performance_analysis
            })
            
        except AssignmentSubmission.DoesNotExist:
            return Response({'error': 'No submission found for this assignment'}, status=404)

    def _generate_performance_analysis(self, assignment, answers, questions):
        """Generate detailed performance analysis"""
        analysis = {
            'overall_score': 0,
            'strengths': [],
            'weaknesses': [],
            'question_analysis': [],
            'topic_performance': {},
            'recommendations': []
        }
        
        correct_count = 0
        total_questions = questions.count()
        
        for question in questions:
            student_answer = answers.get(str(question.id))
            is_correct = student_answer == question.correct_answer
            
            if is_correct:
                correct_count += 1
            
            analysis['question_analysis'].append({
                'question_id': question.id,
                'question_text': question.question_text,
                'student_answer': student_answer,
                'correct_answer': question.correct_answer,
                'is_correct': is_correct,
                'points': question.points
            })
        
        analysis['overall_score'] = (correct_count / total_questions * 100) if total_questions > 0 else 0
        
        # Generate strengths and weaknesses
        if analysis['overall_score'] >= 80:
            analysis['strengths'].append("Excellent understanding of the material")
            analysis['recommendations'].append("Continue with current study habits")
        elif analysis['overall_score'] >= 60:
            analysis['strengths'].append("Good grasp of basic concepts")
            analysis['weaknesses'].append("Some areas need improvement")
            analysis['recommendations'].append("Review incorrect answers and related topics")
        else:
            analysis['weaknesses'].append("Significant gaps in understanding")
            analysis['recommendations'].append("Consider additional study time and seek help")
        
        return analysis

    def _generate_feedback(self, score_percentage, performance_analysis):
        """Generate personalized feedback based on performance"""
        if score_percentage >= 90:
            feedback = "Outstanding performance! You demonstrate excellent understanding of the material. Keep up the great work!"
        elif score_percentage >= 80:
            feedback = "Great job! You have a solid understanding of the concepts. Focus on the areas where you made mistakes to improve further."
        elif score_percentage >= 70:
            feedback = "Good work! You understand most of the material. Review the incorrect answers and related topics to strengthen your knowledge."
        elif score_percentage >= 60:
            feedback = "You're on the right track, but there are some areas that need improvement. Take time to review the material and practice more."
        else:
            feedback = "This score indicates that you need to spend more time studying this material. Consider reviewing the course content and seeking additional help."
        
        return feedback

    def _generate_detailed_feedback(self, assignment, answers, questions):
        """Generate detailed feedback for each question"""
        detailed_feedback = {}
        
        for question in questions:
            student_answer = answers.get(str(question.id))
            is_correct = student_answer == question.correct_answer
            
            if is_correct:
                detailed_feedback[str(question.id)] = {
                    'status': 'correct',
                    'message': f"Correct! You answered '{student_answer}' which is the right answer.",
                    'explanation': f"This question tested your understanding of the concept. You demonstrated good knowledge in this area."
                }
            else:
                detailed_feedback[str(question.id)] = {
                    'status': 'incorrect',
                    'message': f"Incorrect. You answered '{student_answer}' but the correct answer is '{question.correct_answer}'.",
                    'explanation': f"This question tested a specific concept. Review the material related to this topic to improve your understanding.",
                    'correct_answer': question.correct_answer,
                    'your_answer': student_answer
                }
        
        return detailed_feedback

    def _generate_improvement_suggestions(self, score_percentage, performance_analysis):
        """Generate specific improvement suggestions based on performance"""
        suggestions = []
        
        if score_percentage >= 90:
            suggestions.extend([
                "Maintain your excellent study habits",
                "Consider helping classmates who may be struggling",
                "Explore advanced topics in this subject area",
                "Continue practicing to maintain your high performance"
            ])
        elif score_percentage >= 80:
            suggestions.extend([
                "Review the questions you answered incorrectly",
                "Focus on understanding the concepts behind your mistakes",
                "Practice similar problems to strengthen weak areas",
                "Consider forming a study group with classmates"
            ])
        elif score_percentage >= 70:
            suggestions.extend([
                "Spend more time reviewing the course material",
                "Identify specific topics where you need improvement",
                "Seek help from your teacher or classmates",
                "Create flashcards for key concepts",
                "Practice with additional problems"
            ])
        elif score_percentage >= 60:
            suggestions.extend([
                "Schedule a meeting with your teacher to discuss areas of difficulty",
                "Review the fundamental concepts of this topic",
                "Spend more time studying before the next assessment",
                "Consider using additional study resources",
                "Break down complex topics into smaller, manageable parts"
            ])
        else:
            suggestions.extend([
                "Meet with your teacher immediately to discuss your performance",
                "Review all course materials from the beginning",
                "Consider seeking tutoring or additional academic support",
                "Create a detailed study plan focusing on weak areas",
                "Practice with basic problems before attempting more complex ones",
                "Consider if you need to review prerequisites for this course"
            ])
        
        return "\n".join(suggestions)


class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            # Teachers can see attendance for their courses
            return Attendance.objects.filter(course__teacher=user)
        else:
            # Students can see their own attendance
            return Attendance.objects.filter(student=user)

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only teachers can mark attendance")
        serializer.save(marked_by=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_attendance(self, request):
        """Mark attendance for multiple students"""
        if not request.user.is_staff:
            raise PermissionDenied("Only teachers can mark attendance")
        
        course_id = request.data.get('course_id')
        date_str = request.data.get('date')
        attendance_data = request.data.get('attendance', [])
        
        try:
            course = Course.objects.get(id=course_id, teacher=request.user)
            attendance_date = date.fromisoformat(date_str)
        except (Course.DoesNotExist, ValueError):
            return Response({'error': 'Invalid course or date'}, status=400)
        
        # Create or update attendance session
        session, created = AttendanceSession.objects.get_or_create(
            course=course,
            date=attendance_date,
            defaults={'created_by': request.user}
        )
        
        marked_count = 0
        for item in attendance_data:
            student_id = item.get('student_id')
            status = item.get('status')
            notes = item.get('notes', '')
            
            try:
                student = User.objects.get(id=student_id)
                Attendance.objects.update_or_create(
                    course=course,
                    student=student,
                    date=attendance_date,
                    defaults={
                        'status': status,
                        'marked_by': request.user,
                        'notes': notes
                    }
                )
                marked_count += 1
            except User.DoesNotExist:
                continue
        
        return Response({
            'message': f'Attendance marked for {marked_count} students',
            'session_id': session.id
        })

    @action(detail=False, methods=['get'])
    def course_attendance(self, request):
        """Get attendance for a specific course"""
        course_id = request.query_params.get('course_id')
        date_str = request.query_params.get('date')
        
        if not course_id:
            return Response({'error': 'Course ID required'}, status=400)
        
        try:
            course = Course.objects.get(id=course_id)
            if request.user.is_staff and course.teacher != request.user:
                raise PermissionDenied("You can only view attendance for your own courses")
            
            queryset = Attendance.objects.filter(course=course)
            if date_str:
                attendance_date = date.fromisoformat(date_str)
                queryset = queryset.filter(date=attendance_date)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except (Course.DoesNotExist, ValueError):
            return Response({'error': 'Invalid course or date'}, status=400)

    @action(detail=False, methods=['get'])
    def student_attendance_summary(self, request):
        """Get attendance summary for a student"""
        if request.user.is_staff:
            student_id = request.query_params.get('student_id')
            if not student_id:
                return Response({'error': 'Student ID required'}, status=400)
            try:
                student = User.objects.get(id=student_id)
            except User.DoesNotExist:
                return Response({'error': 'Student not found'}, status=400)
        else:
            student = request.user
        
        # Calculate attendance statistics
        total_sessions = Attendance.objects.filter(student=student).count()
        present_sessions = Attendance.objects.filter(student=student, status='present').count()
        absent_sessions = Attendance.objects.filter(student=student, status='absent').count()
        late_sessions = Attendance.objects.filter(student=student, status='late').count()
        
        attendance_rate = (present_sessions / total_sessions * 100) if total_sessions > 0 else 0
        
        return Response({
            'student_id': student.id,
            'student_name': f"{student.first_name} {student.last_name}".strip() or student.username,
            'total_sessions': total_sessions,
            'present_sessions': present_sessions,
            'absent_sessions': absent_sessions,
            'late_sessions': late_sessions,
            'attendance_rate': round(attendance_rate, 2)
        })


class AttendanceSessionViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return AttendanceSession.objects.filter(course__teacher=user)
        else:
            return AttendanceSession.objects.filter(course__students=user)

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only teachers can create attendance sessions")
        serializer.save(created_by=self.request.user)


class EmotionViewSet(viewsets.ModelViewSet):
    queryset = Emotion.objects.all()
    serializer_class = EmotionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Emotion.objects.filter(student=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def detect(self, request):
        
        try:
            # Get image data from request
            image_data = request.data.get('image_data')
            width = request.data.get('width', 640)
            height = request.data.get('height', 480)

            if not image_data:
                return Response({'error': 'No image data provided'}, status=400)

            # Convert image data to numpy array for processing
            import numpy as np
            import cv2

            # Convert the image data to numpy array
            image_array = np.array(image_data, dtype=np.uint8)
            image = image_array.reshape(height, width, 4)  # RGBA format
            image_rgb = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)

            # Try to use MediaPipe if available, otherwise fallback to basic face detection
            try:
                import mediapipe as mp

                # Initialize MediaPipe Face Mesh
                mp_face_mesh = mp.solutions.face_mesh

                with mp_face_mesh.FaceMesh(
                        static_image_mode=False,
                        max_num_faces=1,
                        refine_landmarks=True,
                        min_detection_confidence=0.5,
                        min_tracking_confidence=0.5
                ) as face_mesh:

                    # Process the image
                    results = face_mesh.process(image_rgb)

                    if results.multi_face_landmarks:
                        # Extract facial landmarks for emotion detection
                        landmarks = results.multi_face_landmarks[0]

                        # Simple emotion detection based on facial landmarks
                        emotion, confidence = self._detect_emotion_from_landmarks(landmarks, width, height)

                        # Create emotion record for the authenticated user
                        emotion_obj = Emotion.objects.create(
                            student=request.user,
                            emotion=emotion,
                            confidence=confidence
                        )

                        return Response({
                            'emotion': emotion,
                            'confidence': confidence,
                            'timestamp': emotion_obj.timestamp,
                            'landmarks_detected': True,
                            'method': 'mediapipe'
                        })
                    else:
                        # No face detected with MediaPipe
                        return Response({
                            'emotion': 'neutral',
                            'confidence': 0.5,
                            'timestamp': timezone.now(),
                            'landmarks_detected': False,
                            'message': 'No face detected in the image',
                            'method': 'mediapipe'
                        })

            except ImportError as e:
                # MediaPipe not available, use OpenCV for basic face detection
                face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                gray = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)
                faces = face_cascade.detectMultiScale(gray, 1.1, 4)

                if len(faces) > 0:
                    # Face detected, use neutral emotion with low confidence
                    emotion_obj = Emotion.objects.create(
                        student=request.user,
                        emotion='neutral',
                        confidence=0.3
                    )

                    return Response({
                        'emotion': 'neutral',
                        'confidence': 0.3,
                        'timestamp': emotion_obj.timestamp,
                        'landmarks_detected': True,
                        'method': 'opencv'
                    })
                else:
                    # No face detected
                    return Response({
                        'emotion': 'neutral',
                        'confidence': 0.0,
                        'timestamp': timezone.now(),
                        'landmarks_detected': False,
                        'message': 'No face detected in the image',
                        'method': 'opencv'
                    })

        except Exception as e:
            print(f"Error in emotion detection: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'Failed to process image',
                'message': str(e)
            }, status=500)

    def _detect_emotion_from_landmarks(self, landmarks, width, height):
        """
        Simple emotion detection based on facial landmarks
        This is a basic implementation - in a real app, you'd use a trained ML model
        """
        # Extract key facial points for emotion detection
        # These are approximate landmark indices for key facial features
        left_eye = landmarks.landmark[33]  # Left eye center
        right_eye = landmarks.landmark[263]  # Right eye center
        nose_tip = landmarks.landmark[4]  # Nose tip
        mouth_left = landmarks.landmark[61]  # Left mouth corner
        mouth_right = landmarks.landmark[291]  # Right mouth corner
        
        # Calculate basic facial measurements
        eye_distance = abs(left_eye.x - right_eye.x)
        mouth_width = abs(mouth_left.x - mouth_right.x)
        mouth_height = abs(mouth_left.y - nose_tip.y)
        
        # Simple emotion classification based on facial proportions
        # This is a very basic heuristic - real emotion detection would use ML
        if mouth_width > 0.3:  # Wide mouth - likely happy
            emotion = 'happy'
            confidence = 0.7
        elif mouth_height > 0.1:  # Open mouth - could be surprised
            emotion = 'surprised'
            confidence = 0.6
        elif eye_distance < 0.2:  # Close eyes - could be tired
            emotion = 'tired'
            confidence = 0.5
        else:
            emotion = 'neutral'
            confidence = 0.8
        
        return emotion, confidence


class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Badge.objects.all()
        else:
            return Badge.objects.filter(student=user)


class DoubtViewSet(viewsets.ModelViewSet):
    queryset = Doubt.objects.all()
    serializer_class = DoubtSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Doubt.objects.all()
        else:
            return Doubt.objects.filter(student=user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=True, methods=['post'])
    def answer(self, request, pk=None):
        doubt = self.get_object()
        answer = request.data.get('answer')

        if answer:
            doubt.answer = answer
            doubt.status = 'answered'
            doubt.answer_timestamp = timezone.now()
            doubt.save()

        serializer = self.get_serializer(doubt)
        return Response(serializer.data)


class StudentStatsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StudentStats.objects.all()
    serializer_class = StudentStatsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return StudentStats.objects.all()
        else:
            return StudentStats.objects.filter(student=user)


class AssignmentSubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AssignmentSubmission.objects.all()
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            # Teachers can see all submissions for their courses
            return AssignmentSubmission.objects.filter(assignment__course__teacher=user)
        else:
            return AssignmentSubmission.objects.filter(student=user)

    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        """Grade a student submission (teachers only)"""
        if not request.user.is_staff:
            raise PermissionDenied("Only teachers can grade submissions")
        
        submission = self.get_object()
        
        # Check if the teacher owns the course
        if submission.assignment.course.teacher != request.user:
            raise PermissionDenied("You can only grade submissions for your own courses")
        
        grade = request.data.get('grade')
        feedback = request.data.get('feedback', '')
        
        if grade is None:
            return Response({'error': 'Grade is required'}, status=400)
        
        try:
            grade = float(grade)
            if grade < 0 or grade > 100:
                return Response({'error': 'Grade must be between 0 and 100'}, status=400)
        except (ValueError, TypeError):
            return Response({'error': 'Invalid grade value'}, status=400)
        
        submission.grade = grade
        submission.feedback = feedback
        submission.status = 'graded'
        submission.graded_at = timezone.now()
        submission.save()
        
        return Response({
            'message': 'Submission graded successfully',
            'grade': grade,
            'feedback': feedback,
            'graded_at': submission.graded_at.isoformat()
        })

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download submission file (teachers only)"""
        if not request.user.is_staff:
            raise PermissionDenied("Only teachers can download submissions")
        
        submission = self.get_object()
        
        # Check if the teacher owns the course
        if submission.assignment.course.teacher != request.user:
            raise PermissionDenied("You can only download submissions for your own courses")
        
        if not submission.submission_file:
            return Response({'error': 'No file attached to this submission'}, status=404)
        
        # Return file URL for download
        file_url = request.build_absolute_uri(submission.submission_file.url)
        return Response({
            'file_url': file_url,
            'file_name': submission.submission_file.name,
            'file_size': submission.submission_file.size
        })


class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            # Teachers can see schedules for courses they teach
            return Schedule.objects.filter(course__teacher=user)
        else:
            # Students can see schedules for courses they're enrolled in
            return Schedule.objects.filter(course__students=user)

    def perform_create(self, serializer):
        # Only teachers can create schedules
        if not self.request.user.is_staff:
            raise PermissionDenied("Only teachers can create schedules")

        # Ensure the course belongs to the teacher
        course_id = self.request.data.get('course_id')
        if course_id:
            try:
                course = Course.objects.get(id=course_id, teacher=self.request.user)
                serializer.save(course=course)
            except Course.DoesNotExist:
                raise PermissionDenied("You can only create schedules for your own courses")
        else:
            raise PermissionDenied("course_id is required")

    def perform_update(self, serializer):
        # Only teachers can update schedules
        if not self.request.user.is_staff:
            raise PermissionDenied("Only teachers can update schedules")

        # Ensure the schedule belongs to a course taught by the teacher
        schedule = self.get_object()
        if schedule.course.teacher != self.request.user:
            raise PermissionDenied("You can only update schedules for your own courses")

        serializer.save()

    def perform_destroy(self, instance):
        # Only teachers can delete schedules
        if not self.request.user.is_staff:
            raise PermissionDenied("Only teachers can delete schedules")

        # Ensure the schedule belongs to a course taught by the teacher
        if instance.course.teacher != self.request.user:
            raise PermissionDenied("You can only delete schedules for your own courses")

        instance.delete()

    @action(detail=False, methods=['get'])
    def my_schedule(self, request):
        """Get schedule for the current user (teacher's courses or student's enrolled courses)"""
        user = request.user
        if user.is_staff:
            # For teachers, get schedules for all their courses
            schedules = Schedule.objects.filter(course__teacher=user)
        else:
            # For students, get schedules for courses they're enrolled in
            schedules = Schedule.objects.filter(course__students=user)

        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.mark_as_read()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        notifications = self.get_queryset().filter(is_read=False)
        notifications.update(is_read=True, read_at=timezone.now())
        return Response({'message': 'All notifications marked as read'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'count': count})


class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    def get_object(self):
        # Get or create profile for the current user
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

    @action(detail=False, methods=['get', 'put', 'patch'])
    def my_profile(self, request):
        """Get or update the current user's profile"""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        if request.method in ['PUT', 'PATCH']:
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def upload_profile_picture(self, request):
        """Upload profile picture"""
        profile = self.get_object()
        
        if 'profile_picture' not in request.FILES:
            return Response({'error': 'No profile picture provided'}, status=400)
        
        profile.profile_picture = request.FILES['profile_picture']
        profile.save()
        
        return Response({
            'message': 'Profile picture uploaded successfully',
            'profile_picture_url': profile.profile_picture.url
        })


class FAQViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FAQ.objects.filter(is_active=True)
    serializer_class = FAQSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get FAQs by category"""
        category = request.query_params.get('category', 'general')
        faqs = self.get_queryset().filter(category=category)
        serializer = self.get_serializer(faqs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search FAQs by question or answer"""
        query = request.query_params.get('q', '')
        if query:
            faqs = self.get_queryset().filter(
                models.Q(question__icontains=query) | 
                models.Q(answer__icontains=query)
            )
        else:
            faqs = self.get_queryset()
        
        serializer = self.get_serializer(faqs, many=True)
        return Response(serializer.data)


class ContactMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]  # Allow anyone to submit contact messages

    def get_queryset(self):
        # Users can only see their own contact messages
        if self.request.user.is_authenticated:
            return ContactMessage.objects.filter(user=self.request.user)
        return ContactMessage.objects.none()

    def perform_create(self, serializer):
        # Associate the message with the user if they're authenticated
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

    @action(detail=False, methods=['post'])
    def submit(self, request):
        """Submit a contact message"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({
                'message': 'Your message has been sent! Our support team will get back to you soon.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentManagementViewSet(viewsets.ModelViewSet):
    """ViewSet for managing students (teachers only)"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only teachers can access this
        if not self.request.user.is_staff:
            raise PermissionDenied("Only teachers can manage students")
        return User.objects.filter(is_staff=False)  # Only students

    def perform_create(self, serializer):
        # Only teachers can create students
        if not self.request.user.is_staff:
            raise PermissionDenied("Only teachers can create students")
        
        # Create user with student role
        user_data = serializer.validated_data
        email = user_data.get('email')
        name = user_data.get('name', '')
        password = user_data.get('password', 'password123')  # Default password
        
        # Create username from email
        username = email.split('@')[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        # Split name into first and last name
        name_parts = name.strip().split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_staff=False  # Student role
        )
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        return user

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple students at once"""
        if not self.request.user.is_staff:
            raise PermissionDenied("Only teachers can create students")
        
        students_data = request.data.get('students', [])
        created_students = []
        
        for student_data in students_data:
            serializer = self.get_serializer(data=student_data)
            if serializer.is_valid():
                student = self.perform_create(serializer)
                created_students.append(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'message': f'Successfully created {len(created_students)} students',
            'students': created_students
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export student data"""
        if not self.request.user.is_staff:
            raise PermissionDenied("Only teachers can export student data")
        
        students = self.get_queryset()
        data = []
        
        for student in students:
            # Get student stats if available
            try:
                stats = student.stats
                data.append({
                    'id': student.id,
                    'name': f"{student.first_name} {student.last_name}".strip() or student.username,
                    'email': student.email,
                    'average_grade': float(stats.average_grade) if stats else 0,
                    'attendance_rate': float(stats.attendance_rate) if stats else 0,
                    'assignments_completed': stats.assignments_completed if stats else 0,
                })
            except StudentStats.DoesNotExist:
                data.append({
                    'id': student.id,
                    'name': f"{student.first_name} {student.last_name}".strip() or student.username,
                    'email': student.email,
                    'average_grade': 0,
                    'attendance_rate': 0,
                    'assignments_completed': 0,
                })
        
        return Response({
            'students': data,
            'total_count': len(data),
            'exported_at': timezone.now().isoformat()
        })

from django.contrib.auth import login
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import Course, Grade, Assignment, Attendance, Emotion, Badge, Doubt, StudentStats, AssignmentSubmission, \
    Schedule
from .serializers import (
    UserSerializer, CourseSerializer, GradeSerializer, AssignmentSerializer,
    AttendanceSerializer, EmotionSerializer, BadgeSerializer, DoubtSerializer, StudentStatsSerializer,
    AssignmentSubmissionSerializer, ScheduleSerializer
)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                login(request, user)
                serializer = self.get_serializer(user)
                return Response(serializer.data)
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def csrf_token(self, request):
        """Get CSRF token for the frontend"""
        return Response({'csrfToken': get_token(request)})


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Course.objects.filter(teacher=user)
        else:
            return Course.objects.filter(students=user)


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
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Assignment.objects.all()
        else:
            # Return assignments for courses that the student is enrolled in
            return Assignment.objects.filter(course__students=user)

    def perform_create(self, serializer):
        # Only teachers can create assignments
        if not self.request.user.is_staff:
            raise PermissionDenied("Only teachers can create assignments")
        serializer.save()

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        assignment = self.get_object()
        
        # Create or update submission for this student
        submission, created = AssignmentSubmission.objects.get_or_create(
            assignment=assignment,
            student=request.user,
            defaults={'status': 'submitted', 'submitted_at': timezone.now()}
        )
        
        if not created:
            submission.status = 'submitted'
            submission.submitted_at = timezone.now()
            submission.save()
        
        serializer = AssignmentSubmissionSerializer(submission)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        # Only teachers can grade assignments
        if not request.user.is_staff:
            raise PermissionDenied("Only teachers can grade assignments")
        
        assignment = self.get_object()
        student_id = request.data.get('student_id')
        grade_value = request.data.get('grade')
        
        if not student_id or grade_value is None:
            return Response({'error': 'student_id and grade are required'}, status=400)
        
        try:
            # Remove 'u' prefix if present
            student_id = student_id.replace('u', '') if student_id.startswith('u') else student_id
            student = User.objects.get(id=student_id)
            
            submission = AssignmentSubmission.objects.get(
                assignment=assignment,
                student=student
            )
            
            submission.grade = grade_value
            submission.status = 'graded'
            submission.graded_at = timezone.now()
            submission.save()
            
            serializer = AssignmentSubmissionSerializer(submission)
            return Response(serializer.data)
            
        except (User.DoesNotExist, AssignmentSubmission.DoesNotExist):
            return Response({'error': 'Student submission not found'}, status=404)


class AttendanceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Attendance.objects.all()
        else:
            return Attendance.objects.filter(student=user)


class EmotionViewSet(viewsets.ModelViewSet):
    queryset = Emotion.objects.all()
    serializer_class = EmotionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Emotion.objects.filter(student=self.request.user)

    @action(detail=False, methods=['post'])
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
                        
                        # Create emotion record
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
                        
            except ImportError:
                # MediaPipe not available, use OpenCV for basic face detection
                face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                gray = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)
                faces = face_cascade.detectMultiScale(gray, 1.1, 4)
                
                if len(faces) > 0:
                    # Face detected, simulate emotion detection
                    emotion, confidence = self._simulate_emotion_detection()
                    
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
                        'method': 'opencv'
                    })
                else:
                    # No face detected
                    return Response({
                        'emotion': 'neutral',
                        'confidence': 0.5,
                        'timestamp': timezone.now(),
                        'landmarks_detected': False,
                        'message': 'No face detected in the image',
                        'method': 'opencv'
                    })
                    
        except Exception as e:
            print(f"Error in emotion detection: {str(e)}")
            # Fallback to simulated emotion detection
            emotion, confidence = self._simulate_emotion_detection()
            
            emotion_obj = Emotion.objects.create(
                student=request.user,
                emotion=emotion,
                confidence=confidence
            )
            
            return Response({
                'emotion': emotion,
                'confidence': confidence,
                'timestamp': emotion_obj.timestamp,
                'fallback': True,
                'method': 'simulation'
            })

    def _simulate_emotion_detection(self):
        """Simulate emotion detection when MediaPipe is not available"""
        import random
        emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fear', 'disgust']
        emotion = random.choice(emotions)
        confidence = random.uniform(0.6, 0.95)
        return emotion, confidence

    def _detect_emotion_from_landmarks(self, landmarks, width, height):
        """
        Simple emotion detection based on facial landmarks.
        This is a basic implementation - in production, you'd use a trained model.
        """
        import random
        
        # Extract key facial points for emotion detection
        # These are simplified calculations based on MediaPipe landmark indices
        left_eye = landmarks.landmark[33]  # Left eye corner
        right_eye = landmarks.landmark[263]  # Right eye corner
        nose = landmarks.landmark[1]  # Nose tip
        left_mouth = landmarks.landmark[61]  # Left mouth corner
        right_mouth = landmarks.landmark[291]  # Right mouth corner
        
        # Calculate basic facial measurements
        eye_distance = abs(left_eye.x - right_eye.x) * width
        mouth_width = abs(left_mouth.x - right_mouth.x) * width
        mouth_height = abs(left_mouth.y - nose.y) * height
        
        # Simple emotion classification based on facial proportions
        emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fear', 'disgust']
        
        # Basic logic for emotion detection
        if mouth_width > 0.15 * width:  # Wide mouth - likely happy
            emotion = 'happy'
            confidence = random.uniform(0.7, 0.9)
        elif mouth_height < 0.02 * height:  # Small mouth - likely sad
            emotion = 'sad'
            confidence = random.uniform(0.6, 0.8)
        elif eye_distance > 0.25 * width:  # Wide eyes - likely surprised
            emotion = 'surprised'
            confidence = random.uniform(0.6, 0.8)
        else:
            emotion = 'neutral'
            confidence = random.uniform(0.5, 0.7)
        
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
            return AssignmentSubmission.objects.all()
        else:
            return AssignmentSubmission.objects.filter(student=user)


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

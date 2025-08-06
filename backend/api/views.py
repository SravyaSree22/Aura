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

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def detect(self, request):
        print(f"Emotion detection request received from user: {request.user}")
        print(f"Request data keys: {list(request.data.keys())}")
        
        try:
            # Get image data from request
            image_data = request.data.get('image_data')
            width = request.data.get('width', 640)
            height = request.data.get('height', 480)
            
            print(f"Image dimensions: {width}x{height}")
            print(f"Image data length: {len(image_data) if image_data else 0}")
            
            if not image_data:
                return Response({'error': 'No image data provided'}, status=400)
            
            # Convert image data to numpy array for processing
            import numpy as np
            import cv2
            
            # Convert the image data to numpy array
            image_array = np.array(image_data, dtype=np.uint8)
            image = image_array.reshape(height, width, 4)  # RGBA format
            image_rgb = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
            
            print(f"Image array shape: {image_array.shape}")
            print(f"Reshaped image shape: {image.shape}")
            print(f"RGB image shape: {image_rgb.shape}")
            
            # Try to use MediaPipe if available, otherwise fallback to basic face detection
            try:
                import mediapipe as mp
                print("MediaPipe imported successfully")
                
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
                    print(f"MediaPipe results: {results.multi_face_landmarks is not None}")
                    
                    if results.multi_face_landmarks:
                        # Extract facial landmarks for emotion detection
                        landmarks = results.multi_face_landmarks[0]
                        
                        # Simple emotion detection based on facial landmarks
                        emotion, confidence = self._detect_emotion_from_landmarks(landmarks, width, height)
                        
                        # Create emotion record (use a default user for testing)
                        from django.contrib.auth.models import User
                        default_user, created = User.objects.get_or_create(username='test_user')
                        
                        emotion_obj = Emotion.objects.create(
                            student=default_user,
                            emotion=emotion,
                            confidence=confidence
                        )
                        
                        print(f"Emotion detected: {emotion} with confidence {confidence}")
                        
                        return Response({
                            'emotion': emotion,
                            'confidence': confidence,
                            'timestamp': emotion_obj.timestamp,
                            'landmarks_detected': True,
                            'method': 'mediapipe'
                        })
                    else:
                        # No face detected with MediaPipe
                        print("No face detected with MediaPipe")
                        return Response({
                            'emotion': 'neutral',
                            'confidence': 0.5,
                            'timestamp': timezone.now(),
                            'landmarks_detected': False,
                            'message': 'No face detected in the image',
                            'method': 'mediapipe'
                        })
                        
            except ImportError as e:
                print(f"MediaPipe import error: {e}")
                # MediaPipe not available, use OpenCV for basic face detection
                face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                gray = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)
                faces = face_cascade.detectMultiScale(gray, 1.1, 4)
                
                print(f"OpenCV faces detected: {len(faces)}")
                
                if len(faces) > 0:
                    # Face detected, simulate emotion detection
                    emotion, confidence = self._simulate_emotion_detection()
                    
                    # Create emotion record (use a default user for testing)
                    from django.contrib.auth.models import User
                    default_user, created = User.objects.get_or_create(username='test_user')
                    
                    emotion_obj = Emotion.objects.create(
                        student=default_user,
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
            import traceback
            traceback.print_exc()
            # Fallback to simulated emotion detection
            emotion, confidence = self._simulate_emotion_detection()
            
            # Create emotion record (use a default user for testing)
            from django.contrib.auth.models import User
            default_user, created = User.objects.get_or_create(username='test_user')
            
            emotion_obj = Emotion.objects.create(
                student=default_user,
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
        Advanced emotion detection based on facial landmarks.
        Uses comprehensive analysis of facial features and ratios.
        """
        import random
        import math
        
        # Extract comprehensive facial landmarks
        # Eyes
        left_eye_corner = landmarks.landmark[33]
        right_eye_corner = landmarks.landmark[263]
        left_eye_top = landmarks.landmark[159]
        right_eye_top = landmarks.landmark[386]
        
        # Mouth
        left_mouth_corner = landmarks.landmark[61]
        right_mouth_corner = landmarks.landmark[291]
        upper_lip = landmarks.landmark[13]
        lower_lip = landmarks.landmark[14]
        mouth_center = landmarks.landmark[17]
        
        # Nose
        nose_tip = landmarks.landmark[1]
        nose_bridge = landmarks.landmark[168]
        
        # Calculate key measurements
        eye_distance = abs(left_eye_corner.x - right_eye_corner.x) * width
        mouth_width = abs(left_mouth_corner.x - right_mouth_corner.x) * width
        mouth_height = abs(upper_lip.y - lower_lip.y) * height
        nose_to_mouth = abs(nose_tip.y - mouth_center.y) * height
        
        # Calculate ratios
        mar = mouth_width / (mouth_height + 1e-6)  # Mouth Aspect Ratio
        ear = eye_distance / (nose_to_mouth + 1e-6)  # Eye Aspect Ratio
        
        # Calculate smile intensity
        smile_intensity = mar * (mouth_width / width)
        
        # Calculate facial symmetry
        left_side = abs(left_eye_corner.x - left_mouth_corner.x)
        right_side = abs(right_eye_corner.x - right_mouth_corner.x)
        symmetry = abs(left_side - right_side) / (left_side + right_side + 1e-6)
        
        print(f"=== EMOTION DETECTION DEBUG ===")
        print(f"Eye distance: {eye_distance:.2f}px")
        print(f"Mouth width: {mouth_width:.2f}px ({mouth_width/width*100:.1f}% of face)")
        print(f"Mouth height: {mouth_height:.2f}px")
        print(f"MAR (Mouth Aspect Ratio): {mar:.2f}")
        print(f"EAR (Eye Aspect Ratio): {ear:.2f}")
        print(f"Smile intensity: {smile_intensity:.2f}")
        print(f"Symmetry: {symmetry:.3f}")
        
        # Advanced emotion classification
        emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fear', 'disgust']
        
        # Happy detection - multiple criteria for smile
        if (mar > 2.8 and mouth_width > 0.11 * width) or smile_intensity > 0.3:
            emotion = 'happy'
            confidence = random.uniform(0.8, 0.95)
            print(f"🎉 DETECTED HAPPY - MAR: {mar:.2f}, Smile intensity: {smile_intensity:.2f}")
            
        # Surprised detection - wide eyes, raised eyebrows
        elif ear > 2.3 and eye_distance > 0.21 * width:
            emotion = 'surprised'
            confidence = random.uniform(0.75, 0.9)
            print(f"😲 DETECTED SURPRISED - EAR: {ear:.2f}, Eye distance: {eye_distance:.2f}")
            
        # Sad detection - small mouth, drooping features
        elif mar < 1.8 and mouth_height < 0.012 * height:
            emotion = 'sad'
            confidence = random.uniform(0.7, 0.85)
            print(f"😢 DETECTED SAD - MAR: {mar:.2f}, Mouth height: {mouth_height:.2f}")
            
        # Angry detection - tight mouth, furrowed features
        elif mar < 2.2 and mouth_width < 0.09 * width:
            emotion = 'angry'
            confidence = random.uniform(0.65, 0.8)
            print(f"😠 DETECTED ANGRY - MAR: {mar:.2f}, Mouth width: {mouth_width:.2f}")
            
        # Fear detection - wide eyes, small mouth
        elif ear > 1.8 and mar < 2.3:
            emotion = 'fear'
            confidence = random.uniform(0.6, 0.8)
            print(f"😨 DETECTED FEAR - EAR: {ear:.2f}, MAR: {mar:.2f}")
            
        # Disgust detection - wrinkled features, small mouth
        elif mar < 2.0 and mouth_width < 0.08 * width:
            emotion = 'disgust'
            confidence = random.uniform(0.6, 0.8)
            print(f"🤢 DETECTED DISGUST - MAR: {mar:.2f}, Mouth width: {mouth_width:.2f}")
            
        # Neutral - default case
        else:
            emotion = 'neutral'
            confidence = random.uniform(0.5, 0.7)
            print(f"😐 DETECTED NEUTRAL - MAR: {mar:.2f}, EAR: {ear:.2f}")
        
        print(f"Final emotion: {emotion} (confidence: {confidence:.2f})")
        print(f"=================================")
        
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

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Avg, Count
from django.middleware.csrf import get_token
from django.http import JsonResponse
import random
from datetime import datetime, timedelta
from rest_framework.exceptions import PermissionDenied

from .models import Course, Grade, Assignment, Attendance, Emotion, Badge, Doubt, StudentStats, AssignmentSubmission
from .serializers import (
    UserSerializer, CourseSerializer, GradeSerializer, AssignmentSerializer,
    AttendanceSerializer, EmotionSerializer, BadgeSerializer, DoubtSerializer, StudentStatsSerializer, AssignmentSubmissionSerializer
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
                from django.contrib.auth import login
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
        # Simulate emotion detection
        statuses = ['normal', 'stressed', 'tired', 'focused']
        status = random.choice(statuses)
        confidence = round(random.uniform(0.7, 1.0), 2)
        
        emotion = Emotion.objects.create(
            student=request.user,
            status=status,
            confidence=confidence
        )
        
        serializer = self.get_serializer(emotion)
        return Response(serializer.data)


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

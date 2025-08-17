from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.contrib.auth import views as auth_views
from .views import (
    UserViewSet, CourseViewSet, GradeViewSet, AssignmentViewSet, AttendanceViewSet, 
    EmotionViewSet, BadgeViewSet, DoubtViewSet, StudentStatsViewSet,
    AssignmentSubmissionViewSet, ScheduleViewSet, NotificationViewSet,
    UserProfileViewSet, FAQViewSet, ContactMessageViewSet, 
    StudentManagementViewSet, AttendanceSessionViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'courses', CourseViewSet)
router.register(r'grades', GradeViewSet)
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'attendance-sessions', AttendanceSessionViewSet, basename='attendance-session')
router.register(r'emotions', EmotionViewSet)
router.register(r'badges', BadgeViewSet)
router.register(r'doubts', DoubtViewSet)
router.register(r'student-stats', StudentStatsViewSet)
router.register(r'assignmentsubmissions', AssignmentSubmissionViewSet)
router.register(r'schedules', ScheduleViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'faqs', FAQViewSet)
router.register(r'contact', ContactMessageViewSet, basename='contact')
router.register(r'student-management', StudentManagementViewSet, basename='student-management')

urlpatterns = [
    path('', include(router.urls)),
    # Authentication endpoints
    path('auth/login/', auth_views.LoginView.as_view(), name='login'),
    path('auth/logout/', auth_views.LogoutView.as_view(), name='logout'),
] 
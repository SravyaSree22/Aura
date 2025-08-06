from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, CourseViewSet, GradeViewSet, AssignmentViewSet,
    AttendanceViewSet, EmotionViewSet, BadgeViewSet, DoubtViewSet, StudentStatsViewSet, AssignmentSubmissionViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'grades', GradeViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'assignment-submissions', AssignmentSubmissionViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'emotions', EmotionViewSet)
router.register(r'badges', BadgeViewSet)
router.register(r'doubts', DoubtViewSet)
router.register(r'student-stats', StudentStatsViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 
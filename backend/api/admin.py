from django.contrib import admin
from .models import (
    Course, Grade, Assignment, Attendance, Emotion, Badge, Doubt, 
    StudentStats, AssignmentSubmission, Schedule, Notification,
    UserProfile, FAQ, ContactMessage, QuizQuestion, QuizSubmission,
    AttendanceSession
)

# Register your models here.
admin.site.register(Course)
admin.site.register(Grade)
admin.site.register(Assignment)
admin.site.register(Attendance)
admin.site.register(Emotion)
admin.site.register(Badge)
admin.site.register(Doubt)
admin.site.register(StudentStats)
admin.site.register(AssignmentSubmission)
admin.site.register(Schedule)
admin.site.register(UserProfile)
admin.site.register(FAQ)
admin.site.register(ContactMessage)
admin.site.register(QuizQuestion)
admin.site.register(QuizSubmission)
admin.site.register(AttendanceSession)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'notification_type', 'priority', 'is_read', 'created_at']
    list_filter = ['notification_type', 'priority', 'is_read', 'created_at']
    search_fields = ['user__username', 'user__email', 'title', 'message']
    readonly_fields = ['created_at', 'read_at']
    ordering = ['-created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'course', 'assignment', 'doubt')

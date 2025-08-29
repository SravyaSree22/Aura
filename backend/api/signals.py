from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg, Count
from django.utils import timezone
from datetime import timedelta
from .models import (
    StudentStats, AssignmentSubmission, Grade, Attendance, 
    Emotion, User, Course
)

def update_student_stats(student):
    """
    Update or create student statistics based on current data
    """
    try:
        # Calculate average grade from all grades
        grades = Grade.objects.filter(student=student)
        average_grade = grades.aggregate(Avg('value'))['value__avg'] or 0
        
        # Calculate attendance rate from recent attendance records
        recent_attendance = Attendance.objects.filter(
            student=student,
            date__gte=timezone.now().date() - timedelta(days=30)
        )
        total_sessions = recent_attendance.count()
        present_sessions = recent_attendance.filter(status='present').count()
        attendance_rate = (present_sessions / total_sessions) if total_sessions > 0 else 0
        
        # Count completed assignments
        completed_assignments = AssignmentSubmission.objects.filter(
            student=student,
            status__in=['submitted', 'graded']
        ).count()
        
        # Count emotional status entries
        emotions = Emotion.objects.filter(student=student)
        emotional_status_normal = emotions.filter(status='normal').count()
        emotional_status_stressed = emotions.filter(status='stressed').count()
        emotional_status_tired = emotions.filter(status='tired').count()
        emotional_status_focused = emotions.filter(status='focused').count()
        
        # Calculate trend data (last 7 grades)
        recent_grades = grades.order_by('-date')[:7]
        trend_data = [float(grade.value) for grade in recent_grades]
        
        # Create or update student stats
        stats, created = StudentStats.objects.get_or_create(
            student=student,
            defaults={
                'average_grade': average_grade,
                'attendance_rate': attendance_rate,
                'assignments_completed': completed_assignments,
                'emotional_status_normal': emotional_status_normal,
                'emotional_status_stressed': emotional_status_stressed,
                'emotional_status_tired': emotional_status_tired,
                'emotional_status_focused': emotional_status_focused,
                'trend_data': trend_data
            }
        )
        
        if not created:
            # Update existing stats
            stats.average_grade = average_grade
            stats.attendance_rate = attendance_rate
            stats.assignments_completed = completed_assignments
            stats.emotional_status_normal = emotional_status_normal
            stats.emotional_status_stressed = emotional_status_stressed
            stats.emotional_status_tired = emotional_status_tired
            stats.emotional_status_focused = emotional_status_focused
            stats.trend_data = trend_data
            stats.save()
            
    except Exception as e:
        print(f"Error updating stats for student {student.username}: {str(e)}")

@receiver(post_save, sender=AssignmentSubmission)
def update_stats_on_assignment_submission(sender, instance, created, **kwargs):
    """Update student stats when an assignment is submitted"""
    if created or instance.status in ['submitted', 'graded']:
        update_student_stats(instance.student)

@receiver(post_save, sender=Grade)
def update_stats_on_grade(sender, instance, created, **kwargs):
    """Update student stats when a grade is added or updated"""
    update_student_stats(instance.student)

@receiver(post_save, sender=Attendance)
def update_stats_on_attendance(sender, instance, created, **kwargs):
    """Update student stats when attendance is marked"""
    if created:
        update_student_stats(instance.student)

@receiver(post_save, sender=Emotion)
def update_stats_on_emotion(sender, instance, created, **kwargs):
    """Update student stats when emotion is recorded"""
    if created:
        update_student_stats(instance.student)

@receiver(post_delete, sender=AssignmentSubmission)
def update_stats_on_assignment_deletion(sender, instance, **kwargs):
    """Update student stats when an assignment submission is deleted"""
    update_student_stats(instance.student)

@receiver(post_delete, sender=Grade)
def update_stats_on_grade_deletion(sender, instance, **kwargs):
    """Update student stats when a grade is deleted"""
    update_student_stats(instance.student)

@receiver(post_delete, sender=Attendance)
def update_stats_on_attendance_deletion(sender, instance, **kwargs):
    """Update student stats when attendance is deleted"""
    update_student_stats(instance.student)

@receiver(post_delete, sender=Emotion)
def update_stats_on_emotion_deletion(sender, instance, **kwargs):
    """Update student stats when emotion is deleted"""
    update_student_stats(instance.student)

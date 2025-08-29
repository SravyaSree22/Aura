from django.utils import timezone
from .models import Notification, User, Course, Assignment, Doubt
from django.db import models

def create_notification(user, title, message, notification_type='system', priority='medium', course=None, assignment=None, doubt=None):
    """
    Create a notification for a user
    """
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        priority=priority,
        course=course,
        assignment=assignment,
        doubt=doubt,
    )

def notify_new_assignment(assignment):
    """
    Create notifications for all students in a course when a new assignment is posted
    """
    students = assignment.course.students.all()
    for student in students:
        create_notification(
            user=student,
            title=f"New Assignment: {assignment.title}",
            message=f"A new assignment '{assignment.title}' has been posted in {assignment.course.name}.",
            notification_type='assignment',
            priority='medium',
            course=assignment.course,
            assignment=assignment,
        )

def notify_assignment_graded(submission):
    """
    Create notification when an assignment is graded
    """
    create_notification(
        user=submission.student,
        title=f"Assignment Graded: {submission.assignment.title}",
        message=f"Your assignment '{submission.assignment.title}' has been graded. Check your grades page for details.",
        notification_type='grade',
        priority='high',
        course=submission.assignment.course,
        assignment=submission.assignment,
    )

def notify_assignment_submitted(submission):
    """
    Create notification for teachers when a student submits an assignment
    """
    teacher = submission.assignment.course.teacher
    student_name = f"{submission.student.first_name} {submission.student.last_name}".strip() or submission.student.username
    
    create_notification(
        user=teacher,
        title=f"Assignment Submitted: {submission.assignment.title}",
        message=f"{student_name} has submitted their assignment '{submission.assignment.title}' for {submission.assignment.course.name}.",
        notification_type='assignment',
        priority='medium',
        course=submission.assignment.course,
        assignment=submission.assignment,
    )

def notify_doubt_created(doubt):
    """
    Create notification for teachers when a student submits a doubt
    """
    teacher = doubt.course.teacher
    student_name = f"{doubt.student.first_name} {doubt.student.last_name}".strip() or doubt.student.username
    
    create_notification(
        user=teacher,
        title=f"New Doubt: {doubt.course.name}",
        message=f"{student_name} has submitted a doubt: '{doubt.question[:50]}...'",
        notification_type='doubt',
        priority='medium',
        course=doubt.course,
        doubt=doubt,
    )

def notify_doubt_answered(doubt):
    """
    Create notification when a doubt is answered
    """
    create_notification(
        user=doubt.student,
        title="Doubt Answered",
        message=f"Your doubt about '{doubt.question[:50]}...' has been answered by your teacher.",
        notification_type='doubt',
        priority='medium',
        course=doubt.course,
        doubt=doubt,
    )

def notify_attendance_reminder(course, students):
    """
    Create attendance reminder notifications
    """
    for student in students:
        create_notification(
            user=student,
            title="Attendance Reminder",
            message=f"Don't forget to mark your attendance for today's {course.name} class.",
            notification_type='attendance',
            priority='low',
            course=course,
        )

def notify_system_maintenance():
    """
    Create system maintenance notification for all users
    """
    users = User.objects.all()
    for user in users:
        create_notification(
            user=user,
            title="System Maintenance",
            message="The system will be under maintenance tonight from 2:00 AM to 4:00 AM. Please save your work.",
            notification_type='system',
            priority='medium',
        )

def notify_emotion_checkin(user):
    """
    Create emotional check-in reminder
    """
    create_notification(
        user=user,
        title="Emotional Check-in",
        message="How are you feeling today? Take a moment to check in with your emotional status.",
        notification_type='emotion',
        priority='low',
    )



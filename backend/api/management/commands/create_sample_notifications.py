from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import Notification, User, Course, Assignment
from datetime import timedelta

class Command(BaseCommand):
    help = 'Create sample notifications for testing'

    def handle(self, *args, **options):
        # Get all users
        users = User.objects.all()
        
        if not users.exists():
            self.stdout.write(self.style.WARNING('No users found. Please create users first.'))
            return
        
        # Get courses and assignments
        courses = Course.objects.all()
        assignments = Assignment.objects.all()
        
        # Sample notification data
        sample_notifications = [
            {
                'title': 'New Assignment Posted',
                'message': 'A new assignment "Introduction to Python" has been posted in your Java course.',
                'notification_type': 'assignment',
                'priority': 'medium',
            },
            {
                'title': 'Grade Updated',
                'message': 'Your grade for "Assignment 1" has been updated. Check your grades page for details.',
                'notification_type': 'grade',
                'priority': 'high',
            },
            {
                'title': 'Doubt Answered',
                'message': 'Your doubt about "Object-oriented programming concepts" has been answered by your teacher.',
                'notification_type': 'doubt',
                'priority': 'medium',
            },
            {
                'title': 'Attendance Reminder',
                'message': 'Don\'t forget to mark your attendance for today\'s Java class.',
                'notification_type': 'attendance',
                'priority': 'low',
            },
            {
                'title': 'System Maintenance',
                'message': 'The system will be under maintenance tonight from 2:00 AM to 4:00 AM.',
                'notification_type': 'system',
                'priority': 'medium',
            },
            {
                'title': 'Emotional Check-in',
                'message': 'How are you feeling today? Take a moment to check in with your emotional status.',
                'notification_type': 'emotion',
                'priority': 'low',
            },
            {
                'title': 'Course Announcement',
                'message': 'Important announcement: Next week\'s class will be held online due to campus maintenance.',
                'notification_type': 'system',
                'priority': 'high',
            },
            {
                'title': 'Assignment Due Soon',
                'message': 'Your assignment "Final Project" is due in 2 days. Please submit it on time.',
                'notification_type': 'assignment',
                'priority': 'urgent',
            },
        ]
        
        notifications_created = 0
        
        for user in users:
            # Create notifications for each user
            for i, notification_data in enumerate(sample_notifications):
                # Vary the creation time to make them appear at different times
                created_at = timezone.now() - timedelta(hours=i*2, minutes=i*15)
                
                # Randomly mark some as read
                is_read = i % 3 == 0  # Every 3rd notification is read
                read_at = created_at + timedelta(minutes=30) if is_read else None
                
                # Assign related objects randomly
                course = courses.first() if courses.exists() else None
                assignment = assignments.first() if assignments.exists() else None
                
                notification = Notification.objects.create(
                    user=user,
                    title=notification_data['title'],
                    message=notification_data['message'],
                    notification_type=notification_data['notification_type'],
                    priority=notification_data['priority'],
                    is_read=is_read,
                    created_at=created_at,
                    read_at=read_at,
                    course=course,
                    assignment=assignment,
                )
                notifications_created += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {notifications_created} sample notifications for {users.count()} users'
            )
        )

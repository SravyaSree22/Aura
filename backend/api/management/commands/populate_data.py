from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Course, Grade, Assignment, Attendance, Emotion, Badge, Doubt, StudentStats, Schedule

from django.utils import timezone
from datetime import date, timedelta
import random


class Command(BaseCommand):
    help = 'Populate the database with sample data'

    def handle(self, *args, **options):
        # Create users if they don't exist
        teacher1, created = User.objects.get_or_create(
            username='teacher1',
            defaults={
                'email': 'teacher1@example.com',
                'first_name': 'John',
                'last_name': 'Smith',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            teacher1.set_password('password123')
            teacher1.save()

        teacher2, created = User.objects.get_or_create(
            username='teacher2',
            defaults={
                'email': 'teacher2@example.com',
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'is_staff': True
            }
        )
        if created:
            teacher2.set_password('password123')
            teacher2.save()

        student1, created = User.objects.get_or_create(
            username='student1',
            defaults={
                'email': 'student1@example.com',
                'first_name': 'Alice',
                'last_name': 'Brown'
            }
        )
        if created:
            student1.set_password('password123')
            student1.save()

        student2, created = User.objects.get_or_create(
            username='student2',
            defaults={
                'email': 'student2@example.com',
                'first_name': 'Bob',
                'last_name': 'Wilson'
            }
        )
        if created:
            student2.set_password('password123')
            student2.save()

        # Create courses
        course1, created = Course.objects.get_or_create(
            code='CS101',
            defaults={
                'name': 'Introduction to Computer Science',
                'teacher': teacher1,
                'schedule': 'Mon, Wed 9:30 AM',
                'color': '#4f46e5'
            }
        )

        course2, created = Course.objects.get_or_create(
            code='MATH201',
            defaults={
                'name': 'Advanced Mathematics',
                'teacher': teacher2,
                'schedule': 'Tue, Thu 11:00 AM',
                'color': '#dc2626'
            }
        )

        course3, created = Course.objects.get_or_create(
            code='PHYS101',
            defaults={
                'name': 'Physics Fundamentals',
                'teacher': teacher1,
                'schedule': 'Mon, Wed 2:00 PM',
                'color': '#059669'
            }
        )

        course4, created = Course.objects.get_or_create(
            code='ENG101',
            defaults={
                'name': 'English Composition',
                'teacher': teacher2,
                'schedule': 'Tue, Thu 3:30 PM',
                'color': '#ea580c'
            }
        )

        # Enroll students in courses
        course1.students.add(student1, student2)
        course2.students.add(student1)
        course3.students.add(student2)
        course4.students.add(student1, student2)

        # Create schedule entries
        schedule_data = [
            # Course 1 - CS101
            {'course': course1, 'day': 'Monday', 'time': '9:30 AM', 'type': 'Lecture', 'room': 'Room 101'},
            {'course': course1, 'day': 'Wednesday', 'time': '9:30 AM', 'type': 'Lecture', 'room': 'Room 101'},
            {'course': course1, 'day': 'Friday', 'time': '2:00 PM', 'type': 'Lab', 'room': 'Computer Lab A'},
            
            # Course 2 - MATH201
            {'course': course2, 'day': 'Tuesday', 'time': '11:00 AM', 'type': 'Lecture', 'room': 'Room 202'},
            {'course': course2, 'day': 'Thursday', 'time': '11:00 AM', 'type': 'Lecture', 'room': 'Room 202'},
            {'course': course2, 'day': 'Friday', 'time': '9:30 AM', 'type': 'Tutorial', 'room': 'Room 203'},
            
            # Course 3 - PHYS101
            {'course': course3, 'day': 'Monday', 'time': '2:00 PM', 'type': 'Lecture', 'room': 'Room 301'},
            {'course': course3, 'day': 'Wednesday', 'time': '2:00 PM', 'type': 'Lecture', 'room': 'Room 301'},
            {'course': course3, 'day': 'Friday', 'time': '3:30 PM', 'type': 'Lab', 'room': 'Physics Lab'},
            
            # Course 4 - ENG101
            {'course': course4, 'day': 'Tuesday', 'time': '3:30 PM', 'type': 'Lecture', 'room': 'Room 401'},
            {'course': course4, 'day': 'Thursday', 'time': '3:30 PM', 'type': 'Lecture', 'room': 'Room 401'},
            {'course': course4, 'day': 'Wednesday', 'time': '5:00 PM', 'type': 'Seminar', 'room': 'Room 402'},
        ]

        for schedule_item in schedule_data:
            Schedule.objects.get_or_create(
                course=schedule_item['course'],
                day=schedule_item['day'],
                time=schedule_item['time'],
                defaults={
                    'type': schedule_item['type'],
                    'room': schedule_item['room']
                }
            )

        # Create grades
        grade_data = [
            {'course': course1, 'student': student1, 'title': 'Midterm Exam', 'value': 85, 'date': date.today() - timedelta(days=30)},
            {'course': course1, 'student': student2, 'title': 'Midterm Exam', 'value': 92, 'date': date.today() - timedelta(days=30)},
            {'course': course2, 'student': student1, 'title': 'Quiz 1', 'value': 78, 'date': date.today() - timedelta(days=20)},
            {'course': course3, 'student': student2, 'title': 'Lab Report', 'value': 88, 'date': date.today() - timedelta(days=15)},
        ]

        for grade_item in grade_data:
            Grade.objects.get_or_create(
                course=grade_item['course'],
                student=grade_item['student'],
                title=grade_item['title'],
                defaults={
                    'value': grade_item['value'],
                    'date': grade_item['date']
                }
            )

        # Create assignments
        assignment_data = [
            {'course': course1, 'title': 'Programming Assignment 1', 'description': 'Implement a simple calculator', 'due_date': date.today() + timedelta(days=7)},
            {'course': course2, 'title': 'Math Problem Set', 'description': 'Solve calculus problems', 'due_date': date.today() + timedelta(days=5)},
            {'course': course3, 'title': 'Physics Lab Report', 'description': 'Write report on pendulum experiment', 'due_date': date.today() + timedelta(days=10)},
            {'course': course4, 'title': 'Essay Assignment', 'description': 'Write a 1000-word essay', 'due_date': date.today() + timedelta(days=14)},
        ]

        for assignment_item in assignment_data:
            Assignment.objects.get_or_create(
                course=assignment_item['course'],
                title=assignment_item['title'],
                defaults={
                    'description': assignment_item['description'],
                    'due_date': assignment_item['due_date'],
                    'color': assignment_item['course'].color
                }
            )

        # Create attendance records
        attendance_data = [
            {'course': course1, 'student': student1, 'date': date.today() - timedelta(days=1), 'status': 'present'},
            {'course': course1, 'student': student2, 'date': date.today() - timedelta(days=1), 'status': 'present'},
            {'course': course2, 'student': student1, 'date': date.today() - timedelta(days=2), 'status': 'present'},
            {'course': course3, 'student': student2, 'date': date.today() - timedelta(days=3), 'status': 'late'},
        ]

        for attendance_item in attendance_data:
            Attendance.objects.get_or_create(
                course=attendance_item['course'],
                student=attendance_item['student'],
                date=attendance_item['date'],
                defaults={'status': attendance_item['status']}
            )

        # Create emotions
        emotion_data = [
            {'student': student1, 'status': 'focused', 'confidence': 0.85},
            {'student': student1, 'status': 'normal', 'confidence': 0.92},
            {'student': student2, 'status': 'stressed', 'confidence': 0.78},
            {'student': student2, 'status': 'tired', 'confidence': 0.65},
        ]

        for emotion_item in emotion_data:
            Emotion.objects.create(
                student=emotion_item['student'],
                status=emotion_item['status'],
                confidence=emotion_item['confidence']
            )

        # Create badges
        badge_data = [
            {'student': student1, 'title': 'Perfect Attendance', 'description': 'Attended all classes for a month', 'icon': '🎯'},
            {'student': student1, 'title': 'Top Performer', 'description': 'Achieved highest grade in class', 'icon': '🏆'},
            {'student': student2, 'title': 'Helpful Peer', 'description': 'Helped other students with assignments', 'icon': '🤝'},
        ]

        for badge_item in badge_data:
            Badge.objects.get_or_create(
                student=badge_item['student'],
                title=badge_item['title'],
                defaults={
                    'description': badge_item['description'],
                    'icon': badge_item['icon'],
                    'date_earned': date.today() - timedelta(days=random.randint(1, 30))
                }
            )

        # Create doubts
        doubt_data = [
            {'student': student1, 'course': course1, 'question': 'How do I implement recursion in Python?'},
            {'student': student2, 'course': course2, 'question': 'Can you explain the chain rule in calculus?'},
            {'student': student1, 'course': course3, 'question': 'What is the difference between velocity and acceleration?'},
        ]

        for doubt_item in doubt_data:
            Doubt.objects.get_or_create(
                student=doubt_item['student'],
                course=doubt_item['course'],
                question=doubt_item['question']
            )

        # Create student stats
        stats_data = [
            {
                'student': student1,
                'average_grade': 85.5,
                'attendance_rate': 0.95,
                'assignments_completed': 8,
                'emotional_status_normal': 15,
                'emotional_status_stressed': 3,
                'emotional_status_tired': 2,
                'emotional_status_focused': 20,
                'trend_data': [80, 82, 85, 87, 89, 85, 88]
            },
            {
                'student': student2,
                'average_grade': 78.2,
                'attendance_rate': 0.88,
                'assignments_completed': 6,
                'emotional_status_normal': 12,
                'emotional_status_stressed': 8,
                'emotional_status_tired': 5,
                'emotional_status_focused': 15,
                'trend_data': [75, 78, 80, 77, 79, 82, 78]
            }
        ]

        for stats_item in stats_data:
            StudentStats.objects.get_or_create(
                student=stats_item['student'],
                defaults={
                    'average_grade': stats_item['average_grade'],
                    'attendance_rate': stats_item['attendance_rate'],
                    'assignments_completed': stats_item['assignments_completed'],
                    'emotional_status_normal': stats_item['emotional_status_normal'],
                    'emotional_status_stressed': stats_item['emotional_status_stressed'],
                    'emotional_status_tired': stats_item['emotional_status_tired'],
                    'emotional_status_focused': stats_item['emotional_status_focused'],
                    'trend_data': stats_item['trend_data']
                }
            )

        self.stdout.write(
            self.style.SUCCESS('Successfully populated database with sample data')
        ) 
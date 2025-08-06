from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime, timedelta
import random
from decimal import Decimal

from api.models import Course, Grade, Assignment, Attendance, Emotion, Badge, Doubt, StudentStats


class Command(BaseCommand):
    help = 'Populate database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create users
        student1 = User.objects.create_user(
            username='alex',
            email='alex@example.com',
            password='password123',
            first_name='Alex',
            last_name='Johnson'
        )
        
        student2 = User.objects.create_user(
            username='maria',
            email='maria@example.com',
            password='password123',
            first_name='Maria',
            last_name='Rodriguez'
        )
        
        student3 = User.objects.create_user(
            username='james',
            email='james@example.com',
            password='password123',
            first_name='James',
            last_name='Wilson'
        )
        
        student4 = User.objects.create_user(
            username='aisha',
            email='aisha@example.com',
            password='password123',
            first_name='Aisha',
            last_name='Patel'
        )
        
        teacher1 = User.objects.create_user(
            username='sarah',
            email='sarah@example.com',
            password='password123',
            first_name='Sarah',
            last_name='Chen',
            is_staff=True
        )
        
        teacher2 = User.objects.create_user(
            username='michael',
            email='michael@example.com',
            password='password123',
            first_name='Michael',
            last_name='Rodriguez',
            is_staff=True
        )
        
        teacher3 = User.objects.create_user(
            username='emily',
            email='emily@example.com',
            password='password123',
            first_name='Emily',
            last_name='Zhang',
            is_staff=True
        )
        
        teacher4 = User.objects.create_user(
            username='james_teacher',
            email='james_teacher@example.com',
            password='password123',
            first_name='James',
            last_name='Wilson',
            is_staff=True
        )
        
        # Create courses
        course1 = Course.objects.create(
            name='Mathematics',
            code='MATH101',
            teacher=teacher1,
            schedule='Mon, Wed 10:00-11:30',
            color='#4f46e5'
        )
        
        course2 = Course.objects.create(
            name='Computer Science',
            code='CS201',
            teacher=teacher2,
            schedule='Tue, Thu 13:00-14:30',
            color='#0891b2'
        )
        
        course3 = Course.objects.create(
            name='Physics',
            code='PHYS101',
            teacher=teacher3,
            schedule='Mon, Fri 14:00-15:30',
            color='#7c3aed'
        )
        
        course4 = Course.objects.create(
            name='Literature',
            code='LIT303',
            teacher=teacher4,
            schedule='Wed, Fri 09:00-10:30',
            color='#ea580c'
        )
        
        # Associate students with courses
        students = [student1, student2, student3, student4]
        courses = [course1, course2, course3, course4]
        
        # Enroll all students in all courses
        for course in courses:
            course.students.add(*students)
        
        # Create grades for all students
        for student in students:
            for course in courses:
                Grade.objects.create(
                    course=course,
                    student=student,
                    value=random.randint(70, 95),
                    max_value=100,
                    title=f'{course.name} Assignment',
                    date=datetime(2025, 6, random.randint(10, 30)).date()
                )
        
        # Create assignments
        Assignment.objects.create(
            course=course1,
            title='Calculus Problem Set',
            description='Complete problems 1-20 from Chapter 5',
            due_date=datetime(2025, 7, 25).date(),
            status='pending',
            color='#4f46e5'
        )
        
        Assignment.objects.create(
            course=course2,
            title='Sorting Algorithm Implementation',
            description='Implement 3 different sorting algorithms and compare their performance',
            due_date=datetime(2025, 7, 20).date(),
            status='submitted',
            color='#0891b2'
        )
        
        Assignment.objects.create(
            course=course3,
            title='Mechanics Lab Report',
            description='Write a detailed report on the pendulum experiment',
            due_date=datetime(2025, 7, 28).date(),
            status='pending',
            color='#7c3aed'
        )
        
        Assignment.objects.create(
            course=course4,
            title='Comparative Analysis Essay',
            description='Compare themes in two works by different authors',
            due_date=datetime(2025, 7, 30).date(),
            status='graded',
            grade=90,
            color='#ea580c'
        )
        
        # Create attendance records for all students
        for student in students:
            for course in courses:
                Attendance.objects.create(
                    course=course,
                    student=student,
                    date=datetime(2025, 7, random.randint(10, 20)).date(),
                    status=random.choice(['present', 'absent', 'late'])
                )
        
        # Create emotions for all students
        for student in students:
            for _ in range(5):
                Emotion.objects.create(
                    student=student,
                    timestamp=datetime(2025, 7, 17, random.randint(8, 18), random.randint(0, 59)),
                    status=random.choice(['normal', 'stressed', 'tired', 'focused']),
                    confidence=round(random.uniform(0.7, 1.0), 2)
                )
        
        # Create badges for all students
        for student in students:
            Badge.objects.create(
                student=student,
                title='Perfect Attendance',
                description='Attended all classes for a month',
                icon='🌟',
                date_earned=datetime(2025, 7, 1).date()
            )
        
        # Create doubts
        Doubt.objects.create(
            student=student1,
            course=course1,
            question='Could you explain the concept of integration by parts again?',
            timestamp=datetime(2025, 7, 16, 14, 25),
            status='answered',
            answer='Integration by parts is based on the product rule for differentiation. The formula is ∫u(x)v′(x)dx = u(x)v(x) - ∫u′(x)v(x)dx. Let\'s review this in our next class.',
            answer_timestamp=datetime(2025, 7, 16, 18, 30)
        )
        
        Doubt.objects.create(
            student=student2,
            course=course2,
            question='I\'m having trouble understanding the time complexity of the quicksort algorithm. Could you provide additional resources?',
            timestamp=datetime(2025, 7, 17, 9, 15),
            status='pending'
        )
        
        # Create student stats for all students
        for i, student in enumerate(students):
            StudentStats.objects.create(
                student=student,
                average_grade=random.uniform(75.0, 92.0),
                attendance_rate=random.uniform(0.8, 0.98),
                assignments_completed=random.randint(12, 18),
                emotional_status_normal=random.randint(35, 55),
                emotional_status_stressed=random.randint(10, 30),
                emotional_status_tired=random.randint(15, 25),
                emotional_status_focused=random.randint(10, 20),
                trend_data=[random.randint(70, 95) for _ in range(7)]
            )
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created sample data!')
        ) 
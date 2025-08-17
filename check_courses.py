#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Course
from django.contrib.auth.models import User

print("=== Database Status ===")
print(f"Total courses: {Course.objects.count()}")
print(f"Total users: {User.objects.count()}")
print(f"Teachers: {User.objects.filter(is_staff=True).count()}")
print(f"Students: {User.objects.filter(is_staff=False).count()}")

print("\n=== Courses ===")
courses = Course.objects.all()
for course in courses:
    teacher_name = course.teacher.username if course.teacher else "No teacher"
    print(f"- {course.name} (Code: {course.code}) - Teacher: {teacher_name}")

print("\n=== Teachers ===")
teachers = User.objects.filter(is_staff=True)
for teacher in teachers:
    print(f"- {teacher.username} ({teacher.email})")

print("\n=== Students ===")
students = User.objects.filter(is_staff=False)
for student in students:
    print(f"- {student.username} ({student.email})")

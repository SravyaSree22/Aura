from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Course(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='teaching_courses')
    students = models.ManyToManyField(User, related_name='enrolled_courses', blank=True)
    schedule = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#4f46e5')  # Hex color code
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class Grade(models.Model):
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='grades')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='grades')
    value = models.DecimalField(max_digits=5, decimal_places=2)
    max_value = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    title = models.CharField(max_length=200)
    date = models.DateField()
    
    def __str__(self):
        return f"{self.student.username} - {self.course.name} - {self.title}"


class Assignment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('submitted', 'Submitted'),
        ('graded', 'Graded'),
    ]
    
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignments', null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    color = models.CharField(max_length=7, default='#4f46e5')
    submitted_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.course.name} - {self.title}"


class AssignmentSubmission(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('submitted', 'Submitted'),
        ('graded', 'Graded'),
    ]
    
    id = models.AutoField(primary_key=True)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignment_submissions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['assignment', 'student']
    
    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"


class Attendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    ]
    
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attendance')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    
    class Meta:
        unique_together = ['course', 'student', 'date']
    
    def __str__(self):
        return f"{self.student.username} - {self.course.name} - {self.date}"


class Emotion(models.Model):
    STATUS_CHOICES = [
        ('normal', 'Normal'),
        ('stressed', 'Stressed'),
        ('tired', 'Tired'),
        ('focused', 'Focused'),
    ]
    
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emotions')
    timestamp = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    confidence = models.DecimalField(max_digits=3, decimal_places=2)
    
    def __str__(self):
        return f"{self.student.username} - {self.status} - {self.timestamp}"


class Badge(models.Model):
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=10)  # Emoji
    date_earned = models.DateField()
    
    def __str__(self):
        return f"{self.student.username} - {self.title}"


class Doubt(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('answered', 'Answered'),
    ]
    
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='doubts')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='doubts')
    question = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    answer = models.TextField(null=True, blank=True)
    answer_timestamp = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.student.username} - {self.course.name} - {self.question[:50]}"


class StudentStats(models.Model):
    id = models.AutoField(primary_key=True)
    student = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    average_grade = models.DecimalField(max_digits=5, decimal_places=2)
    attendance_rate = models.DecimalField(max_digits=3, decimal_places=2)
    assignments_completed = models.IntegerField()
    emotional_status_normal = models.IntegerField(default=0)
    emotional_status_stressed = models.IntegerField(default=0)
    emotional_status_tired = models.IntegerField(default=0)
    emotional_status_focused = models.IntegerField(default=0)
    trend_data = models.JSONField(default=list)  # Store trend as JSON array
    
    def __str__(self):
        return f"{self.student.username} - Stats"

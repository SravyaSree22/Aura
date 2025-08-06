from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import os


def assignment_submission_file_path(instance, filename):
    """Generate file path for assignment submissions"""
    # Get the assignment and student info
    assignment = instance.assignment
    student = instance.student
    
    # Create a clean filename structure
    course_code = assignment.course.code
    assignment_title = assignment.title.replace(' ', '_').replace('/', '_')
    student_username = student.username
    
    # Get file extension
    ext = os.path.splitext(filename)[1]
    
    # Create the path: submissions/course_code/assignment_title/student_username_timestamp.ext
    new_filename = f"{student_username}_{instance.submitted_at.strftime('%Y%m%d_%H%M%S')}{ext}"
    
    return os.path.join('submissions', course_code, assignment_title, new_filename)


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


class Schedule(models.Model):
    DAY_CHOICES = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
    ]
    
    TYPE_CHOICES = [
        ('Lecture', 'Lecture'),
        ('Lab', 'Lab'),
        ('Seminar', 'Seminar'),
        ('Tutorial', 'Tutorial'),
        ('Workshop', 'Workshop'),
    ]
    
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='schedules')
    day = models.CharField(max_length=10, choices=DAY_CHOICES)
    time = models.CharField(max_length=10)  # e.g., "9:30 AM"
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Lecture')
    room = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['course', 'day', 'time']
        ordering = ['day', 'time']
    
    def __str__(self):
        return f"{self.course.name} - {self.day} {self.time} ({self.type})"


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
    submission_file = models.FileField(upload_to=assignment_submission_file_path, blank=True, null=True)
    
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
    EMOTION_CHOICES = [
        ('happy', 'Happy'),
        ('sad', 'Sad'),
        ('angry', 'Angry'),
        ('surprised', 'Surprised'),
        ('neutral', 'Neutral'),
        ('fear', 'Fear'),
        ('disgust', 'Disgust'),
    ]
    
    STATUS_CHOICES = [
        ('normal', 'Normal'),
        ('stressed', 'Stressed'),
        ('tired', 'Tired'),
        ('focused', 'Focused'),
    ]
    
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emotions')
    timestamp = models.DateTimeField(default=timezone.now)
    emotion = models.CharField(max_length=20, choices=EMOTION_CHOICES, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, null=True, blank=True)
    confidence = models.DecimalField(max_digits=3, decimal_places=2)
    
    def __str__(self):
        emotion_display = self.emotion or self.status or 'Unknown'
        return f"{self.student.username} - {emotion_display} - {self.timestamp}"


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

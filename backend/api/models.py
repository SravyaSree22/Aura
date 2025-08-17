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


class UserProfile(models.Model):
    """Extended user profile information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    avatar = models.URLField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    
    # Settings and preferences
    language = models.CharField(max_length=10, default='english')
    dark_mode = models.BooleanField(default=False)
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    two_factor_auth = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - Profile"


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
    TYPE_CHOICES = [
        ('regular', 'Regular Assignment'),
        ('quiz', 'Quiz'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('submitted', 'Submitted'),
        ('graded', 'Graded'),
    ]
    
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=200)
    description = models.TextField()
    assignment_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='regular')
    due_date = models.DateField()
    max_grade = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)
    color = models.CharField(max_length=7, default='#4f46e5')
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = timezone.now()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.course.name} - {self.title}"


class QuizQuestion(models.Model):
    id = models.AutoField(primary_key=True)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    option_a = models.CharField(max_length=500)
    option_b = models.CharField(max_length=500)
    option_c = models.CharField(max_length=500)
    option_d = models.CharField(max_length=500)
    correct_answer = models.CharField(max_length=1, choices=[
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
        ('D', 'D'),
    ])
    points = models.IntegerField(default=1)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.assignment.title} - Q{self.order + 1}"


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
    feedback = models.TextField(blank=True, null=True)
    performance_analysis = models.JSONField(default=dict, blank=True)
    detailed_feedback = models.JSONField(default=dict, blank=True)  # Store detailed feedback for each question
    improvement_suggestions = models.TextField(blank=True, null=True)  # Suggestions for improvement
    
    class Meta:
        unique_together = ['assignment', 'student']
    
    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"


class QuizSubmission(models.Model):
    id = models.AutoField(primary_key=True)
    assignment_submission = models.OneToOneField(AssignmentSubmission, on_delete=models.CASCADE, related_name='quiz_submission')
    answers = models.JSONField(default=dict)  # {question_id: selected_answer}
    correct_answers = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    score_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    time_taken = models.IntegerField(default=0)  # in seconds
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.assignment_submission.student.username} - {self.assignment_submission.assignment.title}"


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
    marked_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_marked', null=True, blank=True)
    marked_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    
    def save(self, *args, **kwargs):
        if not self.marked_at:
            self.marked_at = timezone.now()
        super().save(*args, **kwargs)
    
    class Meta:
        unique_together = ['course', 'student', 'date']
    
    def __str__(self):
        return f"{self.student.username} - {self.course.name} - {self.date}"


class AttendanceSession(models.Model):
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attendance_sessions')
    date = models.DateField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_sessions_created')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ['course', 'date']
    
    def __str__(self):
        return f"{self.course.name} - {self.date}"


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


class Notification(models.Model):
    TYPE_CHOICES = [
        ('assignment', 'Assignment'),
        ('grade', 'Grade'),
        ('doubt', 'Doubt'),
        ('attendance', 'Attendance'),
        ('system', 'System'),
        ('emotion', 'Emotion'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Optional related objects
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    doubt = models.ForeignKey(Doubt, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class FAQ(models.Model):
    """Frequently Asked Questions"""
    id = models.AutoField(primary_key=True)
    question = models.CharField(max_length=500)
    answer = models.TextField()
    category = models.CharField(max_length=50, default='general')
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.question[:50]}..."


class ContactMessage(models.Model):
    """Contact form submissions"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='contact_messages')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.subject} - {self.status}"


# Signals to automatically create UserProfile when User is created
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create UserProfile when a new User is created"""
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save UserProfile when User is saved"""
    try:
        instance.profile.save()
    except UserProfile.DoesNotExist:
        UserProfile.objects.create(user=instance)

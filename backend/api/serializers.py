from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Course, Grade, Assignment, Attendance, Emotion, Badge, Doubt, StudentStats, AssignmentSubmission, \
    Schedule, Notification, UserProfile, FAQ, ContactMessage, QuizQuestion, QuizSubmission, AttendanceSession


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone', 'bio', 'avatar', 'profile_picture', 'language', 'dark_mode', 'email_notifications', 'push_notifications', 'two_factor_auth']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'profile']
    
    def to_representation(self, instance):
        profile = getattr(instance, 'profile', None)
        return {
            'id': str(instance.id),
            'name': f"{instance.first_name} {instance.last_name}".strip() or instance.username,
            'email': instance.email,
            'role': 'teacher' if instance.is_staff else 'student',
            'avatar': profile.avatar if profile and profile.avatar else None,
            'profile_picture': profile.profile_picture.url if profile and profile.profile_picture else None,
            'phone': profile.phone if profile else None,
            'bio': profile.bio if profile else None,
        }


class CourseSerializer(serializers.ModelSerializer):
    teacher = UserSerializer(read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'teacher', 'schedule', 'color']
    
    def to_representation(self, instance):
        return {
            'id': f"c{instance.id}",
            'name': instance.name,
            'code': instance.code,
            'teacher': f"{instance.teacher.first_name} {instance.teacher.last_name}".strip() or instance.teacher.username,
            'schedule': instance.schedule,
            'color': instance.color,
        }


class GradeSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = Grade
        fields = ['id', 'course', 'value', 'max_value', 'title', 'date']
    
    def to_representation(self, instance):
        return {
            'id': f"g{instance.id}",
            'courseId': f"c{instance.course.id}",
            'courseName': instance.course.name,
            'value': float(instance.value),
            'maxValue': float(instance.max_value),
            'title': instance.title,
            'date': instance.date.strftime('%Y-%m-%d'),
        }


class AssignmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    questions = serializers.SerializerMethodField()
    submission_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = ['id', 'course', 'title', 'description', 'assignment_type', 'due_date', 'max_grade', 'color', 'created_at', 'questions', 'submission_count']
    
    def to_representation(self, instance):
        # Get current user's submission status
        user_submission = None
        if hasattr(self.context['request'], 'user') and self.context['request'].user.is_authenticated:
            user_submission = instance.submissions.filter(student=self.context['request'].user).first()
        
        return {
            'id': f"a{instance.id}",
            'courseId': f"c{instance.course.id}",
            'courseName': instance.course.name,
            'title': instance.title,
            'description': instance.description,
            'assignment_type': instance.assignment_type,
            'dueDate': instance.due_date.strftime('%Y-%m-%d'),
            'maxGrade': float(instance.max_grade),
            'color': instance.color,
            'createdAt': instance.created_at.isoformat(),
            'questions': self.get_questions(instance),
            'submission_count': self.get_submission_count(instance),
            'user_submission_status': user_submission.status if user_submission else None,
            'user_submission_grade': float(user_submission.grade) if user_submission and user_submission.grade else None,
            'user_submitted_at': user_submission.submitted_at.isoformat() if user_submission and user_submission.submitted_at else None,
        }
    
    def get_questions(self, obj):
        if obj.assignment_type == 'quiz':
            return QuizQuestionSerializer(obj.questions.all(), many=True).data
        return []
    
    def get_submission_count(self, obj):
        return obj.submissions.count()


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'points', 'order']
    
    def to_representation(self, instance):
        # Don't include correct_answer in student view
        return {
            'id': instance.id,
            'question_text': instance.question_text,
            'option_a': instance.option_a,
            'option_b': instance.option_b,
            'option_c': instance.option_c,
            'option_d': instance.option_d,
            'points': instance.points,
            'order': instance.order,
        }


class QuizQuestionTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'points', 'order']


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    assignment = AssignmentSerializer(read_only=True)
    quiz_submission = serializers.SerializerMethodField()
    
    class Meta:
        model = AssignmentSubmission
        fields = ['id', 'assignment', 'status', 'grade', 'submitted_at', 'graded_at', 'feedback', 'performance_analysis', 'quiz_submission', 'submission_file']
    
    def to_representation(self, instance):
        return {
            'id': f"sub{instance.id}",
            'assignmentId': f"a{instance.assignment.id}",
            'assignmentTitle': instance.assignment.title,
            'studentId': str(instance.student.id),
            'studentName': f"{instance.student.first_name} {instance.student.last_name}".strip() or instance.student.username,
            'studentEmail': instance.student.email,
            'status': instance.status,
            'grade': float(instance.grade) if instance.grade else None,
            'submittedAt': instance.submitted_at.isoformat() if instance.submitted_at else None,
            'gradedAt': instance.graded_at.isoformat() if instance.graded_at else None,
            'feedback': instance.feedback,
            'performance_analysis': instance.performance_analysis,
            'submission_file': instance.submission_file.name if instance.submission_file else None,
            'quiz_submission': self.get_quiz_submission(instance),
        }
    
    def get_quiz_submission(self, obj):
        if hasattr(obj, 'quiz_submission'):
            return QuizSubmissionSerializer(obj.quiz_submission).data
        return None


class QuizSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizSubmission
        fields = ['id', 'answers', 'correct_answers', 'total_questions', 'score_percentage', 'time_taken', 'submitted_at']


class AttendanceSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    student = UserSerializer(read_only=True)
    marked_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'course', 'student', 'date', 'status', 'marked_by', 'marked_at', 'notes']
    
    def to_representation(self, instance):
        return {
            'id': f"att{instance.id}",
            'courseId': f"c{instance.course.id}",
            'courseName': instance.course.name,
            'studentId': str(instance.student.id),
            'studentName': f"{instance.student.first_name} {instance.student.last_name}".strip() or instance.student.username,
            'date': instance.date.strftime('%Y-%m-%d'),
            'status': instance.status,
            'markedBy': instance.marked_by.username if instance.marked_by else None,
            'markedAt': instance.marked_at.isoformat(),
            'notes': instance.notes,
        }


class AttendanceSessionSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    attendance_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AttendanceSession
        fields = ['id', 'course', 'date', 'created_by', 'created_at', 'is_active', 'notes', 'attendance_count']
    
    def get_attendance_count(self, obj):
        return Attendance.objects.filter(course=obj.course, date=obj.date).count()


class EmotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Emotion
        fields = ['timestamp', 'status', 'confidence']
    
    def to_representation(self, instance):
        return {
            'timestamp': instance.timestamp.strftime('%Y-%m-%dT%H:%M:%S'),
            'status': instance.status,
            'confidence': float(instance.confidence),
        }


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'title', 'description', 'icon', 'date_earned']
    
    def to_representation(self, instance):
        return {
            'id': f"b{instance.id}",
            'title': instance.title,
            'description': instance.description,
            'icon': instance.icon,
            'dateEarned': instance.date_earned.strftime('%Y-%m-%d'),
        }


class DoubtSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Doubt
        fields = ['id', 'course', 'course_id', 'question', 'timestamp', 'status', 'answer', 'answer_timestamp']
    
    def create(self, validated_data):
        course_id = validated_data.pop('course_id', None)
        if course_id:
            validated_data['course_id'] = course_id
        return super().create(validated_data)
    
    def to_representation(self, instance):
        return {
            'id': f"d{instance.id}",
            'studentId': str(instance.student.id),
            'courseId': f"c{instance.course.id}",
            'courseName': instance.course.name,
            'question': instance.question,
            'timestamp': instance.timestamp.strftime('%Y-%m-%dT%H:%M:%S'),
            'status': instance.status,
            'answer': instance.answer,
            'answerTimestamp': instance.answer_timestamp.strftime('%Y-%m-%dT%H:%M:%S') if instance.answer_timestamp else None,
        }


class StudentStatsSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    
    class Meta:
        model = StudentStats
        fields = ['id', 'student', 'average_grade', 'attendance_rate', 'assignments_completed', 'emotional_status_normal', 'emotional_status_stressed', 'emotional_status_tired', 'emotional_status_focused', 'trend_data']
    
    def to_representation(self, instance):
        return {
            'id': f"s{instance.id}",
            'name': f"{instance.student.first_name} {instance.student.last_name}".strip() or instance.student.username,
            'averageGrade': float(instance.average_grade),
            'attendanceRate': float(instance.attendance_rate),
            'assignmentsCompleted': instance.assignments_completed,
            'emotionalStatus': {
                'normal': instance.emotional_status_normal,
                'stressed': instance.emotional_status_stressed,
                'tired': instance.emotional_status_tired,
                'focused': instance.emotional_status_focused,
            },
            'trend': instance.trend_data,
        } 


class ScheduleSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Schedule
        fields = ['id', 'course', 'course_id', 'day', 'time', 'type', 'room', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        course_id = validated_data.pop('course_id', None)
        if course_id:
            validated_data['course_id'] = course_id
        return super().create(validated_data)
    
    def to_representation(self, instance):
        return {
            'id': f"s{instance.id}",
            'courseId': f"c{instance.course.id}",
            'courseName': instance.course.name,
            'courseCode': instance.course.code,
            'teacher': f"{instance.course.teacher.first_name} {instance.course.teacher.last_name}".strip() or instance.course.teacher.username,
            'day': instance.day,
            'time': instance.time,
            'type': instance.type,
            'room': instance.room,
            'color': instance.course.color,
            'createdAt': instance.created_at.strftime('%Y-%m-%dT%H:%M:%S'),
            'updatedAt': instance.updated_at.strftime('%Y-%m-%dT%H:%M:%S'),
        }


class NotificationSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    assignment = AssignmentSerializer(read_only=True)
    doubt = DoubtSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'priority', 'is_read', 'created_at', 'read_at', 'course', 'assignment', 'doubt']
    
    def to_representation(self, instance):
        return {
            'id': f"n{instance.id}",
            'title': instance.title,
            'message': instance.message,
            'type': instance.notification_type,
            'priority': instance.priority,
            'isRead': instance.is_read,
            'createdAt': instance.created_at.strftime('%Y-%m-%dT%H:%M:%S'),
            'readAt': instance.read_at.strftime('%Y-%m-%dT%H:%M:%S') if instance.read_at else None,
            'course': instance.course.name if instance.course else None,
            'courseId': f"c{instance.course.id}" if instance.course else None,
            'assignment': instance.assignment.title if instance.assignment else None,
            'assignmentId': f"a{instance.assignment.id}" if instance.assignment else None,
            'doubt': instance.doubt.question[:50] + "..." if instance.doubt else None,
            'doubtId': f"d{instance.doubt.id}" if instance.doubt else None,
        } 


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'category', 'order', 'is_active']


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at'] 
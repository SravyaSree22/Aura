from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Course, Grade, Assignment, Attendance, Emotion, Badge, Doubt, StudentStats, AssignmentSubmission, Schedule


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
    
    def to_representation(self, instance):
        return {
            'id': str(instance.id),
            'name': f"{instance.first_name} {instance.last_name}".strip() or instance.username,
            'email': instance.email,
            'role': 'teacher' if instance.is_staff else 'student',
            'avatar': f"https://randomuser.me/api/portraits/{'men' if instance.id % 2 == 0 else 'women'}/{instance.id % 70}.jpg"
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
    course_id = serializers.IntegerField(write_only=True, required=False)
    student = UserSerializer(read_only=True)
    submissions = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = ['id', 'course', 'course_id', 'student', 'title', 'description', 'due_date', 'status', 'grade', 'color', 'submitted_at', 'submissions']
    
    def get_submissions(self, obj):
        submissions = obj.submissions.all()
        return AssignmentSubmissionSerializer(submissions, many=True).data
    
    def create(self, validated_data):
        course_id = validated_data.pop('course_id', None)
        if course_id:
            validated_data['course_id'] = course_id
        return super().create(validated_data)
    
    def to_representation(self, instance):
        return {
            'id': f"a{instance.id}",
            'courseId': f"c{instance.course.id}",
            'courseName': instance.course.name,
            'title': instance.title,
            'description': instance.description,
            'dueDate': instance.due_date.strftime('%Y-%m-%d'),
            'status': instance.status,
            'grade': float(instance.grade) if instance.grade else None,
            'color': instance.color,
            'submittedAt': instance.submitted_at.strftime('%Y-%m-%dT%H:%M:%S') if instance.submitted_at else None,
            'submissions': self.get_submissions(instance),
        }


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    assignment = AssignmentSerializer(read_only=True)
    
    class Meta:
        model = AssignmentSubmission
        fields = ['id', 'assignment', 'student', 'status', 'grade', 'submitted_at', 'graded_at']
    
    def to_representation(self, instance):
        return {
            'id': f"sub{instance.id}",
            'assignmentId': f"a{instance.assignment.id}",
            'studentId': f"u{instance.student.id}",
            'studentName': f"{instance.student.first_name} {instance.student.last_name}",
            'studentEmail': instance.student.email,
            'status': instance.status,
            'grade': float(instance.grade) if instance.grade else None,
            'submittedAt': instance.submitted_at.strftime('%Y-%m-%dT%H:%M:%S') if instance.submitted_at else None,
            'gradedAt': instance.graded_at.strftime('%Y-%m-%dT%H:%M:%S') if instance.graded_at else None,
        }


class AttendanceSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'course', 'date', 'status']
    
    def to_representation(self, instance):
        return {
            'id': f"att{instance.id}",
            'courseId': f"c{instance.course.id}",
            'courseName': instance.course.name,
            'date': instance.date.strftime('%Y-%m-%d'),
            'status': instance.status,
        }


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
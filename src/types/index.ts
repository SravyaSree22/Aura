export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatar?: string;
  profile_picture?: string;
  phone?: string;
  bio?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  teacher: string;
  schedule: string;
  color: string;
}

export interface Schedule {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  teacher: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  time: string;
  type: 'Lecture' | 'Lab' | 'Seminar' | 'Tutorial' | 'Workshop';
  room?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  id: string;
  courseId: string;
  courseName: string;
  value: number;
  maxValue: number;
  title: string;
  date: string;
  feedback?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  assignment_type: 'regular' | 'quiz';
  dueDate: string;
  maxGrade: number;
  color: string;
  createdAt: string;
  questions?: QuizQuestion[];
  submission_count: number;
  user_submission_status?: 'pending' | 'submitted' | 'graded' | null;
  user_submission_grade?: number | null;
  user_submitted_at?: string | null;
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  points: number;
  order: number;
  correct_answer?: string; // Only available for teachers
}

export interface QuizSubmission {
  id: number;
  answers: Record<string, string>;
  correct_answers: number;
  total_questions: number;
  score_percentage: number;
  time_taken: number;
  submitted_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  submittedAt?: string;
  gradedAt?: string;
  feedback?: string;
  detailed_feedback?: Record<string, any>;
  improvement_suggestions?: string;
  performance_analysis?: any;
  submission_file?: string;
  quiz_submission?: QuizSubmission;
}

export interface Attendance {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  markedBy?: string;
  markedAt: string;
  notes?: string;
}

export interface AttendanceSession {
  id: number;
  course: Course;
  date: string;
  created_by: User;
  created_at: string;
  is_active: boolean;
  notes?: string;
  attendance_count: number;
}

export interface Emotion {
  id?: number;
  timestamp: string;
  emotion?: string;
  status?: 'normal' | 'stressed' | 'tired' | 'focused';
  confidence: number;
  student?: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  dateEarned: string;
}

export interface Doubt {
  id: string;
  studentId: string;
  courseId: string;
  courseName: string;
  question: string;
  timestamp: string;
  status: 'pending' | 'answered';
  answer?: string;
  answerTimestamp?: string;
}

export interface StudentStats {
  id: string;
  name: string;
  averageGrade: number;
  attendanceRate: number;
  assignmentsCompleted: number;
  emotionalStatus: {
    normal: number;
    stressed: number;
    tired: number;
    focused: number;
  };
  trend: number[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'assignment' | 'grade' | 'doubt' | 'attendance' | 'system' | 'emotion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  course?: string;
  courseId?: string;
  assignment?: string;
  assignmentId?: string;
  doubt?: string;
  doubtId?: string;
}

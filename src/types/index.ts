export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatar: string;
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
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  submittedAt?: string;
  gradedAt?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  color: string;
  submittedAt?: string;
  submissions?: AssignmentSubmission[];
}

export interface Attendance {
  id: string;
  courseId: string;
  courseName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface Emotion {
  timestamp: string;
  status: 'normal' | 'stressed' | 'tired' | 'focused';
  confidence: number;
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

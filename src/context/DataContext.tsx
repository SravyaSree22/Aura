import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { 
  Course, 
  Grade, 
  Assignment, 
  Attendance, 
  Badge, 
  Doubt,
  StudentStats
} from '../types';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  courses: Course[];
  grades: Grade[];
  assignments: Assignment[];
  attendance: Attendance[];
  badges: Badge[];
  doubts: Doubt[];
  studentStats: StudentStats[];
  submitDoubt: (courseId: string, question: string) => Promise<void>;
  submitAssignment: (assignmentId: string) => Promise<void>;
  createAssignment: (courseId: string, title: string, description: string, dueDate: string, maxGrade?: number) => Promise<void>;
  gradeAssignment: (assignmentId: string, grade: number) => Promise<void>;
  gradeStudentSubmission: (assignmentId: string, studentId: string, grade: number) => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType>({
  courses: [],
  grades: [],
  assignments: [],
  attendance: [],
  badges: [],
  doubts: [],
  studentStats: [],
  submitDoubt: async () => {},
  submitAssignment: async () => {},
  createAssignment: async () => {},
  gradeAssignment: async () => {},
  gradeStudentSubmission: async () => {},
  loading: false,
});

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Don't fetch data while auth is still loading
      if (authLoading) {
        return;
      }
      
      // Only fetch data if user is authenticated
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const [
          coursesResponse,
          gradesResponse,
          assignmentsResponse,
          attendanceResponse,
          badgesResponse,
          doubtsResponse,
          studentStatsResponse
        ] = await Promise.all([
          apiService.getCourses(),
          apiService.getGrades(),
          apiService.getAssignments(),
          apiService.getAttendance(),
          apiService.getBadges(),
          apiService.getDoubts(),
          apiService.getStudentStats()
        ]);

        if (coursesResponse.data) setCourses(coursesResponse.data as Course[]);
        if (gradesResponse.data) setGrades(gradesResponse.data as Grade[]);
        if (assignmentsResponse.data) setAssignments(assignmentsResponse.data as Assignment[]);
        if (attendanceResponse.data) setAttendance(attendanceResponse.data as Attendance[]);
        if (badgesResponse.data) setBadges(badgesResponse.data as Badge[]);
        if (doubtsResponse.data) setDoubts(doubtsResponse.data as Doubt[]);
        if (studentStatsResponse.data) setStudentStats(studentStatsResponse.data as StudentStats[]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, authLoading]); // Re-fetch when user or auth loading state changes

  const submitDoubt = async (courseId: string, question: string) => {
    try {
      const response = await apiService.submitDoubt(courseId, question);
      if (response.data) {
        setDoubts(prev => [response.data as Doubt, ...prev]);
      }
    } catch (error) {
      console.error('Error submitting doubt:', error);
      throw error;
    }
  };

  const submitAssignment = async (assignmentId: string) => {
    try {
      const response = await apiService.submitAssignment(assignmentId);
      if (response.data) {
        setAssignments(prev => 
          prev.map(assignment => 
            assignment.id === assignmentId 
              ? { ...assignment, status: 'submitted' as const }
              : assignment
          )
        );
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw error;
    }
  };

  const createAssignment = async (courseId: string, title: string, description: string, dueDate: string, maxGrade?: number) => {
    try {
      const response = await apiService.createAssignment(courseId, title, description, dueDate, maxGrade);
      if (response.data) {
        setAssignments(prev => [response.data as Assignment, ...prev]);
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  };

  const gradeAssignment = async (assignmentId: string, grade: number) => {
    try {
      const response = await apiService.gradeAssignment(assignmentId, grade);
      if (response.data) {
        setAssignments(prev => 
          prev.map(assignment => 
            assignment.id === assignmentId 
              ? { ...assignment, grade: grade }
              : assignment
          )
        );
      }
    } catch (error) {
      console.error('Error grading assignment:', error);
      throw error;
    }
  };

  const gradeStudentSubmission = async (assignmentId: string, studentId: string, grade: number) => {
    try {
      const response = await apiService.gradeStudentSubmission(assignmentId, studentId, grade);
      if (response.data) {
        setAssignments(prev => 
          prev.map(assignment => 
            assignment.id === assignmentId 
              ? { ...assignment, submissions: assignment.submissions?.map(sub => 
                  sub.studentId === studentId ? { ...sub, grade: grade } : sub
                ) || [] }
              : assignment
          )
        );
      }
    } catch (error) {
      console.error('Error grading student submission:', error);
      throw error;
    }
  };

  const value = {
    courses,
    grades,
    assignments,
    attendance,
    badges,
    doubts,
    studentStats,
    submitDoubt,
    submitAssignment,
    createAssignment,
    gradeAssignment,
    gradeStudentSubmission,
    loading,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

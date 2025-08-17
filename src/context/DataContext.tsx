import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { 
  Course, 
  Grade, 
  Assignment, 
  Attendance, 
  Badge, 
  Doubt,
  StudentStats,
  Schedule
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
  schedules: Schedule[];
  submitDoubt: (courseId: string, question: string) => Promise<void>;
  submitAssignment: (assignmentId: string, file?: File) => Promise<void>;
  createAssignment: (courseId: string, title: string, description: string, dueDate: string, maxGrade?: number) => Promise<void>;
  createCourse: (name: string, code: string, description?: string) => Promise<void>;
  gradeAssignment: (assignmentId: string, grade: number) => Promise<void>;
  gradeStudentSubmission: (assignmentId: string, studentId: string, grade: number) => Promise<void>;
  createSchedule: (courseId: string, day: string, time: string, type: string, room?: string) => Promise<void>;
  updateSchedule: (scheduleId: string, day: string, time: string, type: string, room?: string) => Promise<void>;
  deleteSchedule: (scheduleId: string) => Promise<void>;
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
  schedules: [],
  submitDoubt: async () => {},
  submitAssignment: async () => {},
  createAssignment: async () => {},
  createCourse: async () => {},
  gradeAssignment: async () => {},
  gradeStudentSubmission: async () => {},
  createSchedule: async () => {},
  updateSchedule: async () => {},
  deleteSchedule: async () => {},
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
  const [schedules, setSchedules] = useState<Schedule[]>([]);
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
          studentStatsResponse,
          schedulesResponse
        ] = await Promise.all([
          apiService.getCourses(),
          apiService.getGrades(),
          apiService.getAssignments(),
          apiService.getAttendance(),
          apiService.getBadges(),
          apiService.getDoubts(),
          apiService.getStudentStats(),
          apiService.getSchedules()
        ]);

        if (coursesResponse.data) {
          console.log('Courses data received:', coursesResponse.data);
          setCourses(coursesResponse.data as Course[]);
        }
        if (gradesResponse.data) setGrades(gradesResponse.data as Grade[]);
        if (assignmentsResponse.data) setAssignments(assignmentsResponse.data as Assignment[]);
        if (attendanceResponse.data) setAttendance(attendanceResponse.data as Attendance[]);
        if (badgesResponse.data) setBadges(badgesResponse.data as Badge[]);
        if (doubtsResponse.data) setDoubts(doubtsResponse.data as Doubt[]);
        if (studentStatsResponse.data) setStudentStats(studentStatsResponse.data as StudentStats[]);
        if (schedulesResponse.data) setSchedules(schedulesResponse.data as Schedule[]);
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

  const submitAssignment = async (assignmentId: string, file?: File): Promise<void> => {
    try {
      const response = await apiService.submitAssignment(assignmentId, file);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update the assignment in the local state
      setAssignments(prev => 
        prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, status: 'submitted' }
            : assignment
        )
      );
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw error;
    }
  };

  const createAssignment = async (assignmentData: any): Promise<void> => {
    try {
      const response = await apiService.createAssignment(assignmentData);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refresh assignments to get the new one
      await fetchAssignments();
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await apiService.getAssignments();
      if (response.data) {
        setAssignments(response.data as Assignment[]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
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
        // Update the assignment grade
        setAssignments(prev => 
          prev.map(assignment => 
            assignment.id === assignmentId 
              ? { ...assignment, grade: grade }
              : assignment
          )
        );
      }
    } catch (error) {
      console.error('Error grading student submission:', error);
      throw error;
    }
  };

  const createSchedule = async (courseId: string, day: string, time: string, type: string, room?: string) => {
    try {
      const response = await apiService.createSchedule(courseId, day, time, type, room);
      if (response.data) {
        setSchedules(prev => [response.data as Schedule, ...prev]);
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  };

  const updateSchedule = async (scheduleId: string, day: string, time: string, type: string, room?: string) => {
    try {
      const response = await apiService.updateSchedule(scheduleId, day, time, type, room);
      if (response.data) {
        setSchedules(prev => 
          prev.map(schedule => 
            schedule.id === scheduleId 
              ? response.data as Schedule
              : schedule
          )
        );
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    try {
      await apiService.deleteSchedule(scheduleId);
      setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  };

  const createCourse = async (name: string, code: string, description?: string) => {
    try {
      const response = await apiService.createCourse({ name, code, description });
      if (response.data) {
        setCourses(prev => [response.data as Course, ...prev]);
      }
    } catch (error) {
      console.error('Error creating course:', error);
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
    schedules,
    submitDoubt,
    submitAssignment,
    createAssignment,
    createCourse,
    gradeAssignment,
    gradeStudentSubmission,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    loading,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

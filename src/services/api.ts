// API service for making HTTP requests to the backend
const API_BASE_URL = 'http://localhost:8000/api';

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

interface AssignmentData {
  title: string;
  description: string;
  due_date: string;
  max_grade?: number;
}

interface UserProfileData {
  phone?: string;
  bio?: string;
  language?: string;
  dark_mode?: boolean;
  email_notifications?: boolean;
  push_notifications?: boolean;
  two_factor_auth?: boolean;
}

interface ContactMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface StudentData {
  name: string;
  email: string;
  password?: string;
}

class ApiService {
  private async getCsrfToken(): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/csrf_token/`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.csrfToken || null;
      }
    } catch (error) {
      console.error('Error getting CSRF token:', error);
    }
    
    // Fallback to cookie method
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  private async request<T>(endpoint: string, options: { method?: string; headers?: Record<string, string>; body?: string | FormData; credentials?: 'include' | 'omit' | 'same-origin' } = {}): Promise<ApiResponse<T>> {
    try {
      // Get fresh CSRF token for POST requests (to handle session changes)
      const csrfToken = await this.getCsrfToken();
      const headers: Record<string, string> = {
        ...options.headers as Record<string, string>,
      };

      // Only set Content-Type for JSON requests, not for FormData
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      // Add CSRF token to headers for POST requests
      if (options.method === 'POST' && csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        credentials: 'include',
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { data: null as any, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/users/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(email: string, password: string, name: string, role: 'student' | 'teacher' = 'student') {
    return this.request('/users/signup/', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  }

  // Course endpoints
  async getCourses() {
    return this.request('/courses/');
  }

  async createCourse(data: { name: string; code: string; description?: string }) {
    // Remove description field and add required fields with defaults
    const courseData = {
      name: data.name,
      code: data.code,
      schedule: 'TBD', // Default schedule
      color: '#4f46e5' // Default color
    };
    
    return this.request('/courses/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData)
    });
  }

  // Grade endpoints
  async getGrades() {
    return this.request('/grades/');
  }

  // Assignment endpoints
  async getAssignments(): Promise<ApiResponse> {
    return this.request('/assignments/');
  }

  async createAssignment(data: AssignmentData): Promise<ApiResponse> {
    return this.request('/assignments/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  async updateAssignment(assignmentId: string, data: AssignmentData): Promise<ApiResponse> {
    return this.request(`/assignments/${assignmentId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  async deleteAssignment(assignmentId: string): Promise<ApiResponse> {
    return this.request(`/assignments/${assignmentId}/`, {
      method: 'DELETE'
    });
  }

  async getAssignmentQuestions(assignmentId: string): Promise<ApiResponse> {
    return this.request(`/assignments/${assignmentId}/questions/`);
  }

  async addQuizQuestions(assignmentId: string, questions: any[]): Promise<ApiResponse> {
    return this.request(`/assignments/${assignmentId}/add_questions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions })
    });
  }

  async submitQuiz(assignmentId: string, answers: Record<string, string>, timeTaken: number): Promise<ApiResponse> {
    return this.request(`/assignments/${assignmentId}/submit_quiz/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, time_taken: timeTaken })
    });
  }

  // User Profile endpoints
  async getUserProfile(): Promise<ApiResponse<UserProfileData>> {
    return this.request('/profiles/my_profile/');
  }

  async updateUserProfile(data: UserProfileData): Promise<ApiResponse> {
    return this.request('/profiles/my_profile/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  // Profile management
  async uploadAvatar(file: File): Promise<ApiResponse<{ avatar_url: string }>> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE_URL}/users/upload_avatar/`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { data: undefined, error: error instanceof Error ? error.message : 'Failed to upload avatar' };
    }
  }

  // FAQ endpoints
  async getFAQs(): Promise<ApiResponse> {
    return this.request('/faqs/');
  }

  async searchFAQs(query: string): Promise<ApiResponse> {
    return this.request(`/faqs/search/?q=${encodeURIComponent(query)}`);
  }

  async getFAQsByCategory(category: string): Promise<ApiResponse> {
    return this.request(`/faqs/by_category/?category=${encodeURIComponent(category)}`);
  }

  // Contact form endpoints
  async submitContactMessage(data: ContactMessageData): Promise<ApiResponse> {
    return this.request('/contact/submit/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  // Student Management endpoints (teachers only)
  async createStudent(data: StudentData): Promise<ApiResponse> {
    return this.request('/student-management/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  async bulkCreateStudents(students: StudentData[]): Promise<ApiResponse> {
    return this.request('/student-management/bulk_create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students })
    });
  }

  async exportStudents(): Promise<ApiResponse<string>> {
    return this.request<string>('/student-management/export/');
  }

  async submitAssignment(assignmentId: string, file?: File) {
    const id = assignmentId.replace('a', '');
    
    if (file) {
      // File upload submission
      const formData = new FormData();
      formData.append('submission_file', file);
      
      return this.request(`/assignments/${id}/submit/`, {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      });
    } else {
      // Simple submission (for backward compatibility)
      return this.request(`/assignments/${id}/submit/`, {
        method: 'POST',
      });
    }
  }

  async gradeAssignment(assignmentId: string, grade: number) {
    const id = assignmentId.replace('a', '');
    return this.request(`/assignments/${id}/grade/`, {
      method: 'POST',
      body: JSON.stringify({ grade }),
    });
  }

  async gradeStudentSubmission(submissionId: string, grade: number, feedback?: string) {
    const id = submissionId.replace('sub', '');
    return this.request(`/assignmentsubmissions/${id}/grade/`, {
      method: 'POST',
      body: JSON.stringify({ grade, feedback }),
    });
  }

  async downloadSubmission(submissionId: string) {
    const id = submissionId.replace('sub', '');
    return this.request(`/assignmentsubmissions/${id}/download/`);
  }

  async getAssignmentSubmissions() {
    return this.request('/assignmentsubmissions/');
  }

  // Attendance endpoints
  async getAttendance(): Promise<ApiResponse> {
    return this.request('/attendance/');
  }

  async markAttendance(courseId: string, date: string, attendanceData: any[]): Promise<ApiResponse> {
    return this.request('/attendance/mark_attendance/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id: courseId,
        date: date,
        attendance: attendanceData
      })
    });
  }

  async getCourseAttendance(courseId: string, date?: string): Promise<ApiResponse> {
    const params = new URLSearchParams({ course_id: courseId });
    if (date) {
      params.append('date', date);
    }
    return this.request(`/attendance/course_attendance/?${params}`);
  }

  async getStudentAttendanceSummary(studentId?: string): Promise<ApiResponse> {
    const params = studentId ? new URLSearchParams({ student_id: studentId }) : '';
    return this.request(`/attendance/student_attendance_summary/${params ? '?' + params : ''}`);
  }

  async getAttendanceSessions(): Promise<ApiResponse> {
    return this.request('/attendance-sessions/');
  }

  async createAttendanceSession(data: { course_id: string; date: string; notes?: string }): Promise<ApiResponse> {
    return this.request('/attendance-sessions/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  // Emotion endpoints
  async getEmotions() {
    return this.request('/emotions/');
  }

  async detectEmotion() {
    return this.request('/emotions/detect/', {
      method: 'POST',
    });
  }

  // Badge endpoints
  async getBadges() {
    return this.request('/badges/');
  }

  // Doubt endpoints
  async getDoubts() {
    return this.request('/doubts/');
  }

  async submitDoubt(courseId: string, question: string) {
    const courseIdNum = courseId.replace('c', '');
    return this.request('/doubts/', {
      method: 'POST',
      body: JSON.stringify({
        course_id: courseIdNum,
        question,
      }),
    });
  }

  async answerDoubt(doubtId: string, answer: string) {
    const id = doubtId.replace('d', '');
    return this.request(`/doubts/${id}/answer/`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  }

  // Student stats endpoints
  async getStudentStats() {
    return this.request('/student-stats/');
  }

  // Schedule endpoints
  async getSchedules() {
    return this.request('/schedules/');
  }

  // Profile picture upload
  async uploadProfilePicture(file: File): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);
      
      // Get CSRF token
      const csrfToken = await this.getCsrfToken();
      const headers: Record<string, string> = {};
      
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await fetch(`${API_BASE_URL}/profiles/upload_profile_picture/`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { data: null as any, error: error instanceof Error ? error.message : 'Failed to upload profile picture' };
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      const csrfToken = await this.getCsrfToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await fetch(`${API_BASE_URL}/users/change_password/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { data: null as any, error: error instanceof Error ? error.message : 'Failed to change password' };
    }
  }

  // Logout all devices
  async logoutAllDevices(): Promise<ApiResponse> {
    try {
      const csrfToken = await this.getCsrfToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await fetch(`${API_BASE_URL}/users/logout_all_devices/`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { data: null as any, error: error instanceof Error ? error.message : 'Failed to logout all devices' };
    }
  }

  // Quiz results
  async getQuizResults(assignmentId: string, studentId?: string): Promise<ApiResponse> {
    const params = studentId ? new URLSearchParams({ student_id: studentId }) : '';
    return this.request(`/assignments/${assignmentId}/quiz_results/${params ? '?' + params : ''}`);
  }

  async getMySchedule() {
    return this.request('/schedules/my_schedule/');
  }

  async createSchedule(courseId: string, day: string, time: string, type: string, room?: string) {
    const courseIdNum = courseId.replace('c', '');
    return this.request('/schedules/', {
      method: 'POST',
      body: JSON.stringify({
        course_id: courseIdNum,
        day,
        time,
        type,
        room: room || null,
      }),
    });
  }

  async updateSchedule(scheduleId: string, day: string, time: string, type: string, room?: string) {
    const id = scheduleId.replace('s', '');
    return this.request(`/schedules/${id}/`, {
      method: 'PUT',
      body: JSON.stringify({
        day,
        time,
        type,
        room: room || null,
      }),
    });
  }

  async deleteSchedule(scheduleId: string) {
    const id = scheduleId.replace('s', '');
    return this.request(`/schedules/${id}/`, {
      method: 'DELETE',
    });
  }

  // Notification endpoints
  async getNotifications() {
    return this.request('/notifications/');
  }

  async markNotificationAsRead(notificationId: string) {
    const id = notificationId.replace('n', '');
    return this.request(`/notifications/${id}/mark_as_read/`, {
      method: 'POST',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark_all_as_read/', {
      method: 'POST',
    });
  }

  async getUnreadNotificationCount() {
    return this.request('/notifications/unread_count/');
  }

  // Course students
  async getCourseStudents(courseId: string): Promise<ApiResponse<any[]>> {
    try {
      // Remove 'c' prefix if present
      const courseIdNum = courseId.replace('c', '');
      const response = await fetch(`${API_BASE_URL}/courses/${courseIdNum}/students/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { data: undefined, error: error instanceof Error ? error.message : 'Failed to fetch course students' };
    }
  }

  async enrollStudent(courseId: string, email: string): Promise<ApiResponse> {
    const courseIdNum = courseId.replace('c', '');
    return this.request(`/courses/${courseIdNum}/enroll_student/`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async removeStudent(courseId: string, studentId: string): Promise<ApiResponse> {
    const courseIdNum = courseId.replace('c', '');
    return this.request(`/courses/${courseIdNum}/remove_student/`, {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId }),
    });
  }
}

export const apiService = new ApiService(); 
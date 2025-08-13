const API_BASE_URL = 'http://localhost:8050/api';

interface ApiResponse<T> {
  data: T;
  error?: string;
}

class ApiService {
  private getCsrfToken(): string | null {
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

  // eslint-disable-next-line no-undef
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      // Get CSRF token for POST requests
      const csrfToken = this.getCsrfToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      // Add CSRF token to headers for POST requests
      if (options.method === 'POST' && csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        // eslint-disable-next-line no-undef
        credentials: 'include',
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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

  // Grade endpoints
  async getGrades() {
    return this.request('/grades/');
  }

  // Assignment endpoints
  async getAssignments() {
    return this.request('/assignments/');
  }

  async createAssignment(courseId: string, title: string, description: string, dueDate: string) {
    const courseIdNum = courseId.replace('c', '');
    return this.request('/assignments/', {
      method: 'POST',
      body: JSON.stringify({
        course_id: courseIdNum,
        title,
        description,
        due_date: dueDate,
        status: 'pending',
        grade: null,
        color: '#4f46e5'
      }),
    });
  }

  async submitAssignment(assignmentId: string) {
    const id = assignmentId.replace('a', '');
    return this.request(`/assignments/${id}/submit/`, {
      method: 'POST',
    });
  }

  async gradeAssignment(assignmentId: string, grade: number) {
    const id = assignmentId.replace('a', '');
    return this.request(`/assignments/${id}/grade/`, {
      method: 'POST',
      body: JSON.stringify({ grade }),
    });
  }

  async gradeStudentSubmission(assignmentId: string, studentId: string, grade: number) {
    const id = assignmentId.replace('a', '');
    return this.request(`/assignments/${id}/grade/`, {
      method: 'POST',
      body: JSON.stringify({ 
        student_id: studentId,
        grade 
      }),
    });
  }

  async getAssignmentSubmissions() {
    return this.request('/assignment-submissions/');
  }

  // Attendance endpoints
  async getAttendance() {
    return this.request('/attendance/');
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
}

export const apiService = new ApiService(); 
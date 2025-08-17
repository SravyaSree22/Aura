import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Save
} from 'lucide-react';
import { apiService } from '../services/api';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface AttendanceRecord {
  student_id: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
}

const AttendancePage = () => {
  const { currentUser } = useAuth();
  const { courses } = useData();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [viewMode, setViewMode] = useState<'mark' | 'view'>('mark');

  const isTeacher = currentUser?.role === 'teacher';

  useEffect(() => {
    if (selectedCourse) {
      loadCourseStudents();
    }
  }, [selectedCourse]);

  const loadCourseStudents = async () => {
    try {
      const response = await apiService.getCourseStudents(selectedCourse.replace('c', ''));
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setStudents(response.data);
        
        // Initialize attendance records
        const initialRecords: AttendanceRecord[] = response.data.map(student => ({
          student_id: student.id.toString(),
          status: 'present',
          notes: ''
        }));
        setAttendanceRecords(initialRecords);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load students for this course' 
      });
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.student_id === studentId 
          ? { ...record, status }
          : record
      )
    );
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.student_id === studentId 
          ? { ...record, notes }
          : record
      )
    );
  };

  const handleMarkAttendance = async () => {
    if (!selectedCourse) {
      setMessage({ type: 'error', text: 'Please select a course' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await apiService.markAttendance(
        selectedCourse.replace('c', ''),
        selectedDate,
        attendanceRecords
      );

      if (response.error) {
        throw new Error(response.error);
      }

      setMessage({ type: 'success', text: 'Attendance marked successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to mark attendance' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTeacher) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Only teachers can manage attendance.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === 'mark' ? 'primary' : 'outline'}
            onClick={() => setViewMode('mark')}
          >
            Mark Attendance
          </Button>
          <Button 
            variant={viewMode === 'view' ? 'primary' : 'outline'}
            onClick={() => setViewMode('view')}
          >
            View Records
          </Button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {viewMode === 'mark' ? (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Mark Attendance</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Choose a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            {selectedCourse && students.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">
                    Students ({students.length})
                  </h4>
                  <Button 
                    variant="primary"
                    onClick={handleMarkAttendance}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Attendance'}
                    <Save className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {students.map((student) => {
                    const record = attendanceRecords.find(r => r.student_id === student.id);
                    return (
                      <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex space-x-2">
                            <Button
                              variant={record?.status === 'present' ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => handleAttendanceChange(student.id, 'present')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Present
                            </Button>
                            <Button
                              variant={record?.status === 'late' ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => handleAttendanceChange(student.id, 'late')}
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              Late
                            </Button>
                            <Button
                              variant={record?.status === 'absent' ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => handleAttendanceChange(student.id, 'absent')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Absent
                            </Button>
                          </div>
                          
                          <Input
                            type="text"
                            placeholder="Notes (optional)"
                            value={record?.notes || ''}
                            onChange={(e) => handleNotesChange(student.id, e.target.value)}
                            className="w-32"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Attendance Records</h3>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Attendance records will be displayed here.</p>
              <p className="text-sm">Select a course and date to view attendance history.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendancePage;

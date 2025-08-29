import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Save,
  Check,
  X,
  AlertTriangle
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
  const [viewAttendanceRecords, setViewAttendanceRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [viewMode, setViewMode] = useState<'mark' | 'view'>('mark');
  // const [clickedButtons, setClickedButtons] = useState<Record<string, string>>({});
  const [studentsLoaded, setStudentsLoaded] = useState(false);

  const isTeacher = currentUser?.role === 'teacher';

  // Set default view mode for students
  useEffect(() => {
    if (!isTeacher) {
      setViewMode('view');
    }
  }, [isTeacher]);

  useEffect(() => {
    if (viewMode === 'mark') {
      if (isTeacher && selectedCourse) {
        // Reset studentsLoaded flag when course changes
        setStudentsLoaded(false);
        loadCourseStudents();
      }
    } else {
      if (isTeacher && selectedCourse) {
        loadAttendanceRecords();
      } else if (!isTeacher) {
        // Students can view their attendance without selecting a course
        loadAttendanceRecords();
      }
    }
  }, [selectedCourse, viewMode, isTeacher]); // Removed selectedDate from dependencies

  // Reload attendance data when date changes in mark mode
  useEffect(() => {
    if (viewMode === 'mark' && isTeacher && selectedCourse && studentsLoaded) {
      // Reload attendance data for the new date
      loadCourseStudents();
    }
  }, [selectedDate, viewMode, isTeacher, selectedCourse, studentsLoaded]);

  // Load student attendance when they first visit the page
  useEffect(() => {
    if (!isTeacher && viewMode === 'view') {
      loadAttendanceRecords();
    }
  }, [isTeacher, viewMode]);

  // Reload attendance records when date changes (only for viewing, not marking)
  useEffect(() => {
    if (viewMode === 'view' && selectedDate) {
      if (isTeacher && selectedCourse) {
        loadAttendanceRecords();
      } else if (!isTeacher) {
        loadAttendanceRecords();
      }
    }
  }, [selectedDate, viewMode, isTeacher, selectedCourse]);

  // Monitor attendance records state changes
  useEffect(() => {
    console.log('attendanceRecords state changed:', attendanceRecords);
  }, [attendanceRecords]);

  const loadCourseStudents = async () => {
    try {
      const response = await apiService.getCourseStudents(selectedCourse.replace('c', ''));
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setStudents(response.data);
        
        // Load existing attendance data for today's date
        try {
          console.log('Loading existing attendance data for date:', selectedDate);
          const attendanceResponse = await apiService.getCourseAttendance(
            selectedCourse.replace('c', ''),
            selectedDate
          );
          
          if (attendanceResponse.data && Array.isArray(attendanceResponse.data)) {
            console.log('Found existing attendance data:', attendanceResponse.data);
    
            
            // Create attendance records with existing data or default to 'present'
            const initialRecords: AttendanceRecord[] = response.data.map(student => {
              const existingRecord = (attendanceResponse.data as any[]).find(
                (record: any) => record.studentId === student.id.toString()
              );
              
              return {
                student_id: student.id.toString(),
                status: existingRecord ? existingRecord.status : 'present',
                notes: existingRecord ? existingRecord.notes || '' : ''
              };
            });
            
            console.log('Initializing attendance records with existing data:', initialRecords);
            setAttendanceRecords(initialRecords);
          } else {
            // No existing data, initialize with default 'present'
            console.log('No existing attendance data found, initializing with defaults');
            const initialRecords: AttendanceRecord[] = response.data.map(student => ({
              student_id: student.id.toString(),
              status: 'present',
              notes: ''
            }));
            console.log('Initializing new attendance records:', initialRecords);
            setAttendanceRecords(initialRecords);
          }
        } catch (attendanceError) {
          console.log('Error loading existing attendance, using defaults:', attendanceError);
          // If loading attendance fails, use defaults
          const initialRecords: AttendanceRecord[] = response.data.map(student => ({
            student_id: student.id.toString(),
            status: 'present',
            notes: ''
          }));
          setAttendanceRecords(initialRecords);
        }
        
        setStudentsLoaded(true);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load students for this course' 
      });
    }
  };

  const handleAttendanceChange = useCallback((studentId: string | number, status: 'present' | 'absent' | 'late') => {
    console.log('handleAttendanceChange called:', { studentId, status });
    
    // Set visual feedback for clicked button
    // setClickedButtons(prev => ({ ...prev, [studentId.toString()]: status }));
    
    // Clear only this student's visual feedback after 500ms (longer for better UX)
    setTimeout(() => {
      // setClickedButtons(prev => {
      //   const newState = { ...prev };
      //   delete newState[studentId.toString()];
      //   return newState;
      // });
    }, 500);
    
         // Update attendance records with a more reliable approach
     setAttendanceRecords(prev => {
       console.log('Previous attendance records:', prev);
       
       // Debug: Log all student IDs in attendance records
       console.log('Student IDs in attendance records:', prev.map(record => record.student_id));
       console.log('Looking for student ID:', studentId);
       console.log('Type of studentId:', typeof studentId);
       
       // Find the index of the student to update (convert studentId to string for comparison)
       const studentIndex = prev.findIndex(record => record.student_id === studentId.toString());
       console.log(`Found student at index: ${studentIndex}`);
       
       if (studentIndex === -1) {
         console.error(`Student ${studentId} (${typeof studentId}) not found in attendance records`);
         console.log('Available student IDs:', prev.map(record => `${record.student_id} (${typeof record.student_id})`));
         return prev;
       }
      
      // Create a new array with the updated record
      const updated = [...prev];
      updated[studentIndex] = { ...updated[studentIndex], status };
      
      console.log(`Updated student ${studentId} from ${prev[studentIndex].status} to ${status}`);
      console.log('Updated attendance records:', updated);
      
      // Log each record to see the exact state
      updated.forEach((record, index) => {
        console.log(`Record ${index}: student_id=${record.student_id}, status=${record.status}`);
      });
      
      return updated;
    });
  }, []);

  const handleNotesChange = (studentId: string | number, notes: string) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.student_id === studentId.toString() 
          ? { ...record, notes }
          : record
      )
    );
  };

  const handleBulkAction = (status: 'present' | 'absent' | 'late') => {
    setAttendanceRecords(prev => 
      prev.map(record => ({ ...record, status }))
    );
  };

  const loadAttendanceRecords = async () => {
    setIsLoadingView(true);
    setMessage(null);

    try {
      let response;
      
      if (isTeacher) {
        // Teachers can view attendance for specific courses
        if (!selectedCourse) {
          setMessage({ type: 'error', text: 'Please select a course' });
          return;
        }
        
        console.log('Teacher loading attendance for course:', selectedCourse.replace('c', ''), 'date:', selectedDate);
        response = await apiService.getCourseAttendance(
          selectedCourse.replace('c', ''),
          selectedDate
        );
      } else {
        // Students can view their own attendance
        console.log('Student loading their own attendance');
        response = await apiService.getAttendance();
      }

      console.log('Attendance records response:', response);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data && Array.isArray(response.data)) {
        console.log('Setting attendance records:', response.data);
        setViewAttendanceRecords(response.data);
      } else {
        console.log('No attendance data received or invalid format');
        setViewAttendanceRecords([]);
      }
    } catch (error) {
      console.error('Error loading attendance records:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to load attendance records' 
      });
    } finally {
      setIsLoadingView(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedCourse) {
      setMessage({ type: 'error', text: 'Please select a course' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Debug: Log current state
      console.log('Current attendanceRecords state:', attendanceRecords);
      console.log('Current students state:', students);
      
      // Log each attendance record in detail
      attendanceRecords.forEach((record, index) => {
        console.log(`Attendance Record ${index}: student_id=${record.student_id}, status=${record.status}, notes=${record.notes}`);
      });
      
      // Debug: Log what we're sending
      console.log('Sending attendance data:', {
        courseId: selectedCourse.replace('c', ''),
        date: selectedDate,
        attendanceRecords: attendanceRecords
      });

      const response = await apiService.markAttendance(
        selectedCourse.replace('c', ''),
        selectedDate,
        attendanceRecords
      );

      console.log('Attendance response:', response);

      if (response.error) {
        throw new Error(response.error);
      }

      setMessage({ type: 'success', text: 'Attendance marked successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);

             // Don't reset the form - keep the current state for better UX
       // setAttendanceRecords([]);
       // setStudents([]);
       // setSelectedCourse('');
    } catch (error) {
      console.error('Attendance error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to mark attendance' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove the early return for students - let them see their attendance

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {isTeacher ? 'Attendance Management' : 'My Attendance'}
        </h1>
        {isTeacher && (
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
        )}
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
                  <div className="flex items-center space-x-4">
                    <h4 className="font-medium text-gray-900">
                      Students ({students.length})
                    </h4>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAction('present')}
                        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark All Present
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAction('absent')}
                        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Mark All Absent
                      </Button>
                    </div>
                  </div>
                                     <Button 
                     variant="primary"
                     onClick={handleMarkAttendance}
                     disabled={isLoading}
                     className={isLoading ? 'opacity-75 cursor-not-allowed' : ''}
                   >
                     {isLoading ? (
                       <>
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                         Saving...
                       </>
                     ) : (
                       <>
                         Save Attendance
                         <Save className="w-4 h-4 ml-2" />
                       </>
                     )}
                   </Button>
                </div>

                <div className="grid gap-3">
                  {students.map((student) => {
                    const record = attendanceRecords.find(r => r.student_id === student.id.toString());
                    // const isClicked = clickedButtons[student.id];
                    
                    // Debug log
                    console.log(`Student ${student.name} (${student.id}): record=`, record, 'status=', record?.status);
                    
                    return (
                                             <div 
                         key={student.id} 
                         className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                           record?.status === 'present' 
                             ? 'border-green-500 bg-green-100 shadow-lg' 
                             : record?.status === 'late'
                             ? 'border-yellow-500 bg-yellow-100 shadow-lg'
                             : record?.status === 'absent'
                             ? 'border-red-500 bg-red-100 shadow-lg'
                             : 'border-gray-200 bg-white'
                         }`}
                       >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {record?.status === 'present' && (
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                              )}
                              {record?.status === 'late' && (
                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                  <Clock className="w-5 h-5 text-yellow-600" />
                                </div>
                              )}
                              {record?.status === 'absent' && (
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                  <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                              )}
                              {!record?.status && (
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <AlertTriangle className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                                                         <div>
                               <div className="font-medium text-gray-900">{student.name}</div>
                               <div className="text-sm text-gray-500">{student.email}</div>
                                                               {record?.status && (
                                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold mt-1 ${
                                    record.status === 'present' 
                                      ? 'bg-green-100 text-green-800 border border-green-300' :
                                    record.status === 'late' 
                                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                      'bg-red-100 text-red-800 border border-red-300'
                                  }`}>
                                    {record.status === 'present' && <CheckCircle className="w-3 h-3 mr-1" />}
                                    {record.status === 'late' && <Clock className="w-3 h-3 mr-1" />}
                                    {record.status === 'absent' && <XCircle className="w-3 h-3 mr-1" />}
                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                  </div>
                                )}
                             </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                                                         <div className="flex space-x-1">
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => handleAttendanceChange(student.id, 'present')}
                                 className={`transition-all duration-200 ${
                                   record?.status === 'present' 
                                     ? '!bg-green-600 !border-green-600 !text-white shadow-lg font-bold' 
                                     : 'bg-white border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-300'
                                 }`}
                               >
                                 <CheckCircle className="w-4 h-4 mr-1" />
                                 Present
                               </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => handleAttendanceChange(student.id, 'late')}
                                 className={`transition-all duration-200 ${
                                   record?.status === 'late' 
                                     ? '!bg-yellow-600 !border-yellow-600 !text-white shadow-lg font-bold' 
                                     : 'bg-white border-gray-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-300'
                                 }`}
                               >
                                 <Clock className="w-4 h-4 mr-1" />
                                 Late
                               </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => handleAttendanceChange(student.id, 'absent')}
                                 className={`transition-all duration-200 ${
                                   record?.status === 'absent' 
                                     ? '!bg-red-600 !border-red-600 !text-white shadow-lg font-bold' 
                                     : 'bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300'
                                 }`}
                               >
                                 <XCircle className="w-4 h-4 mr-1" />
                                 Absent
                               </Button>
                             </div>
                            
                            <Input
                              type="text"
                              placeholder="Notes"
                              value={record?.notes || ''}
                              onChange={(e) => handleNotesChange(student.id, e.target.value)}
                              className="w-32 text-sm"
                            />
                          </div>
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
            <h3 className="text-lg font-semibold">View Attendance Records</h3>
          </CardHeader>
          <CardContent>
            {isTeacher ? (
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
                    Date (Optional - leave empty for all dates)
                  </label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Date (Optional - leave empty for all dates)
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full md:w-64"
                />
              </div>
            )}

            {(isTeacher ? selectedCourse : true) && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">
                    {isTeacher ? 'Attendance Records' : 'My Attendance Records'}
                  </h4>
                  <Button 
                    variant="outline"
                    onClick={loadAttendanceRecords}
                    disabled={isLoadingView}
                  >
                    {isLoadingView ? 'Loading...' : 'Refresh'}
                    <Calendar className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {isLoadingView ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading attendance records...</p>
                  </div>
                ) : viewAttendanceRecords.length > 0 ? (
                  <div className="space-y-3">
                    {viewAttendanceRecords.map((record) => (
                      <div 
                        key={record.id} 
                        className={`p-4 border rounded-lg ${
                          record.status === 'present' 
                            ? 'border-green-200 bg-green-50' 
                            : record.status === 'late'
                            ? 'border-yellow-200 bg-yellow-50'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {record.status === 'present' && (
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                              )}
                              {record.status === 'late' && (
                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                  <Clock className="w-5 h-5 text-yellow-600" />
                                </div>
                              )}
                              {record.status === 'absent' && (
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                  <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{record.studentName}</div>
                              <div className="text-sm text-gray-500">{record.courseName} • {record.date}</div>
                              {record.notes && (
                                <div className="text-sm text-gray-600 mt-1">
                                  <strong>Notes:</strong> {record.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              record.status === 'present' 
                                ? 'bg-green-100 text-green-800' 
                                : record.status === 'late'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Marked by: {record.markedBy || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>{isTeacher ? 'No attendance records found for this course and date.' : 'No attendance records found for you.'}</p>
                    <p className="text-sm">{isTeacher ? 'Try selecting a different date or course.' : 'Your attendance records will appear here once teachers mark them.'}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendancePage;

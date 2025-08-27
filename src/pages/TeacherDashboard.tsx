
import Card, { CardHeader, CardContent } from '../components/ui/Card';
// import StudentList from '../components/teacher/StudentList';
import PerformanceChart from '../components/teacher/PerformanceChart';
import { useData } from '../context/DataContext';
import { AlertTriangle, BookOpen, Layers, Users } from 'lucide-react';

const TeacherDashboard = () => {
  const { studentStats, doubts, courses } = useData();
  
  // Calculate stats
  const averageGrade = studentStats.reduce((sum, student) => sum + student.averageGrade, 0) / studentStats.length;
  const averageAttendance = studentStats.reduce((sum, student) => sum + student.attendanceRate, 0) / studentStats.length * 100;
  const pendingDoubts = doubts.filter(doubt => doubt.status === 'pending').length;
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none">
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-blue-500/10 p-3 mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-900">{studentStats.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-none">
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-emerald-500/10 p-3 mr-4">
              <Layers className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-600">Average Grade</p>
              <h3 className="text-2xl font-bold text-gray-900">{averageGrade.toFixed(1)}%</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-none">
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-violet-500/10 p-3 mr-4">
              <BookOpen className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-violet-600">Attendance Rate</p>
              <h3 className="text-2xl font-bold text-gray-900">{averageAttendance.toFixed(0)}%</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-none">
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-amber-500/10 p-3 mr-4">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-600">Pending Doubts</p>
              <h3 className="text-2xl font-bold text-gray-900">{pendingDoubts}</h3>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Charts */}
      <PerformanceChart students={studentStats} />
      
      {/* Student List - Removed due to type incompatibility */}
      {/* <StudentList students={studentStats} /> */}
      
      {/* Anonymous Doubts */}
      <Card>
        <CardHeader>
          <h3 className="font-medium text-gray-900">Anonymous Student Doubts</h3>
        </CardHeader>
        <CardContent>
          {doubts.length > 0 ? (
            <div className="space-y-4">
              {doubts.map(doubt => (
                <div key={doubt.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">
                      {courses.find(c => c.id === doubt.courseId)?.name}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doubt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {doubt.status === 'pending' ? 'Pending' : 'Answered'}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{doubt.question}</p>
                  <div className="text-xs text-gray-500">
                    Asked on {new Date(doubt.timestamp).toLocaleString()}
                  </div>
                  
                  {doubt.status === 'answered' && doubt.answer && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="font-medium text-gray-900 mb-1">Your Response:</div>
                      <p className="text-gray-700">{doubt.answer}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        Answered on {new Date(doubt.answerTimestamp!).toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  {doubt.status === 'pending' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                        Reply to this question
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No doubts have been submitted by students yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;

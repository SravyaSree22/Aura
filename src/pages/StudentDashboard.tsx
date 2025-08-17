
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import GradeCard from '../components/student/GradeCard';
import AssignmentCard from '../components/student/AssignmentCard';
import EmotionDetector from '../components/student/EmotionDetector';
import DoubtForm from '../components/student/DoubtForm';
import BadgeCard from '../components/student/BadgeCard';
import { useData } from '../context/DataContext';
import { Book, Calendar, Check, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { grades, assignments, attendance, badges } = useData();
  const navigate = useNavigate();
  
  // Calculate attendance stats
  const totalClasses = attendance.length;
  const presentClasses = attendance.filter(a => a.status === 'present').length;
  const lateClasses = attendance.filter(a => a.status === 'late').length;
  const absentClasses = attendance.filter(a => a.status === 'absent').length;
  
  const attendanceRate = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
  
  // Calculate grade average
  const gradeAverage = grades.length > 0
    ? grades.reduce((sum, grade) => sum + (grade.value / grade.maxValue) * 100, 0) / grades.length
    : 0;
  
  // Get upcoming assignments
  const pendingAssignments = assignments
    .filter(a => {
      const dueDate = new Date(a.dueDate);
      const today = new Date();
      return dueDate >= today;
    })
    .slice(0, 3);
  
  // Get recent grades
  const recentGrades = [...grades]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-none">
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-indigo-500/10 p-3 mr-4">
              <Book className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-600">Average Grade</p>
              <h3 className="text-2xl font-bold text-gray-900">{gradeAverage.toFixed(1)}%</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-none">
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-emerald-500/10 p-3 mr-4">
              <Calendar className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-600">Attendance Rate</p>
              <h3 className="text-2xl font-bold text-gray-900">{attendanceRate.toFixed(0)}%</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-none">
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-amber-500/10 p-3 mr-4">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-600">Pending Assignments</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {assignments.filter(a => {
                  const dueDate = new Date(a.dueDate);
                  const today = new Date();
                  return dueDate >= today;
                }).length}
              </h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-none">
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-violet-500/10 p-3 mr-4">
              <Check className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-violet-600">Completed Assignments</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {assignments.filter(a => {
                  const dueDate = new Date(a.dueDate);
                  const today = new Date();
                  return dueDate < today;
                }).length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Attendance Chart */}
      <Card>
        <CardHeader>
          <h3 className="font-medium text-gray-900">Attendance Overview</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-600">Present: {presentClasses}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-sm text-gray-600">Late: {lateClasses}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm text-gray-600">Absent: {absentClasses}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-200 mr-2"></div>
              <span className="text-sm text-gray-600">Total: {totalClasses}</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-l-full" style={{ width: `${(presentClasses / totalClasses) * 100}%` }}></div>
            <div className="bg-yellow-500 h-2.5" style={{ width: `${(lateClasses / totalClasses) * 100}%`, marginLeft: `${(presentClasses / totalClasses) * 100}%` }}></div>
            <div className="bg-red-500 h-2.5 rounded-r-full" style={{ width: `${(absentClasses / totalClasses) * 100}%`, marginLeft: `${((presentClasses + lateClasses) / totalClasses) * 100}%` }}></div>
          </div>
        </CardContent>
      </Card>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Grades */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Recent Grades</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentGrades.map(grade => (
                  <GradeCard key={grade.id} grade={grade} />
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Upcoming Assignments */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Upcoming Assignments</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAssignments.map(assignment => (
                  <AssignmentCard 
                    key={assignment.id} 
                    assignment={assignment} 
                    onViewDetails={() => navigate(`/courses/${assignment.courseId}`)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Badges */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Your Achievements</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {badges.map(badge => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Column 2 */}
        <div className="space-y-6">
          <EmotionDetector />
          <DoubtForm />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

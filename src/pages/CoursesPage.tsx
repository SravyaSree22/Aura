import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { apiService } from '../services/api';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Book, BookOpen, Calendar, Info, User, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreateCourseModal from '../components/teacher/CreateCourseModal';
import StudentEnrollmentModal from '../components/teacher/StudentEnrollmentModal';

const CoursesPage = () => {
  const { courses, createCourse } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseStudents, setCourseStudents] = useState<any[]>([]);
  
  const toggleExpand = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };
  
  const handleEnterCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleCreateCourse = async (name: string, code: string, description?: string) => {
    await createCourse(name, code, description || '');
  };

  const handleManageStudents = async (courseId: string) => {
    try {
      const response = await apiService.getCourseStudents(courseId);
      if (response.data) {
        setCourseStudents(response.data);
        setSelectedCourseId(courseId);
        setShowEnrollmentModal(true);
      }
    } catch (error) {
      console.error('Error fetching course students:', error);
    }
  };

  const handleEnrollStudent = async (email: string) => {
    if (!selectedCourseId) return;
    await apiService.enrollStudent(selectedCourseId, email);
    // Refresh the students list
    const response = await apiService.getCourseStudents(selectedCourseId);
    if (response.data) {
      setCourseStudents(response.data);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedCourseId) return;
    await apiService.removeStudent(selectedCourseId, studentId);
    // Refresh the students list
    const response = await apiService.getCourseStudents(selectedCourseId);
    if (response.data) {
      setCourseStudents(response.data);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        {currentUser?.role === 'teacher' && (
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Create New Course
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card 
            key={course.id}
            className={`h-full border-l-4 transition-all duration-300 ${expandedCourse === course.id ? 'ring-2 ring-indigo-300 shadow-lg' : 'shadow-sm'}`}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                  <div className="text-sm text-gray-500">{course.code}</div>
                </div>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${course.color}20` }}
                >
                  <Book className="w-5 h-5" style={{ color: course.color }} />
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-start">
                  <User className="w-4 h-4 text-gray-500 mt-0.5 mr-2" />
                  <div className="text-sm text-gray-700">{course.teacher}</div>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-4 h-4 text-gray-500 mt-0.5 mr-2" />
                  <div className="text-sm text-gray-700">{course.schedule}</div>
                </div>
              </div>
              
              {expandedCourse === course.id && (
                <div className="mb-4 animate-fadeIn">
                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Course Description:</span> This course covers fundamental concepts and advanced applications in the field of study.
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Completion:</span> 68%
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-1.5 my-2">
                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-2 rounded border border-gray-200">
                      <div className="text-xs text-gray-500">Total Classes</div>
                      <div className="text-sm font-medium">24</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-200">
                      <div className="text-xs text-gray-500">Assignments</div>
                      <div className="text-sm font-medium">8</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  fullWidth
                  onClick={() => toggleExpand(course.id)}
                >
                  <Info className="w-4 h-4 mr-1" />
                  {expandedCourse === course.id ? 'Less Info' : 'More Info'}
                </Button>
                {currentUser?.role === 'teacher' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    fullWidth
                    onClick={() => handleManageStudents(course.id)}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Students
                  </Button>
                )}
                <Button 
                  variant="primary" 
                  size="sm" 
                  fullWidth
                  onClick={() => handleEnterCourse(course.id)}
                >
                  Enter Course
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>

      <CreateCourseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCourse}
      />

      <StudentEnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        onEnrollStudent={handleEnrollStudent}
        onRemoveStudent={handleRemoveStudent}
        students={courseStudents}
      />
    </div>
  );
};

export default CoursesPage;

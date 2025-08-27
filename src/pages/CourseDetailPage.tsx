import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StudentList from '../components/teacher/StudentList';
import AssignmentCard from '../components/student/AssignmentCard';
import { 
  Book, 
  FileText, 
  BarChart3, 
  MessageCircle, 
  Plus, 
  Calendar, 
  X, 
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  Award,
  Users,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import QuizComponent from '../components/student/QuizComponent';

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = id; // Keep the variable name for compatibility
  const navigate = useNavigate();
  const { courses, assignments, grades, doubts, loading } = useData();
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    assignment_type: 'regular' as 'regular' | 'quiz',
    dueDate: '',
    maxGrade: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [showEditAssignment, setShowEditAssignment] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState({
    title: '', description: '', dueDate: '', maxGrade: ''
  });
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    points: 1
  });
  const [courseStudents, setCourseStudents] = useState<any[]>([]);
  // const [studentsLoading, setStudentsLoading] = useState(false);

  // Handle course ID with or without 'c' prefix
  const normalizedCourseId = courseId?.startsWith('c') ? courseId : `c${courseId}`;
  const course = courses.find(c => c.id === normalizedCourseId);
  const isTeacher = currentUser?.role === 'teacher';
  const isStudent = currentUser?.role === 'student';

  // Fetch course students when component mounts or course changes
  React.useEffect(() => {
    if (normalizedCourseId && isTeacher && course && !loading) {
      fetchCourseStudents();
    }
  }, [normalizedCourseId, isTeacher, course, loading]);

  const fetchCourseStudents = async () => {
    if (!normalizedCourseId || !isTeacher) return;
    
    // setStudentsLoading(true);
    try {
      const response = await apiService.getCourseStudents(normalizedCourseId);
      if (response.data) {
        setCourseStudents(response.data);
      }
    } catch (error) {
      console.error('Error fetching course students:', error);
      setCourseStudents([]);
    } finally {
      // setStudentsLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we load the course data.</p>
        </div>
      </div>
    );
  }

  try {

  if (!course || !normalizedCourseId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">The course you&apos;re looking for doesn&apos;t exist.</p>

          <Button onClick={() => navigate('/courses')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  // Simple fallback render to test if course data is available
  if (!course.name || !course.teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Data Issue</h2>
          <p className="text-gray-600 mb-4">Course found but data is incomplete.</p>
          <div className="text-sm text-gray-500 mb-4">
            <p>Course Object: {JSON.stringify(course, null, 2)}</p>
          </div>
          <Button onClick={() => navigate('/courses')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }



  const courseAssignments = assignments.filter(a => a.courseId === normalizedCourseId);
  const courseGrades = grades.filter(g => g.courseId === normalizedCourseId);
  const courseDoubts = doubts.filter(d => d.courseId === normalizedCourseId);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'grades', label: 'Grades', icon: BarChart3 },
    { id: 'discussion', label: 'Discussion', icon: MessageCircle },
  ];

  // Add students tab for teachers
  if (isTeacher) {
    tabs.push({ id: 'students', label: 'Students', icon: Users });
  }

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAssignment.title || !newAssignment.description || !newAssignment.dueDate) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const assignmentData = {
        course_id: normalizedCourseId.replace('c', ''),
        title: newAssignment.title,
        description: newAssignment.description,
        assignment_type: newAssignment.assignment_type,
        due_date: newAssignment.dueDate,
        max_grade: newAssignment.maxGrade ? parseFloat(newAssignment.maxGrade) : 100
      };

      const response = await apiService.createAssignment(assignmentData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setShowCreateAssignment(false);
      setNewAssignment({ title: '', description: '', assignment_type: 'regular', dueDate: '', maxGrade: '' });
      setMessage({ type: 'success', text: 'Assignment created successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
      
      // Refresh the page to show new assignment
      window.location.reload();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to create assignment' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAssignment = async () => {
    if (!selectedAssignment) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const assignmentData = {
        title: editingAssignment.title,
        description: editingAssignment.description,
        due_date: editingAssignment.dueDate,
        max_grade: editingAssignment.maxGrade ? parseFloat(editingAssignment.maxGrade) : 100
      };

      const response = await apiService.updateAssignment(selectedAssignment, assignmentData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setShowEditAssignment(false);
      setSelectedAssignment(null);
      setMessage({ type: 'success', text: 'Assignment updated successfully!' });
      
      setTimeout(() => {
        setMessage(null);
      }, 3000);
      
      window.location.reload();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update assignment' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await apiService.deleteAssignment(assignmentId);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setMessage({ type: 'success', text: 'Assignment deleted successfully!' });
      
      setTimeout(() => {
        setMessage(null);
      }, 3000);
      
      window.location.reload();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to delete assignment' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (assignment: any) => {
    setSelectedAssignment(assignment.id);
    setEditingAssignment({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      maxGrade: assignment.maxGrade?.toString() || ''
    });
    setShowEditAssignment(true);
  };

  const handleAddQuizQuestion = () => {
    if (!currentQuestion.question_text || !currentQuestion.option_a || !currentQuestion.option_b || 
        !currentQuestion.option_c || !currentQuestion.option_d) {
      alert('Please fill all question fields');
      return;
    }

    setQuizQuestions(prev => [...prev, { ...currentQuestion }]);
    setCurrentQuestion({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      points: 1
    });
  };

  const handleSaveQuiz = async () => {
    if (quizQuestions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await apiService.addQuizQuestions(selectedAssignment!, quizQuestions);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setShowQuizForm(false);
      setQuizQuestions([]);
      setSelectedAssignment(null);
      setMessage({ type: 'success', text: 'Quiz questions added successfully!' });
      
      setTimeout(() => {
        setMessage(null);
      }, 3000);
      
      window.location.reload();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to add quiz questions' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeQuiz = async (assignment: any) => {
    setSelectedAssignment(assignment.id);
    setQuizLoading(true);
    setQuizQuestions([]); // Clear previous questions
    
    // Fetch quiz questions for this assignment
    try {
      const response = await apiService.getAssignmentQuestions(assignment.id);
      
      if (response.data && typeof response.data === 'object' && 'questions' in response.data && Array.isArray(response.data.questions)) {
        setQuizQuestions(response.data.questions);
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback for flat array format
        setQuizQuestions(response.data);
      } else {
        setMessage({ type: 'error', text: 'Invalid quiz data received' });
        setSelectedAssignment(null);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load quiz questions' });
      setSelectedAssignment(null);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizComplete = (result: any) => {
    setSelectedAssignment(null);
    setQuizQuestions([]);
    setMessage({ type: 'success', text: `Quiz completed! Score: ${result.score.toFixed(1)}%` });
    
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
              <p className="text-gray-600 mt-1">{course.code}</p>
            </div>
            {isTeacher && (
              <Button 
                variant="primary" 
                onClick={() => setShowCreateAssignment(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            )}
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Course Overview</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  This course covers fundamental concepts and advanced applications in {course.name.toLowerCase()}. 
                  Students will learn essential theories, practical applications, and problem-solving techniques.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{courseAssignments.length}</div>
                    <div className="text-sm text-blue-600">Assignments</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{courseGrades.length}</div>
                    <div className="text-sm text-green-600">Grades</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{courseDoubts.length}</div>
                    <div className="text-sm text-purple-600">Questions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-6">
            {courseAssignments.length > 0 ? (
              <div className="grid gap-6">
                {courseAssignments.map((assignment) => (
                  isStudent ? (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onViewDetails={() => {
                        if (assignment.assignment_type === 'quiz') {
                          handleTakeQuiz(assignment);
                        } else {
                          // For regular assignments, the file upload is handled in AssignmentCard
                          console.log('Regular assignment - file upload available in card');
                        }
                      }}
                    />
                  ) : (
                    <Card key={assignment.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                              {assignment.assignment_type === 'quiz' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  Quiz
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <Award className="w-4 h-4 mr-1" />
                                Max Grade: {assignment.maxGrade}%
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {isTeacher && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openEditModal(assignment)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                {assignment.assignment_type === 'quiz' && !assignment.questions?.length && (
                                  <Button 
                                    variant="primary" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedAssignment(assignment.id);
                                      setShowQuizForm(true);
                                    }}
                                  >
                                    Add Questions
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
                  <p className="text-gray-500">
                    {isTeacher ? 'Create your first assignment to get started.' : 'No assignments have been posted yet.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="space-y-6">
            {courseGrades.length > 0 ? (
              <div className="grid gap-4">
                {courseGrades.map((grade) => (
                  <Card key={grade.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{grade.title}</h4>
                          <p className="text-sm text-gray-600">{grade.courseName}</p>
                          {grade.feedback && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <strong>Feedback:</strong> {grade.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-lg font-bold text-gray-900">{grade.value}%</div>
                          <div className="text-sm text-gray-500">out of {grade.maxValue}%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No grades yet</h3>
                  <p className="text-gray-500">Grades will appear here once assignments are graded.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'discussion' && (
          <div className="space-y-6">
            {courseDoubts.length > 0 ? (
              <div className="grid gap-4">
                {courseDoubts.map((doubt) => (
                  <Card key={doubt.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-gray-900 mb-2">{doubt.question}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(doubt.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          doubt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {doubt.status === 'pending' ? 'Pending' : 'Answered'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                  <p className="text-gray-500">Questions and discussions will appear here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'students' && isTeacher && (
          <div className="space-y-6">
            <StudentList 
              students={courseStudents}
              courseId={normalizedCourseId}
              onStudentEnrolled={fetchCourseStudents}
            />
          </div>
        )}

        {/* Create Assignment Modal */}
        {showCreateAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Create Assignment</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCreateAssignment(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAssignment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assignment Type
                    </label>
                    <select
                      value={newAssignment.assignment_type}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, assignment_type: e.target.value as 'regular' | 'quiz' }))}
                      className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="regular">Regular Assignment</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <Input
                      type="text"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Assignment title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Assignment description"
                      rows={3}
                      className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <Input
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Grade (%)
                    </label>
                    <Input
                      type="number"
                      value={newAssignment.maxGrade}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, maxGrade: e.target.value }))}
                      placeholder="100"
                      min="1"
                      max="100"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-2">
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => setShowCreateAssignment(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating...' : 'Create Assignment'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Assignment Modal */}
        {showEditAssignment && selectedAssignment && isTeacher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Edit Assignment</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowEditAssignment(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleEditAssignment(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <Input
                      type="text"
                      value={editingAssignment.title}
                      onChange={(e) => setEditingAssignment(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Assignment title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editingAssignment.description}
                      onChange={(e) => setEditingAssignment(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Assignment description"
                      rows={3}
                      className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <Input
                      type="date"
                      value={editingAssignment.dueDate}
                      onChange={(e) => setEditingAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Grade (%)
                    </label>
                    <Input
                      type="number"
                      value={editingAssignment.maxGrade}
                      onChange={(e) => setEditingAssignment(prev => ({ ...prev, maxGrade: e.target.value }))}
                      placeholder="100"
                      min="1"
                      max="100"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-2">
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => setShowEditAssignment(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Updating...' : 'Update Assignment'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quiz Form Modal */}
        {showQuizForm && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Add Quiz Questions</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowQuizForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Add Question Form */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Add New Question</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question
                        </label>
                        <textarea
                          value={currentQuestion.question_text}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question_text: e.target.value }))}
                          placeholder="Enter your question here..."
                          rows={3}
                          className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Option A
                        </label>
                        <Input
                          type="text"
                          value={currentQuestion.option_a}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, option_a: e.target.value }))}
                          placeholder="Option A"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Option B
                        </label>
                        <Input
                          type="text"
                          value={currentQuestion.option_b}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, option_b: e.target.value }))}
                          placeholder="Option B"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Option C
                        </label>
                        <Input
                          type="text"
                          value={currentQuestion.option_c}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, option_c: e.target.value }))}
                          placeholder="Option C"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Option D
                        </label>
                        <Input
                          type="text"
                          value={currentQuestion.option_d}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, option_d: e.target.value }))}
                          placeholder="Option D"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Correct Answer
                        </label>
                        <select
                          value={currentQuestion.correct_answer}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correct_answer: e.target.value }))}
                          className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Points
                        </label>
                        <Input
                          type="number"
                          value={currentQuestion.points}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                          placeholder="1"
                          min="1"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        variant="primary"
                        onClick={handleAddQuizQuestion}
                      >
                        Add Question
                      </Button>
                    </div>
                  </div>

                  {/* Questions List */}
                  {quizQuestions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Questions ({quizQuestions.length})</h4>
                      <div className="space-y-4">
                        {quizQuestions.map((question, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-900">Question {index + 1}</h5>
                              <span className="text-sm text-gray-500">Points: {question.points}</span>
                            </div>
                            <p className="text-gray-700 mb-3">{question.question_text}</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className={`p-2 rounded ${question.correct_answer === 'A' ? 'bg-green-100' : 'bg-gray-100'}`}>
                                A: {question.option_a}
                              </div>
                              <div className={`p-2 rounded ${question.correct_answer === 'B' ? 'bg-green-100' : 'bg-gray-100'}`}>
                                B: {question.option_b}
                              </div>
                              <div className={`p-2 rounded ${question.correct_answer === 'C' ? 'bg-green-100' : 'bg-gray-100'}`}>
                                C: {question.option_c}
                              </div>
                              <div className={`p-2 rounded ${question.correct_answer === 'D' ? 'bg-green-100' : 'bg-gray-100'}`}>
                                D: {question.option_d}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <Button 
                      variant="outline"
                      onClick={() => setShowQuizForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary"
                      onClick={handleSaveQuiz}
                      disabled={isLoading || quizQuestions.length === 0}
                    >
                      {isLoading ? 'Saving...' : 'Save Quiz'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quiz Component */}
        {selectedAssignment && isStudent && (() => {
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
                
                {quizLoading ? (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Quiz...</h3>
                    <p className="text-gray-500">Please wait while we load the quiz questions.</p>
                  </div>
                ) : quizQuestions.length > 0 ? (
                  <QuizComponent
                    assignmentId={selectedAssignment}
                    questions={quizQuestions}
                    onComplete={handleQuizComplete}
                  />
                ) : (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Quiz Questions Found</h3>
                    <p className="text-gray-500 mb-4">This quiz doesn&apos;t have any questions yet.</p>
                    <Button onClick={() => setSelectedAssignment(null)}>
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
  } catch (error) {
    console.error('Error rendering CourseDetailPage:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Course</h2>
            <p className="text-gray-600 mb-4">There was an error loading the course data.</p>
          <Button onClick={() => navigate('/courses')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }
};

export default CourseDetailPage; 
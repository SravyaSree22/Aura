import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { 
  ArrowLeft, 
  Book, 
  Calendar, 
  User, 
  FileText, 
  MessageCircle, 
  BarChart3, 
  Clock,
  CheckCircle,
  Circle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { apiService } from '../services/api';

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, assignments, grades, doubts, submitAssignment, createAssignment, gradeStudentSubmission } = useData();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [gradeValue, setGradeValue] = useState('');
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxGrade: ''
  });

  // Handle both formats: "c1" (from serializer) and "1" (from URL)
  const courseId = id?.startsWith('c') ? id : `c${id}`;
  const course = courses.find(c => c.id === courseId);
  
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
          <Button variant="primary" onClick={() => navigate('/courses')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const courseAssignments = assignments.filter(a => a.courseId === courseId);
  const courseGrades = grades.filter(g => g.courseId === courseId);
  const courseDoubts = doubts.filter(d => d.courseId === courseId);
  
  const completedAssignments = courseAssignments.filter(a => a.status === 'submitted' || a.status === 'graded');
  const pendingAssignments = courseAssignments.filter(a => a.status === 'pending');
  
  const averageGrade = courseGrades.length > 0 
    ? courseGrades.reduce((sum, grade) => sum + grade.value, 0) / courseGrades.length 
    : 0;

  const isTeacher = currentUser?.role === 'teacher';
  const isStudent = currentUser?.role === 'student';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'grades', label: 'Grades', icon: BarChart3 },
    { id: 'discussion', label: 'Discussion', icon: MessageCircle },
  ];

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAssignment.title || !newAssignment.description || !newAssignment.dueDate) {
      alert('Please fill all required fields');
      return;
    }

    try {
      await createAssignment(
        courseId,
        newAssignment.title,
        newAssignment.description,
        newAssignment.dueDate,
        newAssignment.maxGrade ? parseInt(newAssignment.maxGrade) : undefined
      );
      setShowCreateAssignment(false);
      setNewAssignment({ title: '', description: '', dueDate: '', maxGrade: '' });
      alert('Assignment created successfully!');
    } catch (error) {
      alert('Failed to create assignment. Please try again.');
    }
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    try {
      await submitAssignment(assignmentId);
      alert('Assignment submitted successfully!');
    } catch (error) {
      alert('Failed to submit assignment. Please try again.');
    }
  };

  const handleGradeAssignment = async (assignmentId: string) => {
    if (!gradeValue || isNaN(parseInt(gradeValue))) {
      alert('Please enter a valid grade');
      return;
    }

    if (!selectedStudent) {
      alert('No student selected');
      return;
    }

    try {
      await gradeStudentSubmission(assignmentId, selectedStudent, parseInt(gradeValue));
      setShowGradeModal(false);
      setSelectedAssignment(null);
      setSelectedStudent(null);
      setGradeValue('');
      alert('Assignment graded successfully!');
    } catch (error) {
      alert('Failed to grade assignment. Please try again.');
    }
  };

  const openGradeModal = (assignmentId: string, studentId: string) => {
    setSelectedAssignment(assignmentId);
    setSelectedStudent(studentId);
    setShowGradeModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/courses')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
            <p className="text-gray-600">{course.code}</p>
          </div>
        </div>
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${course.color}20` }}
        >
          <Book className="w-6 h-6" style={{ color: course.color }} />
        </div>
      </div>

      {/* Course Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Instructor</div>
                <div className="font-medium">{course.teacher}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Schedule</div>
                <div className="font-medium">{course.schedule}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Average Grade</div>
                <div className="font-medium">{averageGrade.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Course Description</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  This course covers fundamental concepts and advanced applications in {course.name.toLowerCase()}. 
                  Students will learn essential theories, practical applications, and problem-solving techniques.
                </p>
                
                {/* Different stats for teachers vs students */}
                {isTeacher ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">{courseAssignments.length}</div>
                      <div className="text-sm text-gray-600">Total Assignments</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{completedAssignments.length}</div>
                      <div className="text-sm text-gray-600">Submitted</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{courseDoubts.length}</div>
                      <div className="text-sm text-gray-600">Questions Asked</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{courseGrades.length}</div>
                      <div className="text-sm text-gray-600">Grades Posted</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">{courseAssignments.length}</div>
                      <div className="text-sm text-gray-600">Total Assignments</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{completedAssignments.length}</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{courseDoubts.length}</div>
                      <div className="text-sm text-gray-600">Questions Asked</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Teacher-specific actions */}
            {isTeacher && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('assignments')}
                      className="h-16"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Create New Assignment
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('grades')}
                      className="h-16"
                    >
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Post Grades
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Student-specific actions */}
            {isStudent && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('assignments')}
                      className="h-16"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      View Assignments
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('discussion')}
                      className="h-16"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Ask Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-4">
            {/* Teacher: Create Assignment Button */}
            {isTeacher && (
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Course Assignments</h3>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowCreateAssignment(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assignment
                </Button>
              </div>
            )}

            {/* Create Assignment Modal for Teachers */}
            {showCreateAssignment && isTeacher && (
              <Card className="border border-indigo-100 bg-indigo-50/30">
                <CardHeader>
                  <h3 className="font-medium text-gray-900">Create New Assignment</h3>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateAssignment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assignment Title
                      </label>
                      <Input
                        type="text"
                        value={newAssignment.title}
                        onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                        placeholder="Enter assignment title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={newAssignment.description}
                        onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                        placeholder="Enter assignment description"
                        className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Due Date
                        </label>
                        <Input
                          type="date"
                          value={newAssignment.dueDate}
                          onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
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
                          onChange={(e) => setNewAssignment({...newAssignment, maxGrade: e.target.value})}
                          placeholder="100"
                        />
                      </div>
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
                      >
                        Create Assignment
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Assignments List */}
            {courseAssignments.length > 0 ? (
              courseAssignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                          {assignment.grade && (
                            <div className="flex items-center">
                              <BarChart3 className="w-4 h-4 mr-1" />
                              Grade: {assignment.grade}%
                            </div>
                          )}
                        </div>
                        
                        {/* Show student submissions for teachers */}
                        {isTeacher && assignment.submissions && assignment.submissions.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Student Submissions:</h5>
                            <div className="space-y-2">
                              {assignment.submissions.map((submission: any) => (
                                <div key={submission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                      <span className="text-sm font-medium text-indigo-600">
                                        {submission.studentName?.charAt(0) || 'S'}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {submission.studentName || 'Unknown Student'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {submission.submittedAt ? 
                                          `Submitted: ${new Date(submission.submittedAt).toLocaleDateString()}` : 
                                          'Not submitted'
                                        }
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                    </span>
                                    {submission.status === 'submitted' && (
                                      <Button 
                                        variant="primary" 
                                        size="sm"
                                        onClick={() => openGradeModal(assignment.id, submission.studentId)}
                                      >
                                        Grade
                                      </Button>
                                    )}
                                    {submission.grade && (
                                      <span className="text-sm font-medium text-green-600">
                                        {submission.grade}%
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Status Indicators */}
                        {assignment.status === 'pending' && (
                          <Circle className="w-5 h-5 text-yellow-500" />
                        )}
                        {assignment.status === 'submitted' && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                        {assignment.status === 'graded' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </span>
                        
                        {/* Teacher Actions */}
                        {isTeacher && (
                          <div className="flex space-x-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => alert('Edit assignment functionality would go here')}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => alert('Delete assignment functionality would go here')}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        
                        {/* Student Actions */}
                        {isStudent && assignment.status === 'pending' && (
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleSubmitAssignment(assignment.id)}
                          >
                            Submit
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {isTeacher ? 'No Assignments Created' : 'No Assignments'}
                  </h3>
                  <p className="text-gray-500">
                    {isTeacher 
                      ? "You haven't created any assignments for this course yet. Click 'Create Assignment' to get started."
                      : "No assignments have been posted for this course yet."
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="space-y-4">
            {courseGrades.length > 0 ? (
              courseGrades.map((grade) => (
                <Card key={grade.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">{grade.title}</h4>
                        <p className="text-sm text-gray-600">{grade.courseName}</p>
                        <p className="text-sm text-gray-500">{new Date(grade.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">{grade.value}%</div>
                        <div className="text-sm text-gray-500">out of {grade.maxValue}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Grades</h3>
                  <p className="text-gray-500">No grades have been posted for this course yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'discussion' && (
          <div className="space-y-4">
            {courseDoubts.length > 0 ? (
              courseDoubts.map((doubt) => (
                <Card key={doubt.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4 text-gray-500" />
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          doubt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {doubt.status === 'pending' ? 'Pending' : 'Answered'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(doubt.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-800 mb-3">{doubt.question}</p>
                    {doubt.answer && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="font-medium text-gray-900 mb-1">Answer:</div>
                        <p className="text-gray-800">{doubt.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions</h3>
                  <p className="text-gray-500">No questions have been asked for this course yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Grade Assignment Modal */}
      {showGradeModal && selectedAssignment && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md bg-white p-6 rounded-lg shadow-xl">
            <CardHeader>
              <h3 className="font-medium text-gray-900">Grade Assignment</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Grade for "{courseAssignments.find(a => a.id === selectedAssignment)?.title}"
              </p>
              <div className="flex items-center space-x-2 mb-4">
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                  Grade (%)
                </label>
                <Input
                  type="number"
                  id="grade"
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  placeholder="Enter grade"
                  className="w-full"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowGradeModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => handleGradeAssignment(selectedAssignment)}>
                  Grade Assignment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage; 
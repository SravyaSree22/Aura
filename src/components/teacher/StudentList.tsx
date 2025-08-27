
import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  Download, 
  Award,
  FileText,
  Eye,
  CheckCircle,
  Clock,
  X,
  UserPlus
} from 'lucide-react';
import { apiService } from '../../services/api';

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinedDate: string;
  avatar?: string;
}

interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  submittedAt?: string;
  gradedAt?: string;
  feedback?: string;
  submission_file?: string;
}

interface StudentListProps {
  students: Student[];
  courseId?: string;
  onStudentEnrolled?: () => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, courseId, onStudentEnrolled }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gradingLoading, setGradingLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [enrollmentEmail, setEnrollmentEmail] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (courseId) {
      fetchSubmissions();
    }
  }, [courseId]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAssignmentSubmissions();
      if (response.data) {
        setSubmissions(response.data as AssignmentSubmission[]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !grade) return;

    setGradingLoading(true);
    setMessage(null);

    try {
      const gradeValue = parseFloat(grade);
      if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
        throw new Error('Grade must be a number between 0 and 100');
      }

      await apiService.gradeStudentSubmission(selectedSubmission.id, gradeValue, feedback);
      
      setMessage({ type: 'success', text: 'Submission graded successfully!' });
      setShowGradingModal(false);
      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
      
      // Refresh submissions
      await fetchSubmissions();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to grade submission' 
      });
    } finally {
      setGradingLoading(false);
    }
  };

  const handleDownloadSubmission = async (submission: AssignmentSubmission) => {
    try {
      const response = await apiService.downloadSubmission(submission.id);
      if (response.data && (response.data as any).file_url) {
        // Open the file URL in a new tab
        window.open((response.data as any).file_url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading submission:', error);
      alert('Failed to download submission file');
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentEmail.trim() || !courseId) return;

    setEnrolling(true);
    setMessage(null);

    try {
      await apiService.enrollStudent(courseId, enrollmentEmail.trim());
      setMessage({ type: 'success', text: 'Student enrolled successfully!' });
      setEnrollmentEmail('');
      setShowEnrollmentForm(false);
      
      // Refresh the students list
      if (onStudentEnrolled) {
        onStudentEnrolled();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to enroll student' 
      });
    } finally {
      setEnrolling(false);
    }
  };

  const openGradingModal = (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade?.toString() || '');
    setFeedback(submission.feedback || '');
    setShowGradingModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>;
      case 'submitted':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FileText className="w-3 h-3 mr-1" />
          Submitted
        </span>;
      case 'graded':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Graded
        </span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enrollment Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Enroll New Student
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEnrollmentForm(!showEnrollmentForm)}
            >
              {showEnrollmentForm ? 'Cancel' : 'Add Student'}
            </Button>
          </div>
        </CardHeader>
        {showEnrollmentForm && (
          <CardContent>
            <form onSubmit={handleEnrollStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Email
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="email"
                    value={enrollmentEmail}
                    onChange={(e) => setEnrollmentEmail(e.target.value)}
                    placeholder="Enter student email address"
                    required
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={enrolling || !enrollmentEmail.trim()}
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll'}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  The student must have an account with this email address
                </p>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {message && (
        <div className={`p-3 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Students Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Students ({filteredStudents.length})
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {student.avatar ? (
                      <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {student.email}
                      </span>
                      {student.phone && (
                        <span className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {student.phone}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Joined {new Date(student.joinedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submissions Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Assignment Submissions ({submissions.length})
          </h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading submissions...</div>
            </div>
          ) : submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{submission.assignmentTitle}</h4>
                        {getStatusBadge(submission.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Submitted by: {submission.studentName} ({submission.studentEmail})
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {submission.submittedAt && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                        )}
                        {submission.grade !== undefined && (
                          <span className="flex items-center">
                            <Award className="w-3 h-3 mr-1" />
                            Grade: {submission.grade}%
                          </span>
                        )}
                      </div>
                      {submission.feedback && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <strong>Feedback:</strong> {submission.feedback}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {submission.submission_file && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadSubmission(submission)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openGradingModal(submission)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {submission.status === 'graded' ? 'View/Edit Grade' : 'Grade'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
              <p className="text-gray-500">Student submissions will appear here once they submit their assignments.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grading Modal */}
      {showGradingModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Grade Submission</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowGradingModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignment
                  </label>
                  <p className="text-sm text-gray-900">{selectedSubmission.assignmentTitle}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student
                  </label>
                  <p className="text-sm text-gray-900">{selectedSubmission.studentName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade (%)
                  </label>
                  <Input
                    type="number"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="0-100"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback for the student..."
                    rows={3}
                    className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => setShowGradingModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="button"
                    onClick={handleGradeSubmission}
                    disabled={gradingLoading || !grade}
                  >
                    {gradingLoading ? 'Grading...' : 'Submit Grade'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentList;

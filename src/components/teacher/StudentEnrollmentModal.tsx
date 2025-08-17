import { useState } from 'react';
import { X, UserPlus, Users, Mail } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface StudentEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnrollStudent: (email: string) => Promise<void>;
  onRemoveStudent: (studentId: string) => Promise<void>;
  students: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

const StudentEnrollmentModal = ({ 
  isOpen, 
  onClose, 
  onEnrollStudent, 
  onRemoveStudent, 
  students 
}: StudentEnrollmentModalProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await onEnrollStudent(email.trim());
      setSuccess('Student enrolled successfully!');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll student');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName} from this course?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await onRemoveStudent(studentId);
      setSuccess('Student removed successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove student');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Manage Students</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Enroll New Student */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">Enroll New Student</h3>
            <form onSubmit={handleEnrollStudent} className="flex space-x-3">
              <div className="flex-1">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter student email"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enrolling...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Enroll
                  </div>
                )}
              </Button>
            </form>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Enrolled Students */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">
              Enrolled Students ({students.length})
            </h3>
            {students.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No students enrolled yet</p>
                <p className="text-sm">Use the form above to enroll students by email</p>
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveStudent(student.id, student.name)}
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentEnrollmentModal;

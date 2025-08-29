import React from 'react';
import { X, Calendar, FileText, Award, CheckCircle, Upload } from 'lucide-react';
import { Assignment } from '../../types';
import Button from '../ui/Button';

interface AssignmentDetailsModalProps {
  assignment: Assignment;
  isOpen: boolean;
  onClose: () => void;
}

const AssignmentDetailsModal: React.FC<AssignmentDetailsModalProps> = ({
  assignment,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const getStatusDisplay = () => {
    if (assignment.user_submission_status === 'submitted') {
      return <span className="flex items-center text-green-600"><CheckCircle size={16} className="mr-1" /> Submitted</span>;
    } else if (assignment.user_submission_status === 'graded') {
      return <span className="flex items-center text-blue-600"><CheckCircle size={16} className="mr-1" /> Graded ({assignment.user_submission_grade}%)</span>;
    } else {
      return <span className="flex items-center text-blue-600"><FileText size={16} className="mr-1" /> Regular Assignment</span>;
    }
  };

  const getDueDateDisplay = () => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    const isOverdue = dueDate < now;
    
    return (
      <div className={`flex items-center ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
        <Calendar size={16} className="mr-1" />
        Due: {dueDate.toLocaleDateString()}
        {isOverdue && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Overdue</span>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{assignment.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{assignment.courseName}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Assignment Type and Status */}
          <div className="flex items-center justify-between mb-6">
            {getStatusDisplay()}
            <div className="flex items-center text-gray-600">
              <Award size={16} className="mr-1" />
              Max Grade: {assignment.maxGrade}%
            </div>
          </div>

          {/* Due Date */}
          <div className="mb-6">
            {getDueDateDisplay()}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Assignment Description</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
            </div>
          </div>

          {/* Submission Status */}
          {assignment.user_submission_status && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Your Submission</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800">
                    {assignment.user_submission_status === 'submitted' 
                      ? `Assignment submitted on ${assignment.user_submitted_at ? new Date(assignment.user_submitted_at).toLocaleDateString() : 'Unknown date'}`
                      : assignment.user_submission_status === 'graded'
                        ? `Assignment graded: ${assignment.user_submission_grade}%`
                        : 'Assignment submitted'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submission Statistics */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Class Statistics</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-800">
                  {assignment.submission_count} student{assignment.submission_count !== 1 ? 's have' : ' has'} submitted this assignment
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">How to Submit</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ol className="text-sm text-yellow-800 space-y-2">
                <li>1. Prepare your assignment file (PDF, DOC, DOCX, TXT, or image files)</li>
                <li>2. Make sure your file is under 10MB</li>
                <li>3. Use the file upload section in the assignment card to submit</li>
                <li>4. You can only submit once per assignment</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button
            variant="primary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailsModal;

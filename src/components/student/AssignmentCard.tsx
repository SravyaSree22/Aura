import React, { useState, useRef } from 'react';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { Calendar, Clock, FileText, Upload, CheckCircle } from 'lucide-react';
import { Assignment } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface AssignmentCardProps {
  assignment: Assignment;
  onViewDetails: () => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onViewDetails }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { submitAssignment } = useData();
  const { currentUser } = useAuth();

  const getStatusDisplay = () => {
    // Check if user has submitted this assignment
    if (assignment.user_submission_status === 'submitted') {
      return <span className="flex items-center text-green-600"><CheckCircle size={16} className="mr-1" /> Submitted</span>;
    } else if (assignment.user_submission_status === 'graded') {
      return <span className="flex items-center text-blue-600"><CheckCircle size={16} className="mr-1" /> Graded ({assignment.user_submission_grade}%)</span>;
    } else if (assignment.assignment_type === 'quiz') {
      return <span className="flex items-center text-purple-600"><FileText size={16} className="mr-1" /> Quiz Assignment</span>;
    } else {
      return <span className="flex items-center text-blue-600"><FileText size={16} className="mr-1" /> Regular Assignment</span>;
    }
  };

  const getDueDateDisplay = () => {
    // If assignment is submitted or graded, show submission status instead of due date
    if (assignment.user_submission_status === 'submitted' || assignment.user_submission_status === 'graded') {
      if (assignment.user_submitted_at) {
        return <span className="flex items-center text-green-600"><CheckCircle size={16} className="mr-1" /> Submitted on {new Date(assignment.user_submitted_at).toLocaleDateString()}</span>;
      } else {
        return <span className="flex items-center text-green-600"><CheckCircle size={16} className="mr-1" /> Submitted</span>;
      }
    }
    
    // For pending assignments, show due date logic
    const dueDate = new Date(assignment.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className="flex items-center text-red-600"><Clock size={16} className="mr-1" /> Overdue</span>;
    } else if (diffDays === 0) {
      return <span className="flex items-center text-orange-600"><Clock size={16} className="mr-1" /> Due Today</span>;
    } else if (diffDays <= 3) {
      return <span className="flex items-center text-orange-600"><Clock size={16} className="mr-1" /> Due in {diffDays} days</span>;
    } else {
      return <span className="flex items-center text-gray-600"><Calendar size={16} className="mr-1" /> Due {dueDate.toLocaleDateString()}</span>;
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      setMessage({ 
        type: 'error', 
        text: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` 
      });
      return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ 
        type: 'error', 
        text: 'File size too large. Maximum size is 10MB' 
      });
      return;
    }
    
    setSelectedFile(file);
    setMessage(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file to submit' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await submitAssignment(assignment.id, selectedFile);
      setMessage({ type: 'success', text: 'Assignment submitted successfully!' });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to submit assignment' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
            <p className="text-sm text-gray-600">{assignment.courseName}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{assignment.maxGrade}%</div>
            <div className="text-xs text-gray-500">Max Grade</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{assignment.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          {getStatusDisplay()}
          {getDueDateDisplay()}
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm mb-4 ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {assignment.assignment_type === 'regular' && currentUser?.role === 'student' && !assignment.user_submission_status && (
          <div className="mb-4">
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : selectedFile 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your file here, or{' '}
                    <button type="button" onClick={openFileDialog} className="text-blue-600 hover:text-blue-800 underline">browse</button>
                  </p>
                  <p className="text-xs text-gray-500">Supported: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (max 10MB)</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" onChange={handleFileInputChange} accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif" className="hidden" />
            {selectedFile && (
              <div className="mt-3">
                <Button variant="primary" size="sm" onClick={handleSubmitAssignment} disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </div>
            )}
          </div>
        )}

        {assignment.assignment_type === 'regular' && currentUser?.role === 'student' && assignment.user_submission_status && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
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
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {assignment.submission_count} submission{assignment.submission_count !== 1 ? 's' : ''}
          </div>
          
          <Button 
            variant="primary" 
            size="sm"
            onClick={onViewDetails}
          >
            {assignment.assignment_type === 'quiz' ? 'Take Quiz' : 'View Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentCard;

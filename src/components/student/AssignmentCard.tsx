import React from 'react';
import { Assignment } from '../../types';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { CircleAlert, Calendar, Check, Clock } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface AssignmentCardProps {
  assignment: Assignment;
}

const AssignmentCard = ({ assignment }: AssignmentCardProps) => {
  const { submitAssignment } = useData();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const getDaysRemaining = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const daysRemaining = getDaysRemaining(assignment.dueDate);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitAssignment(assignment.id);
      // The DataContext will handle updating the assignment status
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusDisplay = () => {
    switch(assignment.status) {
      case 'pending':
        return <span className="flex items-center text-yellow-600"><CircleAlert size={16} className="mr-1" /> Due Soon</span>;
      case 'submitted':
        return <span className="flex items-center text-blue-600"><Check size={16} className="mr-1" /> Submitted</span>;
      case 'graded':
        return <span className="flex items-center text-green-600"><Check size={16} className="mr-1" /> Graded: {assignment.grade}%</span>;
    }
  };
  
  return (
    <Card hoverEffect className="h-full border-l-4" style={{ borderLeftColor: assignment.color }}>
      <CardContent>
        <div className="font-medium text-gray-900 mb-2">{assignment.title}</div>
        <div className="text-sm text-gray-500 mb-3">{assignment.courseName}</div>
        
        <div className="text-sm text-gray-600 mb-4">{assignment.description}</div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar size={14} className="mr-1" />
            {formatDate(assignment.dueDate)}
          </div>
          
          <div className="flex items-center text-xs">
            {assignment.status === 'pending' ? (
              <div className={`flex items-center ${daysRemaining <= 3 ? 'text-red-600' : 'text-gray-600'}`}>
                <Clock size={14} className="mr-1" />
                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Due today'}
              </div>
            ) : getStatusDisplay()}
          </div>
        </div>
        
        {assignment.status === 'pending' && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Submit Assignment
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentCard;

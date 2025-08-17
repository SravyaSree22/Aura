
import { Grade } from '../../types';
import Card, { CardContent } from '../ui/Card';

interface GradeCardProps {
  grade: Grade;
}

const GradeCard = ({ grade }: GradeCardProps) => {
  const percentage = (grade.value / grade.maxValue) * 100;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  let bgColor = 'bg-green-100';
  let textColor = 'text-green-800';
  
  if (percentage < 60) {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
  } else if (percentage < 80) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
  }
  
  return (
    <Card hoverEffect className="h-full">
      <CardContent>
        <div className="flex justify-between items-start mb-2">
          <div className="font-medium text-gray-900">{grade.title}</div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            {percentage.toFixed(1)}%
          </span>
        </div>
        <div className="text-sm text-gray-500 mb-3">{grade.courseName}</div>
        
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        
        {grade.feedback && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <p className="text-blue-800">
              <strong>Feedback:</strong> {grade.feedback}
            </p>
          </div>
        )}
        
        <div className="mt-3 text-xs text-gray-500">
          {formatDate(grade.date)}
        </div>
      </CardContent>
    </Card>
  );
};

export default GradeCard;

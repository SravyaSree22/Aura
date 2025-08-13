
import { StudentStats } from '../../types';
import Card, { CardHeader, CardContent } from '../ui/Card';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface StudentListProps {
  students: StudentStats[];
}

const StudentList = ({ students }: StudentListProps) => {
  // Sort students by average grade (descending)
  const sortedStudents = [...students].sort((a, b) => b.averageGrade - a.averageGrade);
  
  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="font-medium text-gray-900">Student Performance</h3>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Grade
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emotional Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStudents.map((student) => {
                const trendDirection = student.trend[student.trend.length - 1] >= student.trend[student.trend.length - 2];
                
                return (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`font-medium ${student.averageGrade >= 80 ? 'text-green-600' : student.averageGrade >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {student.averageGrade.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`font-medium ${student.attendanceRate >= 0.9 ? 'text-green-600' : student.attendanceRate >= 0.7 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {(student.attendanceRate * 100).toFixed(0)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        <div className="w-5 h-2 bg-green-200 rounded-sm" style={{ width: `${student.emotionalStatus.normal}%` }}></div>
                        <div className="w-5 h-2 bg-blue-200 rounded-sm" style={{ width: `${student.emotionalStatus.focused}%` }}></div>
                        <div className="w-5 h-2 bg-orange-200 rounded-sm" style={{ width: `${student.emotionalStatus.tired}%` }}></div>
                        <div className="w-5 h-2 bg-red-200 rounded-sm" style={{ width: `${student.emotionalStatus.stressed}%` }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {trendDirection ? (
                          <TrendingUp size={16} className="text-green-500 mr-1" />
                        ) : (
                          <TrendingDown size={16} className="text-red-500 mr-1" />
                        )}
                        <div className="text-sm">
                          {trendDirection ? 'Improving' : 'Declining'}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentList;

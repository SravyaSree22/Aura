
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ChartData,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import Card, { CardHeader, CardContent } from '../ui/Card';
import { StudentStats } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceChartProps {
  students: StudentStats[];
}

const PerformanceChart = ({ students }: PerformanceChartProps) => {
  // Calculate average performance trends across all students
  const calculateAverageTrend = () => {
    const result = Array(students[0]?.trend.length || 0).fill(0);
    
    for (const student of students) {
      student.trend.forEach((val, idx) => {
        result[idx] += val / students.length;
      });
    }
    
    return result;
  };
  
  const averageTrend = calculateAverageTrend();
  
  // Prepare line chart data
  const lineChartData: ChartData<'line'> = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
    datasets: [
      {
        label: 'Class Average',
        data: averageTrend,
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        tension: 0.3,
      },
      ...students.slice(0, 3).map((student, index) => {
        const colors = [
          { border: 'rgb(249, 115, 22)', bg: 'rgba(249, 115, 22, 0.5)' },
          { border: 'rgb(16, 185, 129)', bg: 'rgba(16, 185, 129, 0.5)' },
          { border: 'rgb(139, 92, 246)', bg: 'rgba(139, 92, 246, 0.5)' },
        ];
        
        return {
          label: student.name,
          data: student.trend,
          borderColor: colors[index].border,
          backgroundColor: colors[index].bg,
          tension: 0.3,
        };
      }),
    ],
  };
  
  // Prepare emotion distribution data
  const emotionData = {
    labels: ['Normal', 'Focused', 'Tired', 'Stressed'],
    datasets: [
      {
        label: 'Emotion Distribution',
        data: [
          students.reduce((sum, student) => sum + student.emotionalStatus.normal, 0) / students.length,
          students.reduce((sum, student) => sum + student.emotionalStatus.focused, 0) / students.length,
          students.reduce((sum, student) => sum + student.emotionalStatus.tired, 0) / students.length,
          students.reduce((sum, student) => sum + student.emotionalStatus.stressed, 0) / students.length,
        ],
        backgroundColor: [
          'rgba(107, 114, 128, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
      },
    ],
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <h3 className="font-medium text-gray-900">Performance Trends</h3>
        </CardHeader>
        <CardContent>
          <Line 
            data={lineChartData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                },
              },
              scales: {
                y: {
                  min: 0,
                  max: 100,
                  ticks: {
                    callback: function(value) {
                      return value + '%';
                    }
                  }
                }
              }
            }}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <h3 className="font-medium text-gray-900">Emotional Status Distribution</h3>
        </CardHeader>
        <CardContent>
          <Bar 
            data={emotionData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `${context.dataset.label}: ${context.raw}%`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    callback: function(value) {
                      return value + '%';
                    }
                  }
                }
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceChart;

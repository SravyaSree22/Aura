import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  X, 
  ChevronUp, 
  ChevronDown
} from 'lucide-react';
import { apiService } from '../services/api';
import { StudentStats } from '../types';

// Chart components
const GradeDistributionChart = ({ students: _students }: { students: StudentStats[] }) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-medium text-gray-900">Grade Distribution</h3>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {/* Chart would go here */}
          <div className="flex items-center justify-center h-full text-gray-500">
            Chart Component
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AttendanceTrendChart = ({ students: _students }: { students: StudentStats[] }) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-medium text-gray-900">Attendance Trends</h3>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {/* Chart would go here */}
          <div className="flex items-center justify-center h-full text-gray-500">
            Chart Component
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmotionalStatusChart = ({ students: _students }: { students: StudentStats[] }) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-medium text-gray-900">Emotional Status</h3>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {/* Chart would go here */}
          <div className="flex items-center justify-center h-full text-gray-500">
            Chart Component
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PerformanceComparisonChart = ({ students: _students }: { students: StudentStats[] }) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-medium text-gray-900">Performance Comparison</h3>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {/* Chart would go here */}
          <div className="flex items-center justify-center h-full text-gray-500">
            Chart Component
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StudentsPage = () => {
  const { studentStats } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'charts'>('charts');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: 'password123' // Default password
  });
  
  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let filtered = studentStats.filter((student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter((student) => {
        switch (selectedFilter) {
          case 'high-performers':
            return student.averageGrade >= 80;
          case 'needs-improvement':
            return student.averageGrade < 60;
          case 'good-attendance':
            return student.attendanceRate >= 90;
          case 'low-attendance':
            return student.attendanceRate < 70;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [studentStats, searchTerm, selectedFilter, sortField, sortDirection]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await apiService.createStudent(newStudent);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setNewStudent({ name: '', email: '', password: 'password123' });
      setShowAddModal(false);
      setMessage({ type: 'success', text: 'Student added successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
      
      // Refresh the page to show new student
      window.location.reload();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to add student' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportStudents = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await apiService.exportStudents();
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Create CSV content
      const csvContent = response.data as string;
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students_export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: 'Students exported successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to export students' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (studentStats.length === 0) return null;
    
    const avgGrade = studentStats.reduce((sum, s) => sum + s.averageGrade, 0) / studentStats.length;
    const avgAttendance = studentStats.reduce((sum, s) => sum + s.attendanceRate, 0) / studentStats.length;
    const totalAssignments = studentStats.reduce((sum, s) => sum + s.assignmentsCompleted, 0);
    
    return {
      totalStudents: studentStats.length,
      averageGrade: avgGrade,
      averageAttendance: avgAttendance,
      totalAssignments
    };
  }, [studentStats]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === 'charts' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('charts')}
          >
            Charts
          </Button>
          <Button 
            variant={viewMode === 'table' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportStudents} disabled={isLoading}>
            <Download className="w-4 h-4 mr-1" />
            Export
            {isLoading && <span className="ml-2">Exporting...</span>}
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)} disabled={isLoading}>
            <Plus className="w-4 h-4 mr-1" />
            Add Student
            {isLoading && <span className="ml-2">Adding...</span>}
          </Button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Summary Statistics */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{summaryStats.totalStudents}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{summaryStats.averageGrade.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Average Grade</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{(summaryStats.averageAttendance * 100).toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Average Attendance</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{summaryStats.totalAssignments}</div>
              <div className="text-sm text-gray-600">Total Assignments</div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === 'charts' ? (
        // Charts View
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GradeDistributionChart students={filteredStudents} />
            <AttendanceTrendChart students={filteredStudents} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmotionalStatusChart students={filteredStudents} />
            <PerformanceComparisonChart students={filteredStudents} />
          </div>
        </div>
      ) : (
        // Table View
        <Card>
          <CardHeader className="border-b border-gray-200">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-gray-100' : ''}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Filter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleSort(sortField)}
                >
                  {sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                  Sort: {sortField.charAt(0).toUpperCase() + sortField.slice(1)}
                </Button>
              </div>
            </div>
            
            {showFilters && (
              <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-gray-200 animate-slideDown">
                <Button 
                  variant={selectedFilter === 'all' ? 'primary' : 'outline'} 
                  size="sm"
                  onClick={() => setSelectedFilter('all')}
                >
                  All Students
                </Button>
                <Button 
                  variant={selectedFilter === 'high' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('high')}
                >
                  High Performers
                </Button>
                <Button 
                  variant={selectedFilter === 'medium' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('medium')}
                >
                  Average Performers
                </Button>
                <Button 
                  variant={selectedFilter === 'low' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('low')}
                >
                  Needs Improvement
                </Button>
                <Button 
                  variant={selectedFilter === 'attendance' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('attendance')}
                >
                  Attendance Issues
                </Button>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort('name')}
                    >
                      <div className="flex items-center">
                        Student
                        {sortField === 'name' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort('grade')}
                    >
                      <div className="flex items-center">
                        Average Grade
                        {sortField === 'grade' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort('attendance')}
                    >
                      <div className="flex items-center">
                        Attendance
                        {sortField === 'attendance' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Emotional Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            <span className="text-gray-600 font-medium">{student.name.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">student{student.id}@example.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          student.averageGrade >= 80 ? 'text-green-600' : 
                          student.averageGrade >= 60 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {student.averageGrade.toFixed(1)}%
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className={`h-1.5 rounded-full ${
                              student.averageGrade >= 80 ? 'bg-green-500' : 
                              student.averageGrade >= 60 ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`}
                            style={{ width: `${student.averageGrade}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          student.attendanceRate >= 0.9 ? 'text-green-600' : 
                          student.attendanceRate >= 0.7 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {(student.attendanceRate * 100).toFixed(0)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-1">
                          <div className="w-6 h-2 bg-blue-200 rounded-sm" style={{ width: `${student.emotionalStatus.focused}%` }}></div>
                          <div className="w-6 h-2 bg-green-200 rounded-sm" style={{ width: `${student.emotionalStatus.normal}%` }}></div>
                          <div className="w-6 h-2 bg-orange-200 rounded-sm" style={{ width: `${student.emotionalStatus.tired}%` }}></div>
                          <div className="w-6 h-2 bg-red-200 rounded-sm" style={{ width: `${student.emotionalStatus.stressed}%` }}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button variant="outline" size="sm">View Profile</Button>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        No students found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add New Student</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  placeholder="Enter student name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password (Default: password123)
                </label>
                <Input
                  type="password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                  placeholder="Enter password"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddStudent}
                disabled={isLoading}
              >
                Add Student
                {isLoading && <span className="ml-2">Adding...</span>}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default StudentsPage;

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Download, Filter, Plus, Search, Squircle, X } from 'lucide-react';

const StudentsPage = () => {
  const { studentStats } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    grade: '',
    attendance: ''
  });
  
  // Filter and sort students
  const filteredStudents = studentStats.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'high') return matchesSearch && student.averageGrade >= 80;
    if (selectedFilter === 'medium') return matchesSearch && student.averageGrade >= 60 && student.averageGrade < 80;
    if (selectedFilter === 'low') return matchesSearch && student.averageGrade < 60;
    if (selectedFilter === 'attendance') return matchesSearch && student.attendanceRate < 0.8;
    
    return matchesSearch;
  });
  
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    
    if (sortField === 'grade') {
      return sortDirection === 'asc'
        ? a.averageGrade - b.averageGrade
        : b.averageGrade - a.averageGrade;
    }
    
    if (sortField === 'attendance') {
      return sortDirection === 'asc'
        ? a.attendanceRate - b.attendanceRate
        : b.attendanceRate - a.attendanceRate;
    }
    
    return 0;
  });
  
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddStudent = () => {
    // In a real app, this would make an API call to create a new student
    alert('Student added successfully! (This is a demo - in a real app, this would create a new student in the database)');
    setShowAddModal(false);
    setNewStudent({ name: '', email: '', grade: '', attendance: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Student
          </Button>
        </div>
      </div>
      
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
                <Squircle className="w-4 h-4 mr-1" />
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
                {sortedStudents.map((student) => (
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
                
                {sortedStudents.length === 0 && (
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
                  Initial Grade (%)
                </label>
                <Input
                  type="number"
                  value={newStudent.grade}
                  onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})}
                  placeholder="Enter initial grade"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendance Rate (%)
                </label>
                <Input
                  type="number"
                  value={newStudent.attendance}
                  onChange={(e) => setNewStudent({...newStudent, attendance: e.target.value})}
                  placeholder="Enter attendance rate"
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
              >
                Add Student
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
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

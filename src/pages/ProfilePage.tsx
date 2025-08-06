import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Camera, Mail, Phone, Save, User } from 'lucide-react';
import { useData } from '../context/DataContext';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const { badges, grades } = useData();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state - in a real app, this would be properly typed
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '(555) 123-4567', // User data
    bio: 'Educational enthusiast passionate about continuous learning and growth.', // User data
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSave = () => {
    // In a real app, this would call an API to update user profile
    setIsEditing(false);
    alert('Profile updated successfully!');
  };
  
  // Calculate average grade
  const averageGrade = grades.length > 0
    ? grades.reduce((sum, grade) => sum + (grade.value / grade.maxValue) * 100, 0) / grades.length
    : 0;
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src={currentUser?.avatar} 
                      alt={currentUser?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
                    <Camera size={16} />
                  </button>
                </div>
                
                <h2 className="mt-4 text-xl font-bold text-gray-900">{currentUser?.name}</h2>
                <p className="text-gray-500 capitalize">{currentUser?.role}</p>
                
                <div className="mt-6 w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">Overall Performance</span>
                    <span className="text-sm font-medium text-indigo-600">{averageGrade.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${averageGrade}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                  <div className="bg-indigo-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-indigo-600">{badges.length}</div>
                    <div className="text-xs text-gray-500">Badges Earned</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {currentUser?.role === 'student' ? '4' : '3'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {currentUser?.role === 'student' ? 'Courses Enrolled' : 'Courses Teaching'}
                    </div>
                  </div>
                </div>
                
                {!isEditing && (
                  <Button 
                    variant="outline" 
                    className="mt-6 w-full"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Badges */}
          <Card>
            <CardHeader>
              <h3 className="font-medium text-gray-900">Badges & Achievements</h3>
            </CardHeader>
            <CardContent>
              {badges.length > 0 ? (
                <div className="space-y-4">
                  {badges.map((badge) => (
                    <div key={badge.id} className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-2xl mr-3">{badge.icon}</div>
                      <div>
                        <div className="font-medium">{badge.title}</div>
                        <div className="text-xs text-gray-500">{badge.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No badges earned yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900">Personal Information</h3>
                {isEditing && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary"
                      onClick={handleSave}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        icon={<User size={16} />}
                        fullWidth
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        icon={<Mail size={16} />}
                        fullWidth
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        icon={<Phone size={16} />}
                        fullWidth
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <Input
                        type="text"
                        value={currentUser?.role || ''}
                        disabled
                        fullWidth
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Full Name</div>
                      <div className="text-base">{currentUser?.name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Email Address</div>
                      <div className="text-base">{currentUser?.email}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Phone Number</div>
                      <div className="text-base">{formData.phone}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Role</div>
                      <div className="text-base capitalize">{currentUser?.role}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Bio</div>
                    <div className="text-base">{formData.bio}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Academic History or Teaching Stats */}
          <Card>
            <CardHeader>
              <h3 className="font-medium text-gray-900">
                {currentUser?.role === 'student' ? 'Academic History' : 'Teaching Statistics'}
              </h3>
            </CardHeader>
            <CardContent>
              {currentUser?.role === 'student' ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Instructor
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {grades.slice(0, 3).map((grade, index) => (
                          <tr key={grade.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{grade.courseName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{['Dr. Sarah Chen', 'Prof. Michael Rodriguez', 'Dr. Emily Zhang'][index % 3]}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium ${
                                (grade.value / grade.maxValue) * 100 >= 80 ? 'text-green-600' : 
                                (grade.value / grade.maxValue) * 100 >= 60 ? 'text-yellow-600' : 
                                'text-red-600'
                              }`}>
                                {((grade.value / grade.maxValue) * 100).toFixed(1)}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Completed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-blue-600">127</div>
                    <div className="text-sm text-gray-600">Students Taught</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-purple-600">24</div>
                    <div className="text-sm text-gray-600">Classes Conducted</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-green-600">4.8</div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

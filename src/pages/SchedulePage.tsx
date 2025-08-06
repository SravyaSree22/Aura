import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ChevronLeft, ChevronRight, Clock, Plus, Edit, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Schedule } from '../types';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = ['8:00 AM', '9:30 AM', '11:00 AM', '12:30 PM', '2:00 PM', '3:30 PM', '5:00 PM'];
const scheduleTypes = ['Lecture', 'Lab', 'Seminar', 'Tutorial', 'Workshop'];

const SchedulePage = () => {
  const { schedules, courses, createSchedule, updateSchedule, deleteSchedule } = useData();
  const { currentUser } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week, 1 = next week, -1 = last week
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    courseId: '',
    day: 'Monday',
    time: '9:30 AM',
    type: 'Lecture',
    room: ''
  });
  
  const getWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    // Adjust to Monday of current week
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? 6 : currentDay - 1; // If Sunday, go back 6 days, otherwise go back to Monday
    startOfWeek.setDate(today.getDate() - diff + (currentWeek * 7));
    
    return days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return {
        day,
        date: date.getDate(),
        month: date.toLocaleString('default', { month: 'short' }),
        isToday: date.toDateString() === today.toDateString()
      };
    });
  };
  
  const weekDates = getWeekDates();
  
  const getEvent = (day: string, time: string) => {
    return schedules.find(event => event.day === day && event.time === time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, formData.day, formData.time, formData.type, formData.room);
      } else {
        await createSchedule(formData.courseId, formData.day, formData.time, formData.type, formData.room);
      }
      setShowEventModal(false);
      setEditingSchedule(null);
      setFormData({
        courseId: '',
        day: 'Monday',
        time: '9:30 AM',
        type: 'Lecture',
        room: ''
      });
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      courseId: schedule.courseId,
      day: schedule.day,
      time: schedule.time,
      type: schedule.type,
      room: schedule.room || ''
    });
    setShowEventModal(true);
  };

  const handleDelete = async (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule event?')) {
      try {
        await deleteSchedule(scheduleId);
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingSchedule(null);
    setFormData({
      courseId: '',
      day: 'Monday',
      time: '9:30 AM',
      type: 'Lecture',
      room: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
        {currentUser?.role === 'teacher' && (
          <Button variant="primary" size="sm" onClick={() => setShowEventModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Event
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(currentWeek - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Week
          </Button>
          <span className="text-lg font-medium text-gray-900">
            {currentWeek === 0 ? 'Current Week' : 
             currentWeek > 0 ? `${currentWeek} Week${currentWeek > 1 ? 's' : ''} Ahead` : 
             `${Math.abs(currentWeek)} Week${Math.abs(currentWeek) > 1 ? 's' : ''} Ago`}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(currentWeek + 1)}
          >
            Next Week
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentWeek(0)}
        >
          Today
        </Button>
      </div>
      
      <Card className="overflow-hidden">
        <div className="grid grid-cols-6 divide-x divide-gray-200 border-b border-gray-200">
          <div className="p-4 bg-gray-50 font-medium text-gray-500 text-sm">
            Time
          </div>
          {weekDates.map((date) => (
            <div 
              key={date.day} 
              className={`p-4 text-center ${date.isToday ? 'bg-indigo-50' : 'bg-gray-50'}`}
            >
              <div className={`font-medium ${date.isToday ? 'text-indigo-600' : 'text-gray-600'}`}>{date.day}</div>
              <div className="text-sm text-gray-500">{date.month} {date.date}</div>
            </div>
          ))}
        </div>
        
        <div className="divide-y divide-gray-200">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-6 divide-x divide-gray-200">
              <div className="p-4 bg-gray-50 flex items-center">
                <Clock className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-600">{time}</span>
              </div>
              
              {days.map((day) => {
                const event = getEvent(day, time);
                return (
                  <div 
                    key={`${day}-${time}`} 
                    className={`p-2 min-h-[120px] relative ${event ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  >
                    {event && (
                      <div 
                        className="absolute inset-1 rounded-lg p-2 shadow-sm border border-gray-200 flex flex-col justify-between h-[calc(100%-8px)]"
                        style={{ backgroundColor: `${event.color}10`, borderLeftColor: event.color, borderLeftWidth: '3px' }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm leading-tight truncate" title={event.courseName}>
                            {event.courseName}
                          </div>
                          <div className="text-xs text-gray-600 truncate" title={`${event.courseCode} · ${event.type}`}>
                            {event.courseCode} · {event.type}
                          </div>
                          {event.room && (
                            <div className="text-xs text-gray-500 truncate" title={`Room: ${event.room}`}>
                              Room: {event.room}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-100">
                          <div className="text-xs text-gray-500 truncate flex-1 mr-2" title={event.teacher}>
                            {event.teacher}
                          </div>
                          {currentUser?.role === 'teacher' && (
                            <div className="flex space-x-1 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(event);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(event.id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
      
      {/* Add/Edit Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingSchedule ? 'Edit Schedule Event' : 'Add New Schedule Event'}
                </h3>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingSchedule && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course
                    </label>
                    <select
                      value={formData.courseId}
                      onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name} ({course.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day
                    </label>
                    <select
                      value={formData.day}
                      onChange={(e) => setFormData({...formData, day: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {days.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <select
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {scheduleTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room
                    </label>
                    <Input
                      type="text"
                      value={formData.room}
                      onChange={(e) => setFormData({...formData, room: e.target.value})}
                      placeholder="e.g., Room 101"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEventModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingSchedule ? 'Update Event' : 'Add Event'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
